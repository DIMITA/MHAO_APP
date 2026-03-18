import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../widgets/provider_card.dart';
import '../../auth/models/user_model.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);

    if (user == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Header
          SliverAppBar(
            expandedHeight: 0,
            pinned: true,
            backgroundColor: AppColors.cardBackground,
            title: const Text('Mon profil'),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit_outlined),
                onPressed: () => _showEditProfile(context, ref, user),
              ),
            ],
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Profile header
                  _ProfileHeader(user: user),
                  const SizedBox(height: 20),

                  // Stats
                  _StatsRow(user: user),
                  const SizedBox(height: 20),

                  // KYC Card
                  _KycCard(user: user),
                  const SizedBox(height: 20),

                  // Settings sections
                  _SettingsSection(
                    title: 'Compte',
                    items: [
                      _SettingsItem(
                        icon: Icons.person_outline_rounded,
                        label: 'Modifier le profil',
                        onTap: () => _showEditProfile(context, ref, user),
                      ),
                      _SettingsItem(
                        icon: Icons.lock_outline_rounded,
                        label: 'Changer le mot de passe',
                        onTap: () {},
                      ),
                      _SettingsItem(
                        icon: Icons.phone_outlined,
                        label: 'Changer le numéro',
                        onTap: () {},
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  _SettingsSection(
                    title: 'Notifications',
                    items: [
                      _SettingsToggleItem(
                        icon: Icons.notifications_outlined,
                        label: 'Notifications push',
                        value: true,
                        onChanged: (_) {},
                      ),
                      _SettingsToggleItem(
                        icon: Icons.email_outlined,
                        label: 'Notifications email',
                        value: true,
                        onChanged: (_) {},
                      ),
                      _SettingsToggleItem(
                        icon: Icons.sms_outlined,
                        label: 'Notifications SMS',
                        value: false,
                        onChanged: (_) {},
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  _SettingsSection(
                    title: 'Support',
                    items: [
                      _SettingsItem(
                        icon: Icons.help_outline_rounded,
                        label: 'Aide et support',
                        onTap: () {},
                      ),
                      _SettingsItem(
                        icon: Icons.policy_outlined,
                        label: 'Conditions d\'utilisation',
                        onTap: () {},
                      ),
                      _SettingsItem(
                        icon: Icons.privacy_tip_outlined,
                        label: 'Politique de confidentialité',
                        onTap: () {},
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Logout button
                  _LogoutButton(),

                  const SizedBox(height: 8),

                  // Version
                  Text(
                    'MHAO v1.0.0',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textHint,
                        ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showEditProfile(
      BuildContext context, WidgetRef ref, UserModel user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _EditProfileSheet(user: user),
    );
  }
}

// ── Profile header ────────────────────────────────────────────────────────────

class _ProfileHeader extends StatelessWidget {
  final UserModel user;

  const _ProfileHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        children: [
          // Avatar
          Stack(
            children: [
              UserAvatar(user: user, size: 80),
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 26,
                  height: 26,
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.camera_alt_outlined,
                    color: Colors.white,
                    size: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Name + badge
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                user.fullName,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
              ),
              if (user.isKycVerified) ...[
                const SizedBox(width: 6),
                const Icon(
                  Icons.verified_rounded,
                  color: AppColors.info,
                  size: 20,
                ),
              ],
            ],
          ),
          const SizedBox(height: 4),

          // Email
          Text(
            user.email,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: 8),

          // Role badge
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.primaryContainer,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              user.role.label,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
          ),

          // Rating for providers
          if (user.isProvider && user.rating != null) ...[
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                RatingBarIndicator(
                  rating: user.rating!,
                  itemBuilder: (_, __) => const Icon(
                    Icons.star_rounded,
                    color: Color(0xFFFBBF24),
                  ),
                  itemCount: 5,
                  itemSize: 20,
                ),
                const SizedBox(width: 6),
                Text(
                  Formatters.formatRating(user.rating!),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                if (user.reviewCount != null) ...[
                  const SizedBox(width: 4),
                  Text(
                    '(${user.reviewCount} avis)',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }
}

// ── Stats row ─────────────────────────────────────────────────────────────────

class _StatsRow extends StatelessWidget {
  final UserModel user;

  const _StatsRow({required this.user});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            icon: Icons.folder_rounded,
            value: '${user.projectCount ?? 0}',
            label: user.isClient ? 'Projets' : 'Missions',
            color: AppColors.primary,
          ),
        ),
        const SizedBox(width: 12),
        if (user.isProvider)
          Expanded(
            child: _StatCard(
              icon: Icons.star_rounded,
              value: user.rating != null
                  ? Formatters.formatRating(user.rating!)
                  : '–',
              label: 'Note',
              color: const Color(0xFFFBBF24),
            ),
          ),
        if (user.isClient)
          Expanded(
            child: _StatCard(
              icon: Icons.description_rounded,
              value: '–',
              label: 'Devis reçus',
              color: AppColors.info,
            ),
          ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(
            icon: Icons.account_balance_wallet_outlined,
            value: '–',
            label: 'Dépensé',
            color: AppColors.secondary,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
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
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 10,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ── KYC Card ──────────────────────────────────────────────────────────────────

class _KycCard extends StatelessWidget {
  final UserModel user;

  const _KycCard({required this.user});

  @override
  Widget build(BuildContext context) {
    final kycColor = user.kycStatus.color;
    final isVerified = user.isKycVerified;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isVerified
              ? AppColors.secondary.withOpacity(0.4)
              : AppColors.divider,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: kycColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isVerified ? Icons.verified_user_rounded : Icons.shield_outlined,
              color: kycColor,
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Vérification KYC',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                Text(
                  user.kycStatus.label,
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 13,
                    color: kycColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          if (!isVerified)
            TextButton(
              onPressed: () {},
              child: const Text('Vérifier'),
            ),
        ],
      ),
    );
  }
}

// ── Settings section ──────────────────────────────────────────────────────────

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> items;

  const _SettingsSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
            child: Text(
              title,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppColors.textSecondary,
                    letterSpacing: 1,
                  ),
            ),
          ),
          ...items.asMap().entries.map((e) {
            final isLast = e.key == items.length - 1;
            return Column(
              children: [
                e.value,
                if (!isLast)
                  const Divider(height: 1, indent: 56),
              ],
            );
          }),
        ],
      ),
    );
  }
}

class _SettingsItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  const _SettingsItem({
    required this.icon,
    required this.label,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
      leading: Icon(icon, color: AppColors.textSecondary, size: 22),
      title: Text(
        label,
        style: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 14,
          fontWeight: FontWeight.w400,
        ),
      ),
      trailing: const Icon(
        Icons.arrow_forward_ios_rounded,
        size: 14,
        color: AppColors.textHint,
      ),
    );
  }
}

class _SettingsToggleItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _SettingsToggleItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
      leading: Icon(icon, color: AppColors.textSecondary, size: 22),
      title: Text(
        label,
        style: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 14,
          fontWeight: FontWeight.w400,
        ),
      ),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppColors.primary,
      ),
    );
  }
}

// ── Logout button ─────────────────────────────────────────────────────────────

class _LogoutButton extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: () => _confirmLogout(context, ref),
        icon: const Icon(Icons.logout_rounded, color: AppColors.error),
        label: const Text(
          'Se déconnecter',
          style: TextStyle(color: AppColors.error),
        ),
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: AppColors.error),
          foregroundColor: AppColors.error,
        ),
      ),
    );
  }

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Se déconnecter?'),
        content: const Text(
            'Êtes-vous sûr de vouloir vous déconnecter?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ref.read(authProvider.notifier).logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: const Text('Déconnecter'),
          ),
        ],
      ),
    );
  }
}

// ── Edit profile sheet ────────────────────────────────────────────────────────

class _EditProfileSheet extends ConsumerStatefulWidget {
  final UserModel user;

  const _EditProfileSheet({required this.user});

  @override
  ConsumerState<_EditProfileSheet> createState() =>
      _EditProfileSheetState();
}

class _EditProfileSheetState extends ConsumerState<_EditProfileSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _firstNameController;
  late final TextEditingController _lastNameController;
  late final TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    _firstNameController =
        TextEditingController(text: widget.user.firstName);
    _lastNameController =
        TextEditingController(text: widget.user.lastName);
    _phoneController =
        TextEditingController(text: widget.user.phone ?? '');
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    await ref.read(authProvider.notifier).updateProfile({
      'firstName': _firstNameController.text.trim(),
      'lastName': _lastNameController.text.trim(),
      'phone': _phoneController.text.trim(),
    });

    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profil mis à jour!'),
          backgroundColor: AppColors.secondary,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(authProvider).isLoading;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(
          24, 24, 24, 24 + MediaQuery.of(context).viewInsets.bottom),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 20),
            Text('Modifier le profil',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 20),

            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _firstNameController,
                    decoration: const InputDecoration(labelText: 'Prénom'),
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Requis' : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _lastNameController,
                    decoration: const InputDecoration(labelText: 'Nom'),
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Requis' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Téléphone',
                prefixText: '+229 ',
              ),
            ),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: isLoading ? null : _save,
              child: isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white)),
                    )
                  : const Text('Enregistrer'),
            ),
          ],
        ),
      ),
    );
  }
}
