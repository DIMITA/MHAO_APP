import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';

class SecureStorage {
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  // ── Tokens ────────────────────────────────────────────────────────────────

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _secureStorage.write(
          key: AppConstants.keyAccessToken, value: accessToken),
      _secureStorage.write(
          key: AppConstants.keyRefreshToken, value: refreshToken),
    ]);
  }

  Future<String?> getAccessToken() async {
    return _secureStorage.read(key: AppConstants.keyAccessToken);
  }

  Future<String?> getRefreshToken() async {
    return _secureStorage.read(key: AppConstants.keyRefreshToken);
  }

  Future<void> clearTokens() async {
    await Future.wait([
      _secureStorage.delete(key: AppConstants.keyAccessToken),
      _secureStorage.delete(key: AppConstants.keyRefreshToken),
      _secureStorage.delete(key: AppConstants.keyUser),
    ]);
  }

  // ── User ──────────────────────────────────────────────────────────────────

  Future<void> saveUser(Map<String, dynamic> userJson) async {
    await _secureStorage.write(
      key: AppConstants.keyUser,
      value: jsonEncode(userJson),
    );
  }

  Future<Map<String, dynamic>?> getUser() async {
    final raw = await _secureStorage.read(key: AppConstants.keyUser);
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> clearUser() async {
    await _secureStorage.delete(key: AppConstants.keyUser);
  }

  // ── Preferences ───────────────────────────────────────────────────────────

  Future<bool> isOnboardingDone() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(AppConstants.keyOnboardingDone) ?? false;
  }

  Future<void> setOnboardingDone() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.keyOnboardingDone, true);
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  Future<bool> hasValidSession() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> clearAll() async {
    await clearTokens();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
