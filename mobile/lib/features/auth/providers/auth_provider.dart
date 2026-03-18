import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/storage/secure_storage.dart';
import '../models/user_model.dart';

// ── Infrastructure Providers ──────────────────────────────────────────────────

final secureStorageProvider = Provider<SecureStorage>((ref) {
  return SecureStorage();
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ApiClient(storage);
});

// ── Auth State ────────────────────────────────────────────────────────────────

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? error,
    bool clearUser = false,
    bool clearError = false,
  }) {
    return AuthState(
      user: clearUser ? null : user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : error ?? this.error,
    );
  }
}

// ── Auth Notifier ─────────────────────────────────────────────────────────────

class AuthNotifier extends AsyncNotifier<AuthState> {
  late final ApiClient _api;
  late final SecureStorage _storage;

  @override
  Future<AuthState> build() async {
    _api = ref.watch(apiClientProvider);
    _storage = ref.watch(secureStorageProvider);

    // Try to restore session from secure storage
    return await _loadStoredUser();
  }

  Future<AuthState> _loadStoredUser() async {
    try {
      final hasSession = await _storage.hasValidSession();
      if (!hasSession) return const AuthState();

      final userJson = await _storage.getUser();
      if (userJson == null) return const AuthState();

      final user = UserModel.fromJson(userJson);
      return AuthState(user: user);
    } catch (_) {
      return const AuthState();
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  Future<void> login(String email, String password) async {
    state = const AsyncLoading();

    try {
      final response = await _api.post<Map<String, dynamic>>(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );

      final accessToken = response['accessToken'] as String;
      final refreshToken = response['refreshToken'] as String;
      final userJson = response['user'] as Map<String, dynamic>;

      await _storage.saveTokens(
          accessToken: accessToken, refreshToken: refreshToken);
      await _storage.saveUser(userJson);

      final user = UserModel.fromJson(userJson);
      state = AsyncData(AuthState(user: user));
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  // ── Register ──────────────────────────────────────────────────────────────

  Future<void> register(RegisterDto dto) async {
    state = const AsyncLoading();

    try {
      await _api.post<Map<String, dynamic>>(
        ApiEndpoints.register,
        data: dto.toJson(),
      );

      // After registration, user must verify OTP — don't log in yet
      state = const AsyncData(AuthState());
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────

  Future<void> verifyOtp(String phone, String otp) async {
    state = const AsyncLoading();

    try {
      final response = await _api.post<Map<String, dynamic>>(
        ApiEndpoints.verifyOtp,
        data: {'phone': phone, 'otp': otp},
      );

      final accessToken = response['accessToken'] as String;
      final refreshToken = response['refreshToken'] as String;
      final userJson = response['user'] as Map<String, dynamic>;

      await _storage.saveTokens(
          accessToken: accessToken, refreshToken: refreshToken);
      await _storage.saveUser(userJson);

      final user = UserModel.fromJson(userJson);
      state = AsyncData(AuthState(user: user));
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────

  Future<void> resendOtp(String phone) async {
    await _api.post<void>(
      ApiEndpoints.resendOtp,
      data: {'phone': phone},
    );
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  Future<void> logout() async {
    try {
      await _api.post<void>(ApiEndpoints.logout);
    } catch (_) {
      // Ignore logout API errors
    } finally {
      await _storage.clearAll();
      state = const AsyncData(AuthState());
    }
  }

  // ── Update Profile ────────────────────────────────────────────────────────

  Future<void> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _api.patch<Map<String, dynamic>>(
        ApiEndpoints.updateProfile,
        data: data,
      );

      final user = UserModel.fromJson(response);
      await _storage.saveUser(user.toJson());

      state = AsyncData(AuthState(user: user));
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  // ── Refresh User ──────────────────────────────────────────────────────────

  Future<void> refreshUser() async {
    try {
      final response =
          await _api.get<Map<String, dynamic>>(ApiEndpoints.me);
      final user = UserModel.fromJson(response);
      await _storage.saveUser(user.toJson());
      state = AsyncData(AuthState(user: user));
    } catch (_) {
      // Silently fail – keep existing state
    }
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

final authProvider =
    AsyncNotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);

// ── Convenience Selectors ─────────────────────────────────────────────────────

final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).valueOrNull?.user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).valueOrNull?.isAuthenticated ?? false;
});

// Pending registration phone (for OTP screen)
final pendingPhoneProvider = StateProvider<String?>((ref) => null);
