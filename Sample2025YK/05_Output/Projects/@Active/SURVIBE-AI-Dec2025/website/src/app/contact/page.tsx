'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Paper
} from '@mui/material';

type Inputs = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

export default function ContactPage() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Inputs>();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '送信に失敗しました。');
            }

            setStatus('success');
            reset();
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    お問合せ
                </Typography>
                <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4 }}>
                    以下のフォームにご記入の上、送信してください。
                </Typography>

                {status === 'success' ? (
                    <Box textAlign="center">
                        <Alert severity="success" sx={{ mb: 2 }}>
                            お問合せを受け付けました。ご連絡ありがとうございます。
                        </Alert>
                        <Button variant="contained" onClick={() => setStatus('idle')}>
                            新しいお問合せを送る
                        </Button>
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Box display="flex" flexDirection="column" gap={3}>
                            <TextField
                                label="お名前"
                                fullWidth
                                required
                                {...register('name', { required: 'お名前は必須です' })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />

                            <TextField
                                label="メールアドレス"
                                fullWidth
                                required
                                type="email"
                                {...register('email', {
                                    required: 'メールアドレスは必須です',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: '正しいメールアドレス形式で入力してください',
                                    },
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />

                            <TextField
                                label="件名"
                                fullWidth
                                {...register('subject')}
                            />

                            <TextField
                                label="お問合せ内容"
                                fullWidth
                                required
                                multiline
                                rows={4}
                                {...register('message', { required: 'お問合せ内容は必須です' })}
                                error={!!errors.message}
                                helperText={errors.message?.message}
                            />

                            {status === 'error' && (
                                <Alert severity="error">{errorMessage}</Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={status === 'loading'}
                                startIcon={status === 'loading' ? <CircularProgress size={20} /> : null}
                            >
                                {status === 'loading' ? '送信中...' : '送信する'}
                            </Button>
                        </Box>
                    </form>
                )}
            </Paper>
        </Container>
    );
}
