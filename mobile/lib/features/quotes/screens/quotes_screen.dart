import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../widgets/app_error_widget.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_indicator.dart';
import '../../../widgets/status_badge.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/quote_model.dart';
import '../providers/quotes_provider.dart';

class QuotesScreen extends ConsumerWidget {
  const QuotesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final isProvider = user?.isProvider ?? false;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(isProvider ? 'Mes devis' : 'Devis reçus'),
      ),
      body: isProvider
          ? _ProviderQuotesList()
          : _ClientQuotesList(),
    );
  }
}

// ── Provider view ─────────────────────────────────────────────────────────────

class _ProviderQuotesList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final quotesAsync = ref.watch(myQuotesProvider);

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () async => ref.invalidate(myQuotesProvider),
      child: quotesAsync.when(
        data: (quotes) {
          if (quotes.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.description_outlined,
              title: 'Aucun devis soumis',
              subtitle:
                  'Parcourez les projets disponibles et soumettez des devis pour développer votre activité.',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: quotes.length,
            itemBuilder: (context, i) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _ProviderQuoteCard(quote: quotes[i]),
            ),
          );
        },
        loading: () => ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: 4,
          itemBuilder: (_, __) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: ShimmerBox(width: double.infinity, height: 140, borderRadius: 12),
          ),
        ),
        error: (e, _) => AppErrorWidget(
          message: e.toString(),
          onRetry: () => ref.invalidate(myQuotesProvider),
        ),
      ),
    );
  }
}

class _ProviderQuoteCard extends StatelessWidget {
  final QuoteModel quote;

  const _ProviderQuoteCard({required this.quote});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
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
                  'Projet #${quote.projectId.substring(0, 8)}',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              StatusBadge.fromQuoteStatus(quote.status),
            ],
          ),
          const SizedBox(height: 12),

          Row(
            children: [
              _QuoteStat(
                icon: Icons.attach_money_rounded,
                label: 'Montant',
                value: Formatters.formatCFA(quote.amount),
                color: AppColors.primary,
              ),
              const SizedBox(width: 16),
              _QuoteStat(
                icon: Icons.schedule_outlined,
                label: 'Durée',
                value: quote.durationLabel,
                color: AppColors.info,
              ),
            ],
          ),

          if (quote.description != null) ...[
            const SizedBox(height: 12),
            const Divider(height: 1),
            const SizedBox(height: 12),
            Text(
              quote.description!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],

          const SizedBox(height: 12),
          Text(
            'Soumis ${Formatters.formatRelative(quote.createdAt)}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textHint,
                ),
          ),
        ],
      ),
    );
  }
}

class _QuoteStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _QuoteStat({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 10,
                    color: AppColors.textSecondary)),
            Text(value,
                style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 13,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      ],
    );
  }
}

// ── Client view ───────────────────────────────────────────────────────────────

class _ClientQuotesList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final quotesAsync = ref.watch(myQuotesProvider);

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () async => ref.invalidate(myQuotesProvider),
      child: quotesAsync.when(
        data: (quotes) {
          if (quotes.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.description_outlined,
              title: 'Aucun devis reçu',
              subtitle:
                  'Publiez des projets pour recevoir des devis de prestataires qualifiés.',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: quotes.length,
            itemBuilder: (context, i) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _ClientQuoteCard(quote: quotes[i]),
            ),
          );
        },
        loading: () => const Center(child: AppLoadingIndicator(size: 40)),
        error: (e, _) => AppErrorWidget(
          message: e.toString(),
          onRetry: () => ref.invalidate(myQuotesProvider),
        ),
      ),
    );
  }
}

class _ClientQuoteCard extends ConsumerWidget {
  final QuoteModel quote;

  const _ClientQuoteCard({required this.quote});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: quote.isPending
              ? AppColors.warning.withOpacity(0.4)
              : AppColors.divider,
          width: quote.isPending ? 1.5 : 1,
        ),
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
          const SizedBox(height: 4),
          Text(
            'Pour: Projet #${quote.projectId.substring(0, 8)}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: 12),

          Row(
            children: [
              Text(
                Formatters.formatCFA(quote.amount),
                style:
                    Theme.of(context).textTheme.headlineSmall?.copyWith(
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

          if (quote.isPending) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _reject(context, ref),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                      minimumSize: const Size(0, 40),
                      textStyle: const TextStyle(
                          fontFamily: 'Poppins', fontSize: 13),
                    ),
                    child: const Text('Refuser'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _accept(context, ref),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(0, 40),
                      textStyle: const TextStyle(
                          fontFamily: 'Poppins', fontSize: 13),
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

  Future<void> _accept(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(quoteActionsProvider.notifier).acceptQuote(quote.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Devis accepté!'),
            backgroundColor: AppColors.secondary,
          ),
        );
        ref.invalidate(myQuotesProvider);
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

  Future<void> _reject(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(quoteActionsProvider.notifier).rejectQuote(quote.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Devis refusé')),
        );
        ref.invalidate(myQuotesProvider);
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
