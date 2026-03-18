import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '@/lib/api';
import { Quote, CreateQuoteFormData, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...quoteKeys.lists(), params] as const,
  byProject: (projectId: string) => [...quoteKeys.all, 'project', projectId] as const,
  detail: (id: string) => [...quoteKeys.all, 'detail', id] as const,
};

export function useQuotes(params: Record<string, unknown> = {}) {
  return useQuery<PaginatedResponse<Quote>>({
    queryKey: quoteKeys.list(params),
    queryFn: async () => {
      const res = await quotesApi.list(params);
      return res.data;
    },
  });
}

export function useProjectQuotes(projectId: string) {
  return useQuery<Quote[]>({
    queryKey: quoteKeys.byProject(projectId),
    queryFn: async () => {
      const res = await quotesApi.listByProject(projectId);
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useSubmitQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuoteFormData & { projectId: string }) => {
      const res = await quotesApi.submit(data as Record<string, unknown>);
      return res.data as Quote;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.byProject(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
      toast.success('Devis soumis avec succès!');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Erreur lors de la soumission du devis');
    },
  });
}

export function useAcceptQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, projectId }: { quoteId: string; projectId: string }) => {
      const res = await quotesApi.accept(quoteId);
      return { data: res.data as Quote, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
      toast.success('Devis accepté!');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Erreur lors de l'acceptation du devis");
    },
  });
}

export function useRejectQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, projectId }: { quoteId: string; projectId: string }) => {
      const res = await quotesApi.reject(quoteId);
      return { data: res.data as Quote, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
      toast.success('Devis refusé.');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Erreur lors du refus du devis');
    },
  });
}
