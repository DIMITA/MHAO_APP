class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final String? code;
  final dynamic data;

  const ApiException({
    required this.message,
    this.statusCode,
    this.code,
    this.data,
  });

  @override
  String toString() => 'ApiException($statusCode): $message';

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isServerError => statusCode != null && statusCode! >= 500;
  bool get isNetworkError => statusCode == null;

  String get userMessage {
    if (isNetworkError) {
      return 'Pas de connexion internet. Vérifiez votre réseau.';
    }
    if (isUnauthorized) {
      return 'Session expirée. Veuillez vous reconnecter.';
    }
    if (isForbidden) {
      return 'Accès non autorisé.';
    }
    if (isNotFound) {
      return 'Ressource introuvable.';
    }
    if (isServerError) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    return message.isNotEmpty ? message : 'Une erreur est survenue.';
  }
}
