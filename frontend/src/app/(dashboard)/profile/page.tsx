'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { usersApi, providersApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { KycStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { User, Building2, Shield, Lock, CheckCircle, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
});

const providerSchema = z.object({
  companyName: z.string().optional(),
  description: z.string().optional(),
  skillsInput: z.string().optional(),
  zonesInput: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8, 'Au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type ProviderForm = z.infer<typeof providerSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const KYC_CONFIG: Record<KycStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  [KycStatus.VERIFIED]: { label: 'KYC Vérifié', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  [KycStatus.PENDING]: { label: 'Vérification en cours', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  [KycStatus.REJECTED]: { label: 'Vérification rejetée', color: 'bg-red-100 text-red-800', icon: X },
};

export default function ProfilePage() {
  const { user, updateUser, isProvider } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'provider' | 'security'>('profile');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  const {
    register: registerProvider,
    handleSubmit: handleProviderSubmit,
    formState: { errors: providerErrors, isSubmitting: isProviderSubmitting },
  } = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      companyName: user?.profile?.companyName ?? '',
      description: user?.profile?.description ?? '',
      skillsInput: user?.profile?.skills?.join(', ') ?? '',
      zonesInput: user?.profile?.zonesServed?.join(', ') ?? '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => usersApi.updateProfile(data as Record<string, unknown>),
    onSuccess: (res) => {
      updateUser(res.data);
      toast.success('Profil mis à jour!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateProviderMutation = useMutation({
    mutationFn: (data: ProviderForm) => {
      const payload = {
        companyName: data.companyName,
        description: data.description,
        skills: data.skillsInput?.split(',').map((s) => s.trim()).filter(Boolean) ?? [],
        zonesServed: data.zonesInput?.split(',').map((s) => s.trim()).filter(Boolean) ?? [],
      };
      return providersApi.updateProfile(payload);
    },
    onSuccess: () => toast.success('Profil prestataire mis à jour!'),
    onError: (e: Error) => toast.error(e.message),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      usersApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      toast.success('Mot de passe modifié!');
      resetPassword();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) return null;

  const kycInfo = KYC_CONFIG[user.kycStatus];
  const KycIcon = kycInfo.icon;

  const tabs = [
    { key: 'profile' as const, label: 'Informations', icon: User },
    ...(isProvider ? [{ key: 'provider' as const, label: 'Prestataire', icon: Building2 }] : []),
    { key: 'security' as const, label: 'Sécurité', icon: Lock },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
          {getInitials(user.firstName, user.lastName)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 font-medium ${kycInfo.color}`}>
              <KycIcon className="h-3 w-3" />
              {kycInfo.label}
            </span>
            <span className="inline-flex items-center text-xs rounded-full px-2.5 py-0.5 font-medium bg-gray-100 text-gray-700 capitalize">
              {user.role.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile info */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  required
                  error={profileErrors.firstName?.message}
                  {...registerProfile('firstName')}
                />
                <Input
                  label="Nom"
                  required
                  error={profileErrors.lastName?.message}
                  {...registerProfile('lastName')}
                />
              </div>
              <Input
                label="Email"
                type="email"
                required
                error={profileErrors.email?.message}
                {...registerProfile('email')}
              />
              <Input
                label="Téléphone"
                type="tel"
                required
                error={profileErrors.phone?.message}
                {...registerProfile('phone')}
              />
              <div className="flex justify-end">
                <Button type="submit" isLoading={isProfileSubmitting || updateProfileMutation.isPending}>
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Provider info */}
      {activeTab === 'provider' && isProvider && (
        <Card>
          <CardHeader>
            <CardTitle>Profil prestataire</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleProviderSubmit((data) => updateProviderMutation.mutate(data))}
              className="space-y-4"
            >
              <Input
                label="Nom de l'entreprise"
                placeholder="Ex: BTP Koffi & Fils"
                error={providerErrors.companyName?.message}
                {...registerProvider('companyName')}
              />
              <Textarea
                label="Description / Présentation"
                placeholder="Décrivez votre expérience, vos spécialités et ce qui vous distingue..."
                rows={4}
                error={providerErrors.description?.message}
                {...registerProvider('description')}
              />
              <Input
                label="Compétences"
                placeholder="Construction, Plomberie, Électricité (séparées par des virgules)"
                helperText="Séparez chaque compétence par une virgule"
                error={providerErrors.skillsInput?.message}
                {...registerProvider('skillsInput')}
              />
              <Input
                label="Zones d'intervention"
                placeholder="Cotonou, Porto-Novo, Calavi (séparées par des virgules)"
                helperText="Séparez chaque zone par une virgule"
                error={providerErrors.zonesInput?.message}
                {...registerProvider('zonesInput')}
              />

              {/* Verification status */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Statut de vérification</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user.profile?.isVerified
                        ? 'Votre profil est vérifié par notre équipe.'
                        : "Votre profil est en cours de vérification par notre équipe."}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Badge status={user.profile?.isVerified ? 'VERIFIED' : 'PENDING'} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isProviderSubmitting || updateProviderMutation.isPending}>
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handlePasswordSubmit((data) => changePasswordMutation.mutate(data))}
              className="space-y-4"
            >
              <Input
                label="Mot de passe actuel"
                type="password"
                required
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />
              <Input
                label="Nouveau mot de passe"
                type="password"
                required
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />
              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                required
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isPasswordSubmitting || changePasswordMutation.isPending}
                >
                  Modifier le mot de passe
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
