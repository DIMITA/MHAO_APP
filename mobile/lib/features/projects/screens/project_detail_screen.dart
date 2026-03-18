import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../widgets/app_error_widget.dart';
import '../../../widgets/loading_indicator.dart';
import '../../../widgets/status_badge.dart';
import '../../auth/providers/auth_provider.dart';
import '../../quotes/models/quote_model.dart';
import '../../quotes/providers/quotes_provider.dart';
import '../models/project_model.dart';
import '../providers/projects_provider.dart';

class ProjectDetailScreen extends ConsumerWidget {
  final String projectId;

  const ProjectDetailScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectAsync = ref.watch(projectDetailProvider(projectId));

    return projectAsync.when(
      data: (project) => _ProjectDetailContent(project: project),
      loading: () => const Scaffold(
        body: Center(child: AppLoadingIndicator(size: 40)),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: AppErrorWidget(
          message: e.toString(),
          onRetry: () => ref.invalidate(projectDetailProvider(projectId)),
        ),
      ),
    );
  }
}

class _ProjectDetailContent extends ConsumerWidget {
  final ProjectModel project;

  const _ProjectDetailContent({required this.project});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final isClient = user?.isClient ?? false;
    final isOwner = user?.id == project.clientId;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Hero image / app bar
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: AppColors.cardBackground,
            leading: Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                onPressed: () => context.pop(),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: _ProjectHeroImage(project: project),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category + Status
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          project.category,
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      StatusBadge.fromProjectStatus(project.status),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Title
                  Text(
                    project.title,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                  const SizedBox(height: 8),

                  // Date
                  Text(
                    'Publié le ${Formatters.formatDate(project.createdAt)}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 20),

                  // Info cards
                  Row(
                    children: [
                      Expanded(
                        child: _InfoCard(
                          icon: Icons.account_balance_wallet_outlined,
                          label: 'Budget',
                          value: project.budgetRange,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _InfoCard(
                          icon: Icons.description_outlined,
                          label: 'Devis',
                          value: '${project.quotesCount} reçus',
                          color: AppColors.info,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (project.deadline != null)
                    _InfoCard(
                      icon: Icons.calendar_today_outlined,
                      label: 'Deadline',
                      value: Formatters.formatDateLong(project.deadline!),
                      color: AppColors.warning,
                    ),

                  const SizedBox(height: 20),

                  // Description
                  Text(
                    'Description',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    project.description,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          height: 1.6,
                          color: AppColors.textSecondary,
                        ),
                  ),

                  const SizedBox(height: 24),

                  // Location
                  if (project.location != null) ...[
                    Text(
                      'Localisation',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined,
                            color: AppColors.primary, size: 18),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            project.location!.displayName,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _MapPreview(location: project.location!),
                    const SizedBox(height: 24),
                  ],

                  // Quotes section
                  Text(
                    isClient && isOwner
                        ? 'Devis reçus (${project.quotesCount})'
                        : 'Devis',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),

                  if (isClient && isOwner)
                    _ClientQuotesSection(projectId: project.id),

                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
      // Provider: submit quote button
      bottomNavigationBar: !isClient && user != null
          ? _SubmitQuoteBar(project: project)
          : null,
    );
  }
}

// ── Hero image ────────────────────────────────────────────────────────────────

class _ProjectHeroImage extends StatelessWidget {
  final ProjectModel project;

  const _ProjectHeroImage({required this.project});

  @override
  Widget build(BuildContext context) {
    if (project.photoUrls.isNotEmpty) {
      return Image.network(
        project.photoUrls.first,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _placeholder(),
      );
    }
    return _placeholder();
  }

  Widget _placeholder() {
    return Container(
      color: AppColors.primaryContainer,
      child: const Center(
        child: Icon(Icons.home_repair_service_rounded,
            size: 72, color: AppColors.primary),
      ),
    );
  }
}

// ── Info card ─────────────────────────────────────────────────────────────────

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _InfoCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  value,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Map preview ───────────────────────────────────────────────────────────────

class _MapPreview extends StatelessWidget {
  final ProjectLocation location;

  const _MapPreview({required this.location});

  @override
  Widget build(BuildContext context) {
    final point = LatLng(location.latitude, location.longitude);

    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: SizedBox(
        height: 180,
        child: FlutterMap(
          options: MapOptions(
            initialCenter: point,
            initialZoom: 15,
            interactionOptions: const InteractionOptions(
              flags: InteractiveFlag.none,
            ),
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.mhao.app',
            ),
            MarkerLayer(
              markers: [
                Marker(
                  point: point,
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
    );
  }
}

// ── Client: quotes list ───────────────────────────────────────────────────────

class _ClientQuotesSection extends ConsumerWidget {
  final String projectId;

  const _ClientQuotesSection({required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final quotesAsync = ref.watch(projectQuotesProvider(projectId));

    return quotesAsync.when(
      data: (quotes) {
        if (quotes.isEmpty) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Text(
              'Aucun devis reçu pour le moment.',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          );
        }
        return Column(
          children: quotes.map((q) => _QuoteCard(quote: q)).toList(),
        );
      },
      loading: () => const AppLoadingIndicator(),
      error: (e, _) => AppErrorWidget(message: e.toString()),
    );
  }
}

class _QuoteCard extends ConsumerWidget {
  final QuoteModel quote;

  const _QuoteCard({required this.quote});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  quote.provider?.fullName ?? 'Prestataire',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              StatusBadge.fromQuoteStatus(quote.status),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                Formatters.formatCFA(quote.amount),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const Spacer(),
              const Icon(Icons.access_time_outlined,
                  size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                quote.durationLabel,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
          if (quote.description != null) ...[
            const SizedBox(height: 8),
            Text(
              quote.description!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (quote.isPending) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _reject(context, ref, quote.id),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                      minimumSize: const Size(0, 40),
                    ),
                    child: const Text('Refuser'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _accept(context, ref, quote.id),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(0, 40),
                    ),
                    child: const Text('Accepter'),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _accept(
      BuildContext context, WidgetRef ref, String quoteId) async {
    try {
      await ref.read(quoteActionsProvider.notifier).acceptQuote(quoteId);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Devis accepté!'),
            backgroundColor: AppColors.secondary,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _reject(
      BuildContext context, WidgetRef ref, String quoteId) async {
    try {
      await ref.read(quoteActionsProvider.notifier).rejectQuote(quoteId);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Devis refusé')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
}

// ── Provider: Submit quote bar ────────────────────────────────────────────────

class _SubmitQuoteBar extends StatelessWidget {
  final ProjectModel project;

  const _SubmitQuoteBar({required this.project});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
          16, 12, 16, 12 + MediaQuery.of(context).padding.bottom),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: ElevatedButton.icon(
        onPressed: project.isOpen
            ? () => _showSubmitQuoteSheet(context)
            : null,
        icon: const Icon(Icons.send_outlined),
        label: const Text('Soumettre un devis'),
      ),
    );
  }

  void _showSubmitQuoteSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _SubmitQuoteSheet(project: project),
    );
  }
}

class _SubmitQuoteSheet extends ConsumerStatefulWidget {
  final ProjectModel project;

  const _SubmitQuoteSheet({required this.project});

  @override
  ConsumerState<_SubmitQuoteSheet> createState() => _SubmitQuoteSheetState();
}

class _SubmitQuoteSheetState extends ConsumerState<_SubmitQuoteSheet> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _daysController = TextEditingController();

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    _daysController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      final dto = CreateQuoteDto(
        projectId: widget.project.id,
        amount: double.parse(_amountController.text),
        description: _descriptionController.text.trim(),
        estimatedDays: int.parse(_daysController.text),
      );

      await ref.read(quoteActionsProvider.notifier).createQuote(dto);

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Devis soumis avec succès!'),
            backgroundColor: AppColors.secondary,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(quoteActionsProvider).isLoading;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(
        24,
        24,
        24,
        24 + MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.divider,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),

            Text(
              'Soumettre un devis',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 4),
            Text(
              widget.project.title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 20),

            // Amount
            TextFormField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Montant requis';
                final n = double.tryParse(v);
                if (n == null || n <= 0) return 'Montant invalide';
                return null;
              },
              decoration: const InputDecoration(
                labelText: 'Montant (FCFA)',
                prefixIcon: Icon(Icons.attach_money_rounded),
                hintText: 'ex: 150000',
              ),
            ),
            const SizedBox(height: 16),

            // Days
            TextFormField(
              controller: _daysController,
              keyboardType: TextInputType.number,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Durée requise';
                final n = int.tryParse(v);
                if (n == null || n <= 0) return 'Durée invalide';
                return null;
              },
              decoration: const InputDecoration(
                labelText: 'Durée estimée (jours)',
                prefixIcon: Icon(Icons.schedule_outlined),
                hintText: 'ex: 14',
              ),
            ),
            const SizedBox(height: 16),

            // Description
            TextFormField(
              controller: _descriptionController,
              maxLines: 3,
              validator: (v) => v == null || v.isEmpty
                  ? 'Description requise'
                  : null,
              decoration: const InputDecoration(
                labelText: 'Description des travaux',
                hintText: 'Décrivez ce que vous proposez…',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: isLoading ? null : _submit,
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
                  : const Text('Envoyer le devis'),
            ),
          ],
        ),
      ),
    );
  }
}
