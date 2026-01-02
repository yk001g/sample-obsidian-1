import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Contact from '@/lib/db/models/Contact';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // 簡易バリデーション
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: '必須項目が未入力です。' },
        { status: 400 }
      );
    }

    // DB接続
    await dbConnect();

    // DB保存
    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });
    await newContact.save();

    // メール送信設定
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 管理者へメール送信
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Contact Form" <no-reply@example.com>',
      to: process.env.EMAIL_TO || 'admin@example.com', // 管理者のメールアドレス
      subject: `[お問合せ] ${subject || '件名なし'}`,
      text: `
名前: ${name}
メールアドレス: ${email}
件名: ${subject}

本文:
${message}
      `,
      html: `
<p>ウェブサイトから新しいお問合せがありました。</p>
<ul>
  <li><strong>名前:</strong> ${name}</li>
  <li><strong>メールアドレス:</strong> ${email}</li>
  <li><strong>件名:</strong> ${subject}</li>
</ul>
<p><strong>本文:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'お問合せを受け付けました。' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
