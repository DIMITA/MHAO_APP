import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api';
import { Payment, InitiatePaymentFormData } from '@/types';
import toast from 'react-hot-toast';

export const paymentKeys = {
  all: ['payments'] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
  byProject: (projectId: string) => [...paymentKeys.all, 'project', projectId] as const,
};

export function usePayment(id: string) {
  return useQuery<Payment>({
    queryKey: paymentKeys.detail(id),
    queryFn: async () => {
      const res = await paymentsApi.get(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function usePaymentByProject(projectId: string) {
  return useQuery<Payment>({
    queryKey: paymentKeys.byProject(projectId),
    queryFn: async () => {
      const res = await paymentsApi.getByProject(projectId);
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InitiatePaymentFormData & { quoteId: string; projectId: string }) => {
      const res = await paymentsApi.initiate(data as Record<string, unknown>);
      return res.data as Payment;
    },
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.byProject(payment.projectId) });
      toast.success('Paiement initié avec succès!');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Erreur lors de l'initiation du paiement");
    },
  });
}

export function useReleaseMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, milestoneId }: { paymentId: string; milestoneId: string }) => {
      const res = await paymentsApi.releaseMilestone(paymentId, milestoneId);
      return res.data as Payment;
    },
    onSuccess: (_, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(paymentId) });
      toast.success('Jalon approuvé et paiement libéré!');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Erreur lors de l'approbation du jalon");
    },
  });
}
