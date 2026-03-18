class ApiEndpoints {
  ApiEndpoints._();

  // Base URL - Android emulator uses 10.0.2.2 to reach host localhost
  static const String baseUrl = 'http://10.0.2.2:3000/api';

  // --- Auth ---
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String verifyOtp = '/auth/verify-otp';
  static const String resendOtp = '/auth/resend-otp';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // --- User / Profile ---
  static const String me = '/users/me';
  static const String updateProfile = '/users/me';
  static const String uploadAvatar = '/users/me/avatar';
  static const String kycSubmit = '/users/me/kyc';

  // --- Projects ---
  static const String projects = '/projects';
  static String projectById(String id) => '/projects/$id';
  static String projectPhotos(String id) => '/projects/$id/photos';
  static String projectQuotes(String id) => '/projects/$id/quotes';

  // --- Quotes ---
  static const String quotes = '/quotes';
  static String quoteById(String id) => '/quotes/$id';
  static String acceptQuote(String id) => '/quotes/$id/accept';
  static String rejectQuote(String id) => '/quotes/$id/reject';
  static String counterQuote(String id) => '/quotes/$id/counter';

  // --- Payments ---
  static const String payments = '/payments';
  static String paymentById(String id) => '/payments/$id';
  static String paymentMilestones(String id) => '/payments/$id/milestones';
  static String approveMilestone(String paymentId, String milestoneId) =>
      '/payments/$paymentId/milestones/$milestoneId/approve';
  static String releaseMilestone(String paymentId, String milestoneId) =>
      '/payments/$paymentId/milestones/$milestoneId/release';

  // --- Providers ---
  static const String providers = '/providers';
  static String providerById(String id) => '/providers/$id';
  static String providerReviews(String id) => '/providers/$id/reviews';

  // --- Notifications ---
  static const String notifications = '/notifications';
  static String markNotificationRead(String id) =>
      '/notifications/$id/read';
  static const String markAllNotificationsRead = '/notifications/read-all';

  // --- Categories ---
  static const String categories = '/categories';

  // --- Upload ---
  static const String upload = '/upload';
}
