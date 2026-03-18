import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';

class _OnboardingPage {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconBackground;

  const _OnboardingPage({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconBackground,
  });
}

const _pages = [
  _OnboardingPage(
    title: 'Trouvez les meilleurs artisans',
    subtitle:
        'Accédez à des centaines de prestataires qualifiés près de chez vous au Bénin. Comparez les devis et choisissez en toute confiance.',
    icon: Icons.construction_rounded,
    iconBackground: Color(0xFFFFEDD5),
  ),
  _OnboardingPage(
    title: 'Paiements sécurisés via Mobile Money',
    subtitle:
        'Payez via MTN Mobile Money ou Moov Money. Votre argent est sécurisé en séquestre jusqu\'à la fin des travaux.',
    icon: Icons.phone_android_rounded,
    iconBackground: Color(0xFFDCFCE7),
  ),
  _OnboardingPage(
    title: 'Suivez vos projets en temps réel',
    subtitle:
        'Restez informé de l\'avancement de vos travaux, recevez des notifications et validez chaque étape.',
    icon: Icons.track_changes_rounded,
    iconBackground: Color(0xFFDBEAFE),
  ),
];

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    final storage = ref.read(secureStorageProvider);
    await storage.setOnboardingDone();
    if (mounted) context.go(AppRoutes.register);
  }

  void _next() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      _finish();
    }
  }

  void _skip() => _finish();

  @override
  Widget build(BuildContext context) {
    final isLast = _currentPage == _pages.length - 1;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.only(top: 8, right: 16),
                child: TextButton(
                  onPressed: _skip,
                  child: Text(
                    'Passer',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              ),
            ),

            // Page view
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _pages.length,
                onPageChanged: (index) =>
                    setState(() => _currentPage = index),
                itemBuilder: (context, index) =>
                    _OnboardingPageWidget(page: _pages[index]),
              ),
            ),

            // Dots + buttons
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
              child: Column(
                children: [
                  // Dots
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _pages.length,
                      (i) => _Dot(active: i == _currentPage),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Button
                  ElevatedButton(
                    onPressed: _next,
                    child: Text(isLast ? 'Commencer' : 'Suivant'),
                  ),
                  if (!isLast) ...[
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: _skip,
                      child: const Text('Passer l\'introduction'),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingPageWidget extends StatelessWidget {
  final _OnboardingPage page;

  const _OnboardingPageWidget({required this.page});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Illustration
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              color: page.iconBackground,
              shape: BoxShape.circle,
            ),
            child: Icon(
              page.icon,
              size: 96,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 48),

          // Title
          Text(
            page.title,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),

          // Subtitle
          Text(
            page.subtitle,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.6,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final bool active;

  const _Dot({required this.active});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(horizontal: 4),
      width: active ? 24 : 8,
      height: 8,
      decoration: BoxDecoration(
        color: active ? AppColors.primary : AppColors.divider,
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
