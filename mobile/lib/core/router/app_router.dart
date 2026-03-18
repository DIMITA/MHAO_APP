import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/otp_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/home/screens/dashboard_screen.dart';
import '../../features/onboarding/screens/onboarding_screen.dart';
import '../../features/payments/screens/payment_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/projects/screens/create_project_screen.dart';
import '../../features/projects/screens/project_detail_screen.dart';
import '../../features/projects/screens/projects_screen.dart';
import '../../features/quotes/screens/quotes_screen.dart';
import '../../features/splash/screens/splash_screen.dart';

// Route names
class AppRoutes {
  AppRoutes._();

  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String verifyOtp = '/verify-otp';

  static const String home = '/home';
  static const String dashboard = '/home/dashboard';
  static const String projects = '/home/projects';
  static const String projectDetail = '/home/projects/:id';
  static const String quotes = '/home/quotes';
  static const String profile = '/home/profile';

  static const String createProject = '/projects/new';
  static const String payment = '/payments/:id';
  static const String providers = '/providers';
  static const String providerDetail = '/providers/:id';

  static String projectDetailPath(String id) => '/home/projects/$id';
  static String paymentPath(String id) => '/payments/$id';
  static String providerDetailPath(String id) => '/providers/$id';
}

// ── Router Provider ───────────────────────────────────────────────────────────

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isLoading = authState.isLoading;
      if (isLoading) return null; // Wait for auth state to resolve

      final isAuthenticated =
          authState.valueOrNull?.isAuthenticated ?? false;

      final isOnPublicRoute = [
        AppRoutes.splash,
        AppRoutes.onboarding,
        AppRoutes.login,
        AppRoutes.register,
        AppRoutes.verifyOtp,
      ].contains(state.matchedLocation);

      // If not authenticated and trying to access protected route → login
      if (!isAuthenticated && !isOnPublicRoute) {
        return AppRoutes.login;
      }

      // If authenticated and on login/register → go to home
      if (isAuthenticated &&
          (state.matchedLocation == AppRoutes.login ||
              state.matchedLocation == AppRoutes.register)) {
        return AppRoutes.home;
      }

      return null;
    },
    routes: [
      // ── Splash ─────────────────────────────────────────────────────────
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // ── Onboarding ──────────────────────────────────────────────────────
      GoRoute(
        path: AppRoutes.onboarding,
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // ── Auth ────────────────────────────────────────────────────────────
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: AppRoutes.verifyOtp,
        name: 'verify-otp',
        builder: (context, state) {
          final phone = state.extra as String? ?? '';
          return OtpScreen(phone: phone);
        },
      ),

      // ── Home Shell ──────────────────────────────────────────────────────
      ShellRoute(
        builder: (context, state, child) => HomeScreen(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            name: 'home',
            redirect: (_, __) => AppRoutes.dashboard,
          ),
          GoRoute(
            path: AppRoutes.dashboard,
            name: 'dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: AppRoutes.projects,
            name: 'projects',
            builder: (context, state) => const ProjectsScreen(),
            routes: [
              GoRoute(
                path: ':id',
                name: 'project-detail',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return ProjectDetailScreen(projectId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.quotes,
            name: 'quotes',
            builder: (context, state) => const QuotesScreen(),
          ),
          GoRoute(
            path: AppRoutes.profile,
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),

      // ── Create Project ──────────────────────────────────────────────────
      GoRoute(
        path: AppRoutes.createProject,
        name: 'create-project',
        builder: (context, state) => const CreateProjectScreen(),
      ),

      // ── Payment ─────────────────────────────────────────────────────────
      GoRoute(
        path: '/payments/:id',
        name: 'payment',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return PaymentScreen(paymentId: id);
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.orange),
            const SizedBox(height: 16),
            Text(
              'Page introuvable',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              state.error?.message ?? 'Route: ${state.uri}',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(AppRoutes.home),
              child: const Text('Retour à l\'accueil'),
            ),
          ],
        ),
      ),
    ),
  );
});
