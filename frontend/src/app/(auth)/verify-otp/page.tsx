'use client';

import { Suspense, useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';

const OTP_LENGTH = 6;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') ?? '';
  const phone = searchParams.get('phone') ?? '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newOtp = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      toast.error('Veuillez entrer le code complet à 6 chiffres');
      return;
    }
    setIsVerifying(true);
    try {
      await authApi.verifyOtp({ userId, code, purpose: 'verification' });
      toast.success('Téléphone vérifié avec succès!');
      router.push('/login');
    } catch (error) {
      toast.error((error as Error).message ?? 'Code incorrect ou expiré');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authApi.resendOtp({ userId, purpose: 'verification' });
      toast.success('Nouveau code envoyé!');
      setCountdown(60);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } catch (error) {
      toast.error((error as Error).message ?? "Erreur lors de l'envoi");
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-100 mb-6">
        <MessageSquare className="h-8 w-8 text-primary-500" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Vérification du téléphone</h1>
      <p className="text-gray-500 text-sm mb-1">Un code à 6 chiffres a été envoyé au</p>
      <p className="text-gray-900 font-semibold mb-8">{phone || 'votre téléphone'}</p>

      {/* OTP inputs */}
      <div className="flex gap-3 justify-center mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              'h-14 w-12 rounded-xl border-2 text-center text-xl font-bold transition-all',
              'focus:outline-none focus:ring-0',
              digit
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-gray-50 text-gray-900',
              'focus:border-primary-500 focus:bg-white',
            )}
          />
        ))}
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleVerify}
        isLoading={isVerifying}
        disabled={!isComplete || isVerifying}
      >
        {isVerifying ? 'Vérification...' : 'Vérifier le code'}
      </Button>

      <div className="mt-6">
        {countdown > 0 ? (
          <p className="text-sm text-gray-500">
            Renvoyer le code dans{' '}
            <span className="font-semibold text-primary-600">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sm font-medium text-primary-600 hover:underline disabled:opacity-50"
          >
            {isResending ? 'Envoi...' : 'Renvoyer le code'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="h-80 bg-white rounded-2xl animate-pulse" />}>
      <VerifyOtpForm />
    </Suspense>
  );
}
