'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSubmitQuote } from '@/hooks/use-quotes';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Project } from '@/types';

const schema = z.object({
  amount: z.coerce.number().min(1000, 'Montant minimum 1 000 XOF'),
  description: z.string().min(20, 'Description trop courte (min. 20 caractères)'),
  timelineDays: z.coerce.number().min(1, 'Minimum 1 jour').max(3650, 'Maximum 10 ans'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface QuoteFormProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export function QuoteForm({ project, open, onClose }: QuoteFormProps) {
  const { mutateAsync: submitQuote } = useSubmitQuote();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await submitQuote({ ...data, projectId: project.id });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Soumettre un devis"
      description={`Projet: ${project.title}`}
      size="lg"
    >
      {/* Project budget reference */}
      <div className="bg-orange-50 rounded-lg p-3 mb-5 text-sm">
        <p className="text-orange-800">
          <span className="font-medium">Budget client: </span>
          {formatCurrency(project.budgetMin)} – {formatCurrency(project.budgetMax)}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Montant proposé (XOF)"
          type="number"
          placeholder="1 500 000"
          required
          helperText="Votre prix total pour ce projet en Francs CFA"
          error={errors.amount?.message}
          {...register('amount')}
        />

        <Input
          label="Délai de réalisation (jours)"
          type="number"
          placeholder="30"
          required
          helperText="Nombre de jours calendaires pour terminer le projet"
          error={errors.timelineDays?.message}
          {...register('timelineDays')}
        />

        <Textarea
          label="Description de votre proposition"
          placeholder="Décrivez votre approche, les matériaux que vous utiliserez, les garanties offertes, votre expérience..."
          required
          rows={5}
          error={errors.description?.message}
          {...register('description')}
        />

        <Textarea
          label="Notes additionnelles"
          placeholder="Conditions particulières, questions pour le client..."
          rows={2}
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Envoi...' : 'Soumettre le devis'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
