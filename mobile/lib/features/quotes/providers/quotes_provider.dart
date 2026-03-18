import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/quote_model.dart';

// ── Provider quotes (for current provider user) ───────────────────────────────

final myQuotesProvider =
    FutureProvider.autoDispose<List<QuoteModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get<Map<String, dynamic>>(
    ApiEndpoints.quotes,
    queryParameters: {'page': 1, 'limit': 50},
  );

  final data = response['data'] as List<dynamic>? ?? [];
  return data
      .map((e) => QuoteModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Quotes for a specific project (client view) ───────────────────────────────

final projectQuotesProvider =
    FutureProvider.autoDispose.family<List<QuoteModel>, String>(
        (ref, projectId) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get<Map<String, dynamic>>(
    ApiEndpoints.projectQuotes(projectId),
  );

  final data = response['data'] as List<dynamic>? ?? [];
  return data
      .map((e) => QuoteModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Quote detail ──────────────────────────────────────────────────────────────

final quoteDetailProvider =
    FutureProvider.autoDispose.family<QuoteModel, String>((ref, id) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get<Map<String, dynamic>>(
    ApiEndpoints.quoteById(id),
  );
  return QuoteModel.fromJson(response);
});

// ── Quote actions ─────────────────────────────────────────────────────────────

class QuoteActionsNotifier extends AutoDisposeAsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> createQuote(CreateQuoteDto dto) async {
    state = const AsyncLoading();
    try {
      final api = ref.watch(apiClientProvider);
      await api.post<Map<String, dynamic>>(
        ApiEndpoints.quotes,
        data: dto.toJson(),
      );
      state = const AsyncData(null);
      // Refresh list
      ref.invalidate(myQuotesProvider);
    } catch (e, st) {
      state = AsyncError(e, st);
      rethrow;
    }
  }

  Future<void> acceptQuote(String quoteId) async {
    state = const AsyncLoading();
    try {
      final api = ref.watch(apiClientProvider);
      await api.patch<Map<String, dynamic>>(
        ApiEndpoints.acceptQuote(quoteId),
      );
      state = const AsyncData(null);
    } catch (e, st) {
      state = AsyncError(e, st);
      rethrow;
    }
  }

  Future<void> rejectQuote(String quoteId, {String? reason}) async {
    state = const AsyncLoading();
    try {
      final api = ref.watch(apiClientProvider);
      await api.patch<Map<String, dynamic>>(
        ApiEndpoints.rejectQuote(quoteId),
        data: reason != null ? {'reason': reason} : null,
      );
      state = const AsyncData(null);
    } catch (e, st) {
      state = AsyncError(e, st);
      rethrow;
    }
  }
}

final quoteActionsProvider =
    AsyncNotifierProvider.autoDispose<QuoteActionsNotifier, void>(
        QuoteActionsNotifier.new);

// ── Recent quotes (for provider dashboard) ────────────────────────────────────

final recentQuotesProvider =
    FutureProvider.autoDispose<List<QuoteModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get<Map<String, dynamic>>(
    ApiEndpoints.quotes,
    queryParameters: {'page': 1, 'limit': 5, 'sort': 'createdAt:desc'},
  );

  final data = response['data'] as List<dynamic>? ?? [];
  return data
      .map((e) => QuoteModel.fromJson(e as Map<String, dynamic>))
      .toList();
});
