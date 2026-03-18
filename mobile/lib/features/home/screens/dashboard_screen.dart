import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../widgets/app_error_widget.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_indicator.dart';
import '../../../widgets/project_card.dart';
import '../../auth/models/user_model.dart';
import '../../auth/providers/auth_provider.dart';
import '../../projects/providers/projects_provider.dart';
import '../../quotes/providers/quotes_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    if (user == null) return const SizedBox.shrink();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          ref.invalidate(recentProjectsProvider);
          ref.invalidate(recentQuotesProvider);
        },
        child: CustomScrollView(
          slivers: [
            // App bar
            SliverAppBar(
              backgroundColor: AppColors.cardBackground,
              expandedHeight: 0,
              floating: true,
              snap: true,
              pinned: false,
              elevation: 0,
              title: _WelcomeHeader(user: user),
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () {},
                ),
                const SizedBox(width: 8),
              ],
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Stats row
                    _StatsRow(user: user),
                    const SizedBox(height: 24),

                    // Quick actions
                    _QuickActions(user: user),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),

            // Content based on role
            if (user.isClient) ...[
              _RecentProjectsSection(),
            ] else ...[
              _ProviderRecentQuotesSection(),
              _NearbyProjectsSection(),
            ],

            const SliverToBoxAdapter(child: SizedBox(height: 80)),
          ],
        ),
      ),
      floatingActionButton: user.isClient
          ? FloatingActionButton.extended(
              onPressed: () => context.push(AppRoutes.createProject),
              icon: const Icon(Icons.add),
              label: const Text(
                'Nouveau projet',
                style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
              ),
            )
          : null,
    );
  }
}

// ── Welcome header ────────────────────────────────────────────────────────────

class _WelcomeHeader extends StatelessWidget {
  final UserModel user;

  const _WelcomeHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'Bonjour'
        : hour < 18
            ? 'Bon après-midi'
            : 'Bonsoir';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          '$greeting, ${user.firstName}!',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ),
        ),
        Text(
          user.role.label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
      ],
    );
  }
}

// ── Stats row ─────────────────────────────────────────────────────────────────

class _StatsRow extends ConsumerWidget {
  final UserModel user;

  const _StatsRow({required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            icon: Icons.folder_open_rounded,
            label: 'Projets',
            value: '${user.projectCount ?? 0}',
            color: AppColors.primary,
          ),
        ),
        const SizedBox(width: 12),
        if (user.isProvider)
          Expanded(
            child: _StatCard(
              icon: Icons.star_rounded,
              label: 'Note',
              value: user.rating != null
                  ? Formatters.formatRating(user.rating!)
                  : '–',
              color: const Color(0xFFFBBF24),
            ),
          ),
        if (user.isClient)
          Expanded(
            child: _StatCard(
              icon: Icons.description_rounded,
              label: 'Devis reçus',
              value: '–',
              color: AppColors.info,
            ),
          ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(
            icon: user.isKycVerified
                ? Icons.verified_rounded
                : Icons.shield_outlined,
            label: 'KYC',
            value: user.kycStatus.label,
            color: user.kycStatus.color,
            valueSmall: true,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  final bool valueSmall;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
    this.valueSmall = false,
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: valueSmall ? 11 : 20,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Quick actions ─────────────────────────────────────────────────────────────

class _QuickActions extends StatelessWidget {
  final UserModel user;

  const _QuickActions({required this.user});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Actions rapides',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            if (user.isClient)
              Expanded(
                child: _ActionButton(
                  icon: Icons.add_circle_outline_rounded,
                  label: 'Nouveau\nprojet',
                  onTap: () => context.push(AppRoutes.createProject),
                ),
              ),
            if (user.isClient) const SizedBox(width: 10),
            Expanded(
              child: _ActionButton(
                icon: Icons.folder_outlined,
                label: 'Mes\nprojets',
                onTap: () => context.go(AppRoutes.projects),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _ActionButton(
                icon: Icons.description_outlined,
                label: user.isClient ? 'Mes\ndevis' : 'Soumettre\ndevis',
                onTap: () => context.go(AppRoutes.quotes),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _ActionButton(
                icon: Icons.person_outline_rounded,
                label: 'Mon\nprofil',
                onTap: () => context.go(AppRoutes.profile),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.primary, size: 24),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Recent projects (CLIENT) ──────────────────────────────────────────────────

class _RecentProjectsSection extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectsAsync = ref.watch(recentProjectsProvider);

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Mes projets récents',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                TextButton(
                  onPressed: () => context.go(AppRoutes.projects),
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            projectsAsync.when(
              data: (projects) {
                if (projects.isEmpty) {
                  return EmptyStateWidget(
                    icon: Icons.folder_open_rounded,
                    title: 'Aucun projet',
                    subtitle: 'Créez votre premier projet pour trouver\ndes artisans qualifiés.',
                    actionLabel: 'Créer un projet',
                    onAction: () => context.push(AppRoutes.createProject),
                  );
                }
                return Column(
                  children: projects
                      .map((p) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: ProjectCard(project: p),
                          ))
                      .toList(),
                );
              },
              loading: () => Column(
                children: List.generate(
                  2,
                  (_) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: ShimmerBox(
                      width: double.infinity,
                      height: 240,
                      borderRadius: 16,
                    ),
                  ),
                ),
              ),
              error: (e, _) => AppErrorWidget(
                message: e.toString(),
                onRetry: () => ref.invalidate(recentProjectsProvider),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Provider: Recent quotes ───────────────────────────────────────────────────

class _ProviderRecentQuotesSection extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final quotesAsync = ref.watch(recentQuotesProvider);

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Mes devis récents',
                    style: Theme.of(context).textTheme.titleLarge),
                TextButton(
                  onPressed: () => context.go(AppRoutes.quotes),
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            quotesAsync.when(
              data: (quotes) {
                if (quotes.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      'Aucun devis soumis pour l\'instant.',
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                  );
                }
                return Column(
                  children: quotes
                      .map((q) => _QuoteListItem(
                            amount: q.amount,
                            projectId: q.projectId,
                            status: q.statusLabel,
                            statusColor: q.statusColor,
                            date: q.createdAt,
                          ))
                      .toList(),
                );
              },
              loading: () => const AppLoadingIndicator(),
              error: (e, _) => AppErrorWidget(message: e.toString()),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _QuoteListItem extends StatelessWidget {
  final double amount;
  final String projectId;
  final String status;
  final Color statusColor;
  final DateTime date;

  const _QuoteListItem({
    required this.amount,
    required this.projectId,
    required this.status,
    required this.statusColor,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primaryContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.description_outlined,
                color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Projet #${projectId.substring(0, 8)}',
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                Text(
                  Formatters.formatRelative(date),
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                Formatters.formatCFACompact(amount),
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 10,
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Provider: Nearby projects ─────────────────────────────────────────────────

class _NearbyProjectsSection extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nearbyAsync = ref.watch(nearbyProjectsProvider);

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Nouveaux projets',
                    style: Theme.of(context).textTheme.titleLarge),
                TextButton(
                  onPressed: () => context.go(AppRoutes.projects),
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            nearbyAsync.when(
              data: (projects) {
                if (projects.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      'Aucun projet disponible en ce moment.',
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                  );
                }
                return Column(
                  children: projects
                      .take(3)
                      .map((p) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: ProjectCard(project: p),
                          ))
                      .toList(),
                );
              },
              loading: () => const AppLoadingIndicator(),
              error: (e, _) => AppErrorWidget(message: e.toString()),
            ),
          ],
        ),
      ),
    );
  }
}
