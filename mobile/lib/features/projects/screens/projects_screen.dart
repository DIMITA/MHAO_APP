import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../widgets/app_error_widget.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_indicator.dart';
import '../../../widgets/project_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/project_model.dart';
import '../providers/projects_provider.dart';

class ProjectsScreen extends ConsumerStatefulWidget {
  const ProjectsScreen({super.key});

  @override
  ConsumerState<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends ConsumerState<ProjectsScreen> {
  final _searchController = TextEditingController();
  ProjectStatus? _selectedStatus;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _applyFilters() {
    ref.read(projectFiltersProvider.notifier).state = ProjectFilters(
      status: _selectedStatus,
      search: _searchController.text.isNotEmpty
          ? _searchController.text
          : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final projectsAsync = ref.watch(projectsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Projets'),
        centerTitle: false,
        actions: [
          if (user?.isClient == true)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ElevatedButton.icon(
                onPressed: () => context.push(AppRoutes.createProject),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Nouveau'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(0, 36),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                  textStyle: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              controller: _searchController,
              onChanged: (_) => _applyFilters(),
              decoration: InputDecoration(
                hintText: 'Rechercher un projet…',
                prefixIcon: const Icon(Icons.search_rounded,
                    color: AppColors.textSecondary),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded),
                        onPressed: () {
                          _searchController.clear();
                          _applyFilters();
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide:
                      const BorderSide(color: AppColors.primary, width: 2),
                ),
              ),
            ),
          ),

          // Filter chips
          SizedBox(
            height: 52,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              scrollDirection: Axis.horizontal,
              children: [
                _FilterChip(
                  label: 'Tous',
                  selected: _selectedStatus == null,
                  onSelected: (_) {
                    setState(() => _selectedStatus = null);
                    _applyFilters();
                  },
                ),
                const SizedBox(width: 8),
                ...ProjectStatus.values.map(
                  (s) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _FilterChip(
                      label: s.label,
                      selected: _selectedStatus == s,
                      color: s.color,
                      onSelected: (_) {
                        setState(() => _selectedStatus =
                            _selectedStatus == s ? null : s);
                        _applyFilters();
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Projects list
          Expanded(
            child: RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () async => ref.invalidate(projectsProvider),
              child: projectsAsync.when(
                data: (projects) {
                  if (projects.isEmpty) {
                    return EmptyStateWidget(
                      icon: Icons.folder_open_rounded,
                      title: 'Aucun projet trouvé',
                      subtitle: user?.isClient == true
                          ? 'Créez votre premier projet!'
                          : 'Aucun projet disponible pour le moment.',
                      actionLabel:
                          user?.isClient == true ? 'Créer un projet' : null,
                      onAction: user?.isClient == true
                          ? () => context.push(AppRoutes.createProject)
                          : null,
                    );
                  }
                  return ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: projects.length,
                    itemBuilder: (context, index) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ProjectCard(project: projects[index]),
                    ),
                  );
                },
                loading: () => ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: 4,
                  itemBuilder: (_, __) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: ShimmerBox(
                      width: double.infinity,
                      height: 240,
                      borderRadius: 16,
                    ),
                  ),
                ),
                error: (e, _) => AppErrorWidget(
                  message: e.toString(),
                  onRetry: () => ref.invalidate(projectsProvider),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final Color? color;
  final ValueChanged<bool> onSelected;

  const _FilterChip({
    required this.label,
    required this.selected,
    this.color,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = color ?? AppColors.primary;

    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: onSelected,
      backgroundColor: Colors.white,
      selectedColor: activeColor.withOpacity(0.12),
      checkmarkColor: activeColor,
      side: BorderSide(
        color: selected ? activeColor : AppColors.border,
        width: selected ? 1.5 : 1,
      ),
      labelStyle: TextStyle(
        fontFamily: 'Poppins',
        fontSize: 12,
        fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
        color: selected ? activeColor : AppColors.textSecondary,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4),
    );
  }
}
