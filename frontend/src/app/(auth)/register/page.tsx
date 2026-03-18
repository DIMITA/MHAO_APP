'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Role, RegisterResponse } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Prénom trop court'),
    lastName: z.string().min(2, 'Nom trop court'),
    email: z.string().email('Adresse email invalide'),
    phone: z
      .string()
      .min(8, 'Numéro de téléphone invalide')
      .regex(/^[+\d\s-]+$/, 'Format de téléphone invalide'),
    password: z.string().min(8, 'Au moins 8 caractères requis'),
    confirmPassword: z.string(),
    role: z.nativeEnum(Role),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'PROVIDER' ? Role.PROVIDER : Role.CLIENT;

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<Role>(defaultRole);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  const handleTabChange = (role: Role) => {
    setActiveTab(role);
    setValue('role', role);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword: _, ...payload } = data;
      const res = await authApi.register(payload as Record<string, unknown>);
      const response = res.data as RegisterResponse;
      toast.success('Compte créé! Vérifiez votre téléphone pour le code OTP.');
      router.push(
        `/verify-otp?userId=${response.user.id}&phone=${encodeURIComponent(data.phone)}`,
      );
    } catch (error) {
      toast.error((error as Error).message ?? "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Rejoignez MHAO gratuitement dès aujourd&apos;hui.
        </p>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
        {[
          { role: Role.CLIENT, label: 'Je suis client' },
          { role: Role.PROVIDER, label: 'Je suis prestataire' },
        ].map((tab) => (
          <button
            key={tab.role}
            type="button"
            onClick={() => handleTabChange(tab.role)}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.role
                ? 'bg-white text-primary-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('role')} />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prénom"
            placeholder="Jean"
            required
            leftIcon={<User className="h-4 w-4" />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Nom"
            placeholder="Dupont"
            required
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@exemple.com"
          required
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Téléphone"
          type="tel"
          placeholder="+229 XX XX XX XX"
          required
          leftIcon={<Phone className="h-4 w-4" />}
          helperText="Utilisé pour la vérification OTP et Mobile Money"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 caractères"
          required
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmer le mot de passe"
          type={showPassword ? 'text' : 'password'}
          placeholder="Répétez votre mot de passe"
          required
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
          {isSubmitting ? 'Création...' : 'Créer mon compte'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        En créant un compte, vous acceptez nos{' '}
        <Link href="/cgu" className="text-primary-600 hover:underline">
          CGU
        </Link>{' '}
        et notre{' '}
        <Link href="/privacy" className="text-primary-600 hover:underline">
          Politique de confidentialité
        </Link>
        .
      </p>

      <p className="mt-4 text-center text-sm text-gray-500">
        Déjà un compte?{' '}
        <Link href="/login" className="text-primary-600 font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-white rounded-2xl animate-pulse" />}>
      <RegisterForm />
    </Suspense>
  );
}
