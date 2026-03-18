'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  FolderOpen,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalProviders: number;
  totalProjects: number;
  totalRevenue: number;
  pendingVerifications: number;
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAdmin) router.push('/dashboard');
  }, [isAdmin, router]);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await adminApi.stats();
      return res.data;
    },
    enabled: isAdmin,
  });

  const { data: verifications, isLoading: verificationsLoading } = useQuery<
    Array<{
      id: string;
      userId: string;
      user: { firstName: string; lastName: string; email: string };
      companyName?: string;
      kycDocType?: string;
      createdAt: string;
    }>
  >({
    queryKey: ['admin', 'verifications'],
    queryFn: async () => {
      const res = await adminApi.pendingVerifications();
      return res.data;
    },
    enabled: isAdmin,
  });

  const { data: disputes, isLoading: disputesLoading } = useQuery<
    Array<{
      id: string;
      title: string;
      client: { firstName: string; lastName: string };
      createdAt: string;
    }>
  >({
    queryKey: ['admin', 'disputes'],
    queryFn: async () => {
      const res = await adminApi.disputes();
      return res.data;
    },
    enabled: isAdmin,
  });

  const verifyMutation = useMutation({
    mutationFn: (userId: string) => adminApi.verifyProvider(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Prestataire vérifié!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminApi.rejectProvider(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
      toast.success('Vérification rejetée.');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ projectId, resolution }: { projectId: string; resolution: string }) =>
      adminApi.resolveDispute(projectId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] });
      toast.success('Litige résolu.');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) return null;
  if (statsLoading) return <PageLoader />;

  const statCards = [
    { label: 'Utilisateurs totaux', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Projets publiés', value: stats?.totalProjects ?? 0, icon: FolderOpen, color: 'text-orange-600 bg-orange-50' },
    { label: 'Revenus totaux', value: formatCurrency(stats?.totalRevenue ?? 0), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Vérifications en attente', value: stats?.pendingVerifications ?? 0, icon: ShieldCheck, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-500 mt-1 text-sm">Tableau de bord administrateur MHAO</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending verifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary-500" />
              Vérifications en attente ({verifications?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationsLoading ? (
              <PageLoader />
            ) : !verifications?.length ? (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-green-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucune vérification en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {verifications.map((v) => (
                  <div key={v.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {v.user.firstName} {v.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{v.user.email}</p>
                        {v.companyName && (
                          <p className="text-xs text-gray-600 mt-0.5">{v.companyName}</p>
                        )}
                        {v.kycDocType && (
                          <p className="text-xs text-gray-400 mt-0.5">Doc: {v.kycDocType}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{formatDate(v.createdAt)}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="text-xs"
                          onClick={() => verifyMutation.mutate(v.userId)}
                          isLoading={verifyMutation.isPending}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Vérifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() =>
                            rejectMutation.mutate({
                              userId: v.userId,
                              reason: 'Documents insuffisants',
                            })
                          }
                          isLoading={rejectMutation.isPending}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active disputes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Litiges actifs ({disputes?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {disputesLoading ? (
              <PageLoader />
            ) : !disputes?.length ? (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-green-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun litige actif</p>
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="rounded-lg border border-red-100 bg-red-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{dispute.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Client: {dispute.client.firstName} {dispute.client.lastName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(dispute.createdAt)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex-shrink-0"
                        onClick={() =>
                          resolveMutation.mutate({
                            projectId: dispute.id,
                            resolution: 'Résolu par arbitrage administrateur',
                          })
                        }
                        isLoading={resolveMutation.isPending}
                      >
                        Résoudre
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Activité de la plateforme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center text-gray-400">
              <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Graphiques analytiques — À intégrer</p>
              <p className="text-xs mt-1">Chart.js / Recharts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
