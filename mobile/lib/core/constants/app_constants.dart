class AppConstants {
  AppConstants._();

  static const String appName = 'MHAO';
  static const String appTagline = 'Marketplace Habitat Afrique de l\'Ouest';

  // Roles
  static const String roleClient = 'CLIENT';
  static const String roleProvider = 'PRESTATAIRE';
  static const String roleAdmin = 'ADMIN';

  // Storage keys
  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUser = 'user_data';
  static const String keyOnboardingDone = 'onboarding_done';

  // OTP
  static const int otpResendSeconds = 60;
  static const int otpLength = 6;

  // Pagination
  static const int defaultPageSize = 20;

  // Project
  static const int maxProjectPhotos = 5;
  static const double minBudget = 50000;
  static const double maxBudget = 10000000;

  // Location (Cotonou, Bénin)
  static const double defaultLat = 6.3703;
  static const double defaultLng = 2.3912;
  static const double defaultZoom = 13.0;

  // Animation durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 400);
  static const Duration longAnimation = Duration(milliseconds: 600);

  // Project categories
  static const List<String> projectCategories = [
    'Plomberie',
    'Électricité',
    'Maçonnerie',
    'Peinture',
    'Menuiserie',
    'Carrelage',
    'Toiture',
    'Climatisation',
    'Jardinage',
    'Nettoyage',
    'Sécurité',
    'Autre',
  ];

  // Benin cities
  static const List<String> beninCities = [
    'Cotonou',
    'Porto-Novo',
    'Parakou',
    'Djougou',
    'Bohicon',
    'Abomey',
    'Kandi',
    'Natitingou',
    'Ouidah',
    'Lokossa',
  ];
}
