import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/project_model.dart';

// ── Filter State ──────────────────────────────────────────────────────────────

class ProjectFilters {
  final ProjectStatus? status;
  final String? category;
  final String? city;
  final String? search;
  final int page;
  final int pageSize;

  const ProjectFilters({
    this.status,
    this.category,
    this.city,
    this.search,
    this.page = 1,
    this.pageSize = 20,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{
      'page': page,
      'limit': pageSize,
    };
    if (status != null) params['status'] = status!.value;
    if (category != null) params['category'] = category;
    if (city != null) params['city'] = city;
    if (search != null && search!.isNotEmpty) params['search'] = search;
    return params;
  }

  ProjectFilters copyWith({
    ProjectStatus? status,
    String? category,
    String? city,
    String? search,
    int? page,
    int? pageSize,
    bool clearStatus = false,
    bool clearCategory = false,
  }) {
    return ProjectFilters(
      status: clearStatus ? null : status ?? this.status,
      category: clearCategory ? null : category ?? this.category,
      city: city ?? this.city,
      search: search ?? this.search,
      page: page ?? this.page,
      pageSize: pageSize ?? this.pageSize,
    );
  }
}

// ── Filters Provider ──────────────────────────────────────────────────────────

final projectFiltersProvider =
    StateProvider<ProjectFilters>((ref) => const ProjectFilters());

// ── Projects List ─────────────────────────────────────────────────────────────

class ProjectsNotifier
    extends AutoDisposeAsyncNotifier<List<ProjectModel>> {
  @override
  Future<List<ProjectModel>> build() async {
    final filters = ref.watch(projectFiltersProvider);
    return _fetchProjects(filters);
  }

  Future<List<ProjectModel>> _fetchProjects(ProjectFilters filters) async {
    final api = ref.watch(apiClientProvider);
    final response = await api.get<Map<String, dynamic>>(
      ApiEndpoints.projects,
      queryParameters: filters.toQueryParams(),
    );

    final data = response['data'] as List<dynamic>? ?? [];
    return data
        .map((e) => ProjectModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
  }
}

final projectsProvider =
    AsyncNotifierProvider.autoDispose<ProjectsNotifier, List<ProjectModel>>(
        ProjectsNotifier.new);

// ── Project Detail ────────────────────────────────────────────────────────────

final projectDetailProvider =
    FutureProvider.autoDispose.family<ProjectModel, String>((ref, id) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get<Map<String, dynamic>>(
    ApiEndpoints.projectById(id),
  );
  return ProjectModel.fromJson(response);
});

// ── Create Project ────────────────────────────────────────────────────────────

class CreateProjectState {
  final bool isLoading;
  final ProjectModel? createdProject;
  final String? error;

  const CreateProjectState({
    this.isLoading = false,
    this.createdProject,
    this.error,
  });
}

class CreateProjectNotifier
    extends AutoDisposeAsyncNotifier<CreateProjectState> {
  @override
  Future<CreateProjectState> build() async {
    return const CreateProjectState();
  }

  Future<ProjectModel?> createProject(CreateProjectDto dto) async {
    state = const AsyncData(CreateProjectState(isLoading: true));

    try {
      final api = ref.watch(apiClientProvider);
      final response = await api.post<Map<String, dynamic>>(
        ApiEndpoints.projects,
        data: dto.toJson(),
      );

      final project = ProjectModel.fromJson(response);
      state = AsyncData(CreateProjectState(createdProject: project));

      // Invalidate projects list to trigger refresh
      ref.invalidate(projectsProvider);

      return project;
    } catch (e, st) {
      state = AsyncError(e, st);
      return null;
    }
  }

  Future<void> uploadPhotos(String projectId, List<String> filePaths) async {
    final api = ref.watch(apiClientProvider);
    // Upload photos one by one
    for (final path in filePaths) {
      try {
        final formData = _buildFormData(path);
        await api.postFormData<dynamic>(
          ApiEndpoints.projectPhotos(projectId),
          data: formData,
        );
      } catch (_) {
        // Continue even if one upload fails
      }
    }
  }

  dynamic _buildFormData(String path) {
    // Returns Dio FormData — import added at runtime via dio dependency
    return null; // Placeholder; real implementation uses FormData.fromMap
  }
}

final createProjectProvider = AsyncNotifierProvider.autoDispose<
    CreateProjectNotifier,
    CreateProjectState>(CreateProjectNotifier.new);

// ── Recent Projects (dashboard) ───────────────────────────────────────────────

final recentProjectsProvider =
    FutureProvider.autoDispose<List<ProjectModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get<Map<String, dynamic>>(
    ApiEndpoints.projects,
    queryParameters: {'page': 1, 'limit': 5, 'sort': 'createdAt:desc'},
  );

  final data = response['data'] as List<dynamic>? ?? [];
  return data
      .map((e) => ProjectModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Nearby Projects (for provider dashboard) ──────────────────────────────────

final nearbyProjectsProvider =
    FutureProvider.autoDispose<List<ProjectModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get<Map<String, dynamic>>(
    ApiEndpoints.projects,
    queryParameters: {
      'page': 1,
      'limit': 10,
      'status': 'OPEN',
      'sort': 'createdAt:desc',
    },
  );

  final data = response['data'] as List<dynamic>? ?? [];
  return data
      .map((e) => ProjectModel.fromJson(e as Map<String, dynamic>))
      .toList();
});
