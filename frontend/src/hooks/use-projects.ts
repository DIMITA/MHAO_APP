import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { Project, ProjectFilters, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery<PaginatedResponse<Project>>({
    queryKey: projectKeys.list(filters),
    queryFn: async () => {
      const res = await projectsApi.list(filters as Record<string, unknown>);
      return res.data;
    },
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const res = await projectsApi.get(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData | Record<string, unknown>) => {
      const res = await projectsApi.create(data);
      return res.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Projet créé avec succès!');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Erreur lors de la création du projet');
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await projectsApi.update(id, data);
      return res.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Projet mis à jour!');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Erreur lors de la mise à jour');
    },
  });
}
