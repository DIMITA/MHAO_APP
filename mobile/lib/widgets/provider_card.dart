import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';

import '../core/theme/app_theme.dart';
import '../features/auth/models/user_model.dart';

class ProviderCard extends StatelessWidget {
  final UserModel provider;
  final VoidCallback? onTap;
  final List<String> skills;

  const ProviderCard({
    super.key,
    required this.provider,
    this.onTap,
    this.skills = const [],
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.divider),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar
            _ProviderAvatar(provider: provider),
            const SizedBox(width: 12),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name + verified badge
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          provider.fullName,
                          style:
                              Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (provider.isKycVerified)
                        Padding(
                          padding: const EdgeInsets.only(left: 4),
                          child: Icon(
                            Icons.verified_rounded,
                            size: 16,
                            color: AppColors.info,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),

                  // Role badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.secondaryContainer,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      provider.role.label,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: AppColors.secondary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Rating
                  if (provider.rating != null)
                    Row(
                      children: [
                        RatingBarIndicator(
                          rating: provider.rating!,
                          itemBuilder: (_, __) => const Icon(
                            Icons.star_rounded,
                            color: Color(0xFFFBBF24),
                          ),
                          itemCount: 5,
                          itemSize: 14,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          provider.rating!.toStringAsFixed(1),
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        if (provider.reviewCount != null) ...[
                          const SizedBox(width: 4),
                          Text(
                            '(${provider.reviewCount})',
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                          ),
                        ],
                      ],
                    ),

                  // Skills chips
                  if (skills.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 4,
                      runSpacing: 4,
                      children: skills
                          .take(3)
                          .map((skill) => _SkillChip(label: skill))
                          .toList(),
                    ),
                  ],
                ],
              ),
            ),

            // Arrow
            const Icon(
              Icons.arrow_forward_ios_rounded,
              size: 14,
              color: AppColors.textHint,
            ),
          ],
        ),
      ),
    );
  }
}

class _ProviderAvatar extends StatelessWidget {
  final UserModel provider;
  final double size;

  const _ProviderAvatar({required this.provider, this.size = 56});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.divider, width: 2),
      ),
      child: ClipOval(
        child: provider.avatarUrl != null
            ? CachedNetworkImage(
                imageUrl: provider.avatarUrl!,
                fit: BoxFit.cover,
                placeholder: (_, __) => _InitialsAvatar(
                  initials: provider.initials,
                  size: size,
                ),
                errorWidget: (_, __, ___) => _InitialsAvatar(
                  initials: provider.initials,
                  size: size,
                ),
              )
            : _InitialsAvatar(initials: provider.initials, size: size),
      ),
    );
  }
}

class _InitialsAvatar extends StatelessWidget {
  final String initials;
  final double size;

  const _InitialsAvatar({required this.initials, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      color: AppColors.primaryContainer,
      alignment: Alignment.center,
      child: Text(
        initials,
        style: TextStyle(
          fontFamily: 'Poppins',
          fontSize: size * 0.32,
          fontWeight: FontWeight.w700,
          color: AppColors.primary,
        ),
      ),
    );
  }
}

class _SkillChip extends StatelessWidget {
  final String label;

  const _SkillChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}

// Standalone avatar widget for reuse
class UserAvatar extends StatelessWidget {
  final UserModel user;
  final double size;

  const UserAvatar({super.key, required this.user, this.size = 40});

  @override
  Widget build(BuildContext context) {
    return _ProviderAvatar(provider: user, size: size);
  }
}
