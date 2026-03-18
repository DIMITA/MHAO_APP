import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../widgets/app_error_widget.dart';
import '../../../widgets/loading_indicator.dart';
import '../../../widgets/status_badge.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/payment_model.dart';

// ── Payment provider ──────────────────────────────────────────────────────────

final paymentDetailProvider =
    FutureProvider.autoDispose.family<PaymentModel, String>((ref, id) async {
  final api = ref.watch(apiClientProvider);
  final response =
      await api.get<Map<String, dynamic>>(ApiEndpoints.paymentById(id));
  return PaymentModel.fromJson(response);
});

// ── Screen ────────────────────────────────────────────────────────────────────

class PaymentScreen extends ConsumerWidget {
  final String paymentId;

  const PaymentScreen({super.key, required this.paymentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentAsync = ref.watch(paymentDetailProvider(paymentId));

    return paymentAsync.when(
      data: (payment) => _PaymentContent(payment: payment),
      loading: () => const Scaffold(
        body: Center(child: AppLoadingIndicator(size: 40)),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: const Text('Paiement')),
        body: AppErrorWidget(
          message: e.toString(),
          onRetry: () => ref.invalidate(paymentDetailProvider(paymentId)),
        ),
      ),
    );
  }
}

class _PaymentContent extends ConsumerWidget {
  final PaymentModel payment;

  const _PaymentContent({required this.payment});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final isClient = user?.id == payment.clientId;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Paiement'),
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary card
            _PaymentSummaryCard(payment: payment),
            const SizedBox(height: 20),

            // Escrow info
            if (payment.isEscrowed)
              _EscrowCard(payment: payment),

            const SizedBox(height: 20),

            // Milestones
            Text(
              'Étapes de paiement',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),

            if (payment.milestones.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Text(
                    'Aucune étape définie',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                ),
              )
            else
              ...payment.milestones.asMap().entries.map(
                    (e) => _MilestoneTile(
                      milestone: e.value,
                      index: e.key,
                      isClient: isClient,
                      paymentId: payment.id,
                      ref: ref,
                    ),
                  ),

            const SizedBox(height: 24),

            // Progress
            _ProgressSection(payment: payment),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

// ── Summary card ──────────────────────────────────────────────────────────────

class _PaymentSummaryCard extends StatelessWidget {
  final PaymentModel payment;

  const _PaymentSummaryCard({required this.payment});

  @override
  Widget build(BuildContext context) {
    final statusColor = payment.status.color;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Montant total',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white.withOpacity(0.8),
                    ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  payment.status.label,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            Formatters.formatCFA(payment.totalAmount),
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              _SummaryItem(
                label: 'Libéré',
                value: Formatters.formatCFACompact(payment.releasedAmount),
                icon: Icons.check_circle_outline,
                color: Colors.white,
              ),
              const SizedBox(width: 24),
              _SummaryItem(
                label: 'En attente',
                value: Formatters.formatCFACompact(payment.pendingAmount),
                icon: Icons.lock_outline,
                color: Colors.white.withOpacity(0.7),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SummaryItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _SummaryItem({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 4),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 10,
                    color: Colors.white.withOpacity(0.7))),
            Text(value,
                style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.white)),
          ],
        ),
      ],
    );
  }
}

// ── Escrow card ───────────────────────────────────────────────────────────────

class _EscrowCard extends StatelessWidget {
  final PaymentModel payment;

  const _EscrowCard({required this.payment});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.info.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.info.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.shield_outlined, color: AppColors.info, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Paiement sécurisé',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: AppColors.info,
                      ),
                ),
                Text(
                  'Votre paiement est sécurisé en séquestre et sera libéré après validation des travaux.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.info.withOpacity(0.8),
                        height: 1.4,
                      ),
                ),
                if (payment.escrowReference != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Réf: ${payment.escrowReference}',
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 11,
                      color: AppColors.info,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Milestone tile ────────────────────────────────────────────────────────────

class _MilestoneTile extends StatelessWidget {
  final MilestoneModel milestone;
  final int index;
  final bool isClient;
  final String paymentId;
  final WidgetRef ref;

  const _MilestoneTile({
    required this.milestone,
    required this.index,
    required this.isClient,
    required this.paymentId,
    required this.ref,
  });

  Future<void> _approveMilestone(BuildContext context) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.patch<dynamic>(
        ApiEndpoints.approveMilestone(paymentId, milestone.id),
      );
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Étape approuvée!'),
            backgroundColor: AppColors.secondary,
          ),
        );
        ref.invalidate(paymentDetailProvider(paymentId));
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

  @override
  Widget build(BuildContext context) {
    final statusColor = milestone.status.color;
    final isApproved = milestone.isApprovedOrReleased;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isApproved
              ? AppColors.secondary.withOpacity(0.3)
              : AppColors.divider,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Step number
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: isApproved
                  ? AppColors.secondary
                  : statusColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: isApproved
                  ? const Icon(Icons.check, color: Colors.white, size: 16)
                  : Text(
                      '${index + 1}',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: statusColor,
                      ),
                    ),
            ),
          ),
          const SizedBox(width: 12),

          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        milestone.title,
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        milestone.status.label,
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: statusColor,
                        ),
                      ),
                    ),
                  ],
                ),

                if (milestone.description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    milestone.description!,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                ],

                const SizedBox(height: 8),
                Text(
                  Formatters.formatCFA(milestone.amount),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                ),

                if (milestone.dueDate != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.calendar_today_outlined,
                          size: 12, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(
                        'Échéance: ${Formatters.formatDate(milestone.dueDate!)}',
                        style:
                            Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                      ),
                    ],
                  ),
                ],

                // Approve button for client
                if (isClient && milestone.canApprove) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _approveMilestone(context),
                      icon: const Icon(Icons.check_circle_outline, size: 18),
                      label: const Text('Approuver cette étape'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(0, 40),
                        backgroundColor: AppColors.secondary,
                        textStyle: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Progress section ──────────────────────────────────────────────────────────

class _ProgressSection extends StatelessWidget {
  final PaymentModel payment;

  const _ProgressSection({required this.payment});

  @override
  Widget build(BuildContext context) {
    final progress = payment.progressPercent;

    return Container(
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
              Text('Progression du paiement',
                  style: Theme.of(context).textTheme.titleMedium),
              Text(
                '${payment.completedMilestones}/${payment.totalMilestones} étapes',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: AppColors.divider,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(AppColors.secondary),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${(progress * 100).toStringAsFixed(0)}% complété',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              Text(
                '${Formatters.formatCFACompact(payment.releasedAmount)} libéré',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.secondary,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
