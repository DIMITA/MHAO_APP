'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, MapPin, ArrowLeft } from 'lucide-react';
import { useCreateProject } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ProjectMapPicker = dynamic(
  () => import('@/components/map/project-map').then((m) => m.ProjectMapPicker),
  { ssr: false, loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse" /> },
);

const schema = z
  .object({
    title: z.string().min(5, 'Titre trop court (min. 5 caractères)').max(100),
    description: z.string().min(20, 'Description trop courte (min. 20 caractères)').max(2000),
    category: z.string().min(1, 'Veuillez choisir une catégorie'),
    budgetMin: z.coerce.number().min(1000, 'Budget minimum trop bas'),
    budgetMax: z.coerce.number().min(1000, 'Budget maximum trop bas'),
    address: z.string().min(5, 'Adresse requise'),
    city: z.string().min(2),
    country: z.string().min(2),
    lat: z.coerce.number(),
    lng: z.coerce.number(),
  })
  .refine((d) => d.budgetMax >= d.budgetMin, {
    message: 'Le budget maximum doit être supérieur au minimum',
    path: ['budgetMax'],
  });

type FormData = z.infer<typeof schema>;

const categoryOptions = [
  { value: 'construction', label: 'Construction neuve' },
  { value: 'renovation', label: 'Rénovation' },
  { value: 'plomberie', label: 'Plomberie' },
  { value: 'electricite', label: 'Électricité' },
  { value: 'menuiserie', label: 'Menuiserie' },
  { value: 'peinture', label: 'Peinture' },
  { value: 'carrelage', label: 'Carrelage / Revêtements' },
  { value: 'toiture', label: 'Toiture' },
  { value: 'jardin', label: 'Jardin / Aménagement extérieur' },
  { value: 'general', label: 'Autre / Général' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { mutateAsync: createProject } = useCreateProject();
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      city: 'Cotonou',
      country: 'Bénin',
      lat: 6.3676,
      lng: 2.4252,
    },
  });

  const lat = watch('lat');
  const lng = watch('lng');

  const handleLocationSelect = (newLat: number, newLng: number) => {
    setValue('lat', newLat);
    setValue('lng', newLng);
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos autorisées');
      return;
    }
    const newFiles = files.slice(0, 5 - photos.length);
    setPhotos((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handlePhotoRemove = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    photos.forEach((photo) => formData.append('photos', photo));

    try {
      const project = await createProject(formData);
      router.push(`/dashboard/projects/${project.id}`);
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau projet</h1>
          <p className="text-gray-500 text-sm mt-0.5">Décrivez votre projet pour recevoir des devis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Titre du projet"
              placeholder="Ex: Rénovation complète appartement 80m²"
              required
              error={errors.title?.message}
              {...register('title')}
            />

            <Textarea
              label="Description détaillée"
              placeholder="Décrivez les travaux à réaliser, les matériaux souhaités, les contraintes particulières..."
              required
              rows={5}
              error={errors.description?.message}
              {...register('description')}
            />

            <Select
              label="Catégorie"
              required
              options={categoryOptions}
              placeholder="Choisissez une catégorie"
              error={errors.category?.message}
              {...register('category')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Budget minimum (XOF)"
                type="number"
                placeholder="500 000"
                required
                error={errors.budgetMin?.message}
                helperText="Montant en Francs CFA"
                {...register('budgetMin')}
              />
              <Input
                label="Budget maximum (XOF)"
                type="number"
                placeholder="2 000 000"
                required
                error={errors.budgetMax?.message}
                helperText="Montant en Francs CFA"
                {...register('budgetMax')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-500" />
              Localisation du chantier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Adresse"
              placeholder="Ex: Quartier Cadjèhoun, Rue des Cocotiers"
              required
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ville"
                required
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="Pays"
                required
                error={errors.country?.message}
                {...register('country')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Positionner sur la carte
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Cliquez pour ajuster la position)
                </span>
              </label>
              <ProjectMapPicker
                lat={lat}
                lng={lng}
                onLocationSelect={handleLocationSelect}
                className="h-64"
              />
              <div className="mt-1.5 grid grid-cols-2 gap-3">
                <Input
                  label="Latitude"
                  type="number"
                  step="0.000001"
                  error={errors.lat?.message}
                  {...register('lat')}
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="0.000001"
                  error={errors.lng?.message}
                  {...register('lng')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos du chantier</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Ajoutez jusqu&apos;à 5 photos pour mieux illustrer votre projet.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {photoPreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handlePhotoRemove(index)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-xs text-gray-500">Ajouter</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoAdd}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/projects">Annuler</Link>
          </Button>
          <Button type="submit" size="lg" isLoading={isSubmitting}>
            {isSubmitting ? 'Publication...' : 'Publier le projet'}
          </Button>
        </div>
      </form>
    </div>
  );
}
