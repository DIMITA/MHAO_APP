import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/validators.dart';
import '../models/project_model.dart';
import '../providers/projects_provider.dart';

class CreateProjectScreen extends ConsumerStatefulWidget {
  const CreateProjectScreen({super.key});

  @override
  ConsumerState<CreateProjectScreen> createState() =>
      _CreateProjectScreenState();
}

class _CreateProjectScreenState extends ConsumerState<CreateProjectScreen> {
  int _currentStep = 0;

  // Step 1
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  String? _selectedCategory;

  // Step 2
  double _budgetMin = 100000;
  double _budgetMax = 1000000;

  // Step 3
  double _lat = AppConstants.defaultLat;
  double _lng = AppConstants.defaultLng;
  final _addressController = TextEditingController();
  String? _selectedCity;
  final _mapController = MapController();

  // Step 4
  final List<XFile> _photos = [];
  final _picker = ImagePicker();

  final _step1Key = GlobalKey<FormState>();

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _addressController.dispose();
    _mapController.dispose();
    super.dispose();
  }

  bool _validateCurrentStep() {
    if (_currentStep == 0) {
      return _step1Key.currentState?.validate() ?? false;
    }
    return true;
  }

  void _next() {
    if (!_validateCurrentStep()) return;
    if (_currentStep < 3) {
      setState(() => _currentStep++);
    } else {
      _submit();
    }
  }

  void _previous() {
    if (_currentStep > 0) setState(() => _currentStep--);
  }

  Future<void> _pickImages() async {
    if (_photos.length >= AppConstants.maxProjectPhotos) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              'Maximum ${AppConstants.maxProjectPhotos} photos autorisées'),
        ),
      );
      return;
    }

    final List<XFile> picked = await _picker.pickMultiImage(
      maxWidth: 1920,
      maxHeight: 1080,
      imageQuality: 80,
    );

    setState(() {
      final remaining = AppConstants.maxProjectPhotos - _photos.length;
      _photos.addAll(picked.take(remaining));
    });
  }

  Future<void> _submit() async {
    if (_selectedCategory == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez choisir une catégorie')),
      );
      return;
    }

    final dto = CreateProjectDto(
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      category: _selectedCategory!,
      budgetMin: _budgetMin,
      budgetMax: _budgetMax,
      location: ProjectLocation(
        latitude: _lat,
        longitude: _lng,
        address: _addressController.text.trim().isEmpty
            ? null
            : _addressController.text.trim(),
        city: _selectedCity,
      ),
    );

    final project =
        await ref.read(createProjectProvider.notifier).createProject(dto);

    if (!mounted) return;

    if (project != null) {
      // Upload photos if any
      if (_photos.isNotEmpty) {
        await ref.read(createProjectProvider.notifier).uploadPhotos(
              project.id,
              _photos.map((f) => f.path).toList(),
            );
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Projet créé avec succès!'),
          backgroundColor: AppColors.secondary,
        ),
      );
      context.go(AppRoutes.projects);
    } else {
      final state = ref.read(createProjectProvider);
      if (state.hasError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(state.error.toString()),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final createState = ref.watch(createProjectProvider);
    final isLoading = createState.valueOrNull?.isLoading ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nouveau projet'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // Progress
          _ProjectStepper(currentStep: _currentStep),

          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                child: [
                  _Step1BasicInfo(
                    key: const ValueKey('step1'),
                    formKey: _step1Key,
                    titleController: _titleController,
                    descriptionController: _descriptionController,
                    selectedCategory: _selectedCategory,
                    onCategorySelected: (c) =>
                        setState(() => _selectedCategory = c),
                  ),
                  _Step2Budget(
                    key: const ValueKey('step2'),
                    budgetMin: _budgetMin,
                    budgetMax: _budgetMax,
                    onChanged: (min, max) =>
                        setState(() {
                          _budgetMin = min;
                          _budgetMax = max;
                        }),
                  ),
                  _Step3Location(
                    key: const ValueKey('step3'),
                    lat: _lat,
                    lng: _lng,
                    addressController: _addressController,
                    selectedCity: _selectedCity,
                    mapController: _mapController,
                    onLocationSelected: (lat, lng) =>
                        setState(() {
                          _lat = lat;
                          _lng = lng;
                        }),
                    onCitySelected: (c) =>
                        setState(() => _selectedCity = c),
                  ),
                  _Step4Photos(
                    key: const ValueKey('step4'),
                    photos: _photos,
                    onPickImages: _pickImages,
                    onRemovePhoto: (i) =>
                        setState(() => _photos.removeAt(i)),
                  ),
                ][_currentStep],
              ),
            ),
          ),

          // Navigation buttons
          _StepNavigation(
            currentStep: _currentStep,
            totalSteps: 4,
            isLoading: isLoading,
            onPrevious: _previous,
            onNext: _next,
          ),
        ],
      ),
    );
  }
}

// ── Progress stepper ──────────────────────────────────────────────────────────

class _ProjectStepper extends StatelessWidget {
  final int currentStep;
  static const steps = ['Infos', 'Budget', 'Lieu', 'Photos'];

  const _ProjectStepper({required this.currentStep});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      color: Colors.white,
      child: Column(
        children: [
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (currentStep + 1) / steps.length,
              backgroundColor: AppColors.divider,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(AppColors.primary),
              minHeight: 4,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(
              steps.length,
              (i) => Text(
                steps[i],
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 11,
                  fontWeight: i == currentStep
                      ? FontWeight.w600
                      : FontWeight.w400,
                  color: i == currentStep
                      ? AppColors.primary
                      : i < currentStep
                          ? AppColors.textPrimary
                          : AppColors.textHint,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Step nav buttons ──────────────────────────────────────────────────────────

class _StepNavigation extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final bool isLoading;
  final VoidCallback onPrevious;
  final VoidCallback onNext;

  const _StepNavigation({
    required this.currentStep,
    required this.totalSteps,
    required this.isLoading,
    required this.onPrevious,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
          16, 12, 16, 12 + MediaQuery.of(context).padding.bottom),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: Row(
        children: [
          if (currentStep > 0) ...[
            SizedBox(
              width: 120,
              child: OutlinedButton(
                onPressed: onPrevious,
                child: const Text('Précédent'),
              ),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: ElevatedButton(
              onPressed: isLoading ? null : onNext,
              child: isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Text(
                      currentStep == totalSteps - 1
                          ? 'Publier le projet'
                          : 'Suivant',
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Step 1: Basic info ────────────────────────────────────────────────────────

class _Step1BasicInfo extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController titleController;
  final TextEditingController descriptionController;
  final String? selectedCategory;
  final ValueChanged<String> onCategorySelected;

  const _Step1BasicInfo({
    super.key,
    required this.formKey,
    required this.titleController,
    required this.descriptionController,
    required this.selectedCategory,
    required this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Informations de base',
              style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 6),
          Text('Décrivez votre projet.',
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 24),

          // Title
          TextFormField(
            controller: titleController,
            textCapitalization: TextCapitalization.sentences,
            validator: (v) => Validators.required(v, 'Titre'),
            decoration: const InputDecoration(
              labelText: 'Titre du projet *',
              hintText: 'ex: Rénovation salle de bain',
            ),
          ),
          const SizedBox(height: 16),

          // Description
          TextFormField(
            controller: descriptionController,
            maxLines: 4,
            validator: (v) => Validators.minLength(v, 20),
            decoration: const InputDecoration(
              labelText: 'Description *',
              hintText:
                  'Décrivez les travaux souhaités, les matériaux, etc.',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 24),

          // Category
          Text('Catégorie *',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: AppConstants.projectCategories
                .map(
                  (cat) => _CategoryChip(
                    label: cat,
                    selected: selectedCategory == cat,
                    onTap: () => onCategorySelected(cat),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: selected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

// ── Step 2: Budget ────────────────────────────────────────────────────────────

class _Step2Budget extends StatelessWidget {
  final double budgetMin;
  final double budgetMax;
  final void Function(double min, double max) onChanged;

  const _Step2Budget({
    super.key,
    required this.budgetMin,
    required this.budgetMax,
    required this.onChanged,
  });

  String _format(double v) {
    if (v >= 1000000) return '${(v / 1000000).toStringAsFixed(1)}M';
    return '${(v / 1000).toStringAsFixed(0)}k';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Budget estimé',
            style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 6),
        Text(
          'Définissez votre fourchette budgétaire.',
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 40),

        // Budget display
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.primaryContainer,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Minimum',
                      style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 12,
                          color: AppColors.textSecondary)),
                  Text(
                    '${_format(budgetMin)} FCFA',
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const Text('–',
                  style: TextStyle(
                      fontSize: 24, color: AppColors.textSecondary)),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('Maximum',
                      style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 12,
                          color: AppColors.textSecondary)),
                  Text(
                    '${_format(budgetMax)} FCFA',
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),

        // Range slider
        Text('Minimum: ${_format(budgetMin)} FCFA',
            style: Theme.of(context).textTheme.bodySmall),
        Slider(
          value: budgetMin,
          min: AppConstants.minBudget,
          max: AppConstants.maxBudget * 0.8,
          divisions: 100,
          activeColor: AppColors.primary,
          onChanged: (v) {
            if (v < budgetMax) onChanged(v, budgetMax);
          },
        ),

        Text('Maximum: ${_format(budgetMax)} FCFA',
            style: Theme.of(context).textTheme.bodySmall),
        Slider(
          value: budgetMax,
          min: AppConstants.minBudget * 2,
          max: AppConstants.maxBudget,
          divisions: 100,
          activeColor: AppColors.secondary,
          onChanged: (v) {
            if (v > budgetMin) onChanged(budgetMin, v);
          },
        ),

        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.info.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline_rounded,
                  color: AppColors.info, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Une fourchette réaliste vous aidera à recevoir des devis adaptés à votre budget.',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 12,
                    color: AppColors.info,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Step 3: Location ──────────────────────────────────────────────────────────

class _Step3Location extends StatelessWidget {
  final double lat;
  final double lng;
  final TextEditingController addressController;
  final String? selectedCity;
  final MapController mapController;
  final void Function(double lat, double lng) onLocationSelected;
  final ValueChanged<String> onCitySelected;

  const _Step3Location({
    super.key,
    required this.lat,
    required this.lng,
    required this.addressController,
    required this.selectedCity,
    required this.mapController,
    required this.onLocationSelected,
    required this.onCitySelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Localisation',
            style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 6),
        Text(
          'Indiquez où se trouvent les travaux.',
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 24),

        // City picker
        DropdownButtonFormField<String>(
          value: selectedCity,
          hint: const Text('Choisir une ville'),
          items: AppConstants.beninCities
              .map((c) => DropdownMenuItem(value: c, child: Text(c)))
              .toList(),
          onChanged: (v) {
            if (v != null) onCitySelected(v);
          },
          decoration: const InputDecoration(
            labelText: 'Ville',
            prefixIcon: Icon(Icons.location_city_outlined),
          ),
        ),
        const SizedBox(height: 16),

        // Address field
        TextFormField(
          controller: addressController,
          decoration: const InputDecoration(
            labelText: 'Adresse (optionnel)',
            hintText: 'Rue, quartier…',
            prefixIcon: Icon(Icons.home_outlined),
          ),
        ),
        const SizedBox(height: 16),

        // Map
        Text('Pincer l\'emplacement exact',
            style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: SizedBox(
            height: 240,
            child: FlutterMap(
              mapController: mapController,
              options: MapOptions(
                initialCenter: LatLng(lat, lng),
                initialZoom: AppConstants.defaultZoom,
                onTap: (_, point) =>
                    onLocationSelected(point.latitude, point.longitude),
              ),
              children: [
                TileLayer(
                  urlTemplate:
                      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.mhao.app',
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: LatLng(lat, lng),
                      width: 40,
                      height: 40,
                      child: const Icon(
                        Icons.location_pin,
                        color: AppColors.primary,
                        size: 40,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Appuyez sur la carte pour choisir la position',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textHint,
              ),
        ),
      ],
    );
  }
}

// ── Step 4: Photos ────────────────────────────────────────────────────────────

class _Step4Photos extends StatelessWidget {
  final List<XFile> photos;
  final VoidCallback onPickImages;
  final ValueChanged<int> onRemovePhoto;

  const _Step4Photos({
    super.key,
    required this.photos,
    required this.onPickImages,
    required this.onRemovePhoto,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Photos du projet',
            style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 6),
        Text(
          'Ajoutez des photos pour attirer les meilleurs prestataires. (Optionnel)',
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 24),

        // Grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: photos.length < AppConstants.maxProjectPhotos
              ? photos.length + 1
              : photos.length,
          itemBuilder: (context, i) {
            if (i == photos.length &&
                photos.length < AppConstants.maxProjectPhotos) {
              return _AddPhotoButton(onTap: onPickImages);
            }
            return _PhotoThumbnail(
              file: photos[i],
              onRemove: () => onRemovePhoto(i),
            );
          },
        ),

        const SizedBox(height: 16),
        Text(
          '${photos.length}/${AppConstants.maxProjectPhotos} photos',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),

        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.secondaryContainer,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(Icons.tips_and_updates_outlined,
                  color: AppColors.secondary, size: 18),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Les projets avec photos reçoivent 3x plus de devis!',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 12,
                    color: AppColors.secondary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AddPhotoButton extends StatelessWidget {
  final VoidCallback onTap;

  const _AddPhotoButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: AppColors.primary,
            style: BorderStyle.solid,
          ),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_photo_alternate_outlined,
                color: AppColors.primary, size: 28),
            SizedBox(height: 4),
            Text(
              'Ajouter',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 11,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PhotoThumbnail extends StatelessWidget {
  final XFile file;
  final VoidCallback onRemove;

  const _PhotoThumbnail({required this.file, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            file.path,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              color: AppColors.background,
              child: const Icon(Icons.image_outlined,
                  color: AppColors.textHint),
            ),
          ),
        ),
        Positioned(
          top: 4,
          right: 4,
          child: GestureDetector(
            onTap: onRemove,
            child: Container(
              width: 22,
              height: 22,
              decoration: const BoxDecoration(
                color: AppColors.error,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.close, color: Colors.white, size: 14),
            ),
          ),
        ),
      ],
    );
  }
}
