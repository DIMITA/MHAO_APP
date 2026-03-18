import 'package:flutter/material.dart';

import '../../auth/models/user_model.dart';

enum ProjectStatus { open, inProgress, completed, cancelled, dispute }

extension ProjectStatusExt on ProjectStatus {
  String get label {
    switch (this) {
      case ProjectStatus.open:
        return 'Ouvert';
      case ProjectStatus.inProgress:
        return 'En cours';
      case ProjectStatus.completed:
        return 'Terminé';
      case ProjectStatus.cancelled:
        return 'Annulé';
      case ProjectStatus.dispute:
        return 'Litige';
    }
  }

  String get value {
    switch (this) {
      case ProjectStatus.open:
        return 'OPEN';
      case ProjectStatus.inProgress:
        return 'IN_PROGRESS';
      case ProjectStatus.completed:
        return 'COMPLETED';
      case ProjectStatus.cancelled:
        return 'CANCELLED';
      case ProjectStatus.dispute:
        return 'DISPUTE';
    }
  }

  Color get color {
    switch (this) {
      case ProjectStatus.open:
        return const Color(0xFF2563EB);
      case ProjectStatus.inProgress:
        return const Color(0xFFF97316);
      case ProjectStatus.completed:
        return const Color(0xFF16A34A);
      case ProjectStatus.cancelled:
        return const Color(0xFFDC2626);
      case ProjectStatus.dispute:
        return const Color(0xFF7C3AED);
    }
  }

  Color get backgroundColor {
    return color.withOpacity(0.1);
  }

  static ProjectStatus fromString(String s) {
    switch (s.toUpperCase()) {
      case 'IN_PROGRESS':
        return ProjectStatus.inProgress;
      case 'COMPLETED':
        return ProjectStatus.completed;
      case 'CANCELLED':
        return ProjectStatus.cancelled;
      case 'DISPUTE':
        return ProjectStatus.dispute;
      default:
        return ProjectStatus.open;
    }
  }
}

class ProjectLocation {
  final double latitude;
  final double longitude;
  final String? address;
  final String? city;
  final String? neighborhood;

  const ProjectLocation({
    required this.latitude,
    required this.longitude,
    this.address,
    this.city,
    this.neighborhood,
  });

  String get displayName {
    if (neighborhood != null && city != null) {
      return '$neighborhood, $city';
    }
    return city ?? address ?? 'Localisation non définie';
  }

  factory ProjectLocation.fromJson(Map<String, dynamic> json) {
    return ProjectLocation(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String?,
      city: json['city'] as String?,
      neighborhood: json['neighborhood'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'city': city,
        'neighborhood': neighborhood,
      };
}

class ProjectModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final ProjectStatus status;
  final double budgetMin;
  final double budgetMax;
  final ProjectLocation? location;
  final List<String> photoUrls;
  final String clientId;
  final UserModel? client;
  final String? assignedProviderId;
  final UserModel? assignedProvider;
  final int quotesCount;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final DateTime? deadline;

  const ProjectModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.status,
    required this.budgetMin,
    required this.budgetMax,
    this.location,
    this.photoUrls = const [],
    required this.clientId,
    this.client,
    this.assignedProviderId,
    this.assignedProvider,
    this.quotesCount = 0,
    required this.createdAt,
    this.updatedAt,
    this.deadline,
  });

  Color get statusColor => status.color;
  Color get statusBackgroundColor => status.backgroundColor;
  String get statusLabel => status.label;

  bool get isOpen => status == ProjectStatus.open;
  bool get isInProgress => status == ProjectStatus.inProgress;
  bool get isCompleted => status == ProjectStatus.completed;

  String get city => location?.city ?? 'Cotonou';

  String get budgetRange {
    String formatK(double v) =>
        v >= 1000000 ? '${(v / 1000000).toStringAsFixed(1)}M' : '${(v / 1000).toStringAsFixed(0)}k';
    return '${formatK(budgetMin)} – ${formatK(budgetMax)} FCFA';
  }

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? '',
      status: ProjectStatusExt.fromString(json['status'] as String? ?? 'OPEN'),
      budgetMin: (json['budgetMin'] as num?)?.toDouble() ?? 0,
      budgetMax: (json['budgetMax'] as num?)?.toDouble() ?? 0,
      location: json['location'] != null
          ? ProjectLocation.fromJson(json['location'] as Map<String, dynamic>)
          : null,
      photoUrls: (json['photoUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      clientId: json['clientId'] as String? ?? '',
      client: json['client'] != null
          ? UserModel.fromJson(json['client'] as Map<String, dynamic>)
          : null,
      assignedProviderId: json['assignedProviderId'] as String?,
      assignedProvider: json['assignedProvider'] != null
          ? UserModel.fromJson(
              json['assignedProvider'] as Map<String, dynamic>)
          : null,
      quotesCount: json['quotesCount'] as int? ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
      deadline: json['deadline'] != null
          ? DateTime.parse(json['deadline'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'category': category,
        'status': status.value,
        'budgetMin': budgetMin,
        'budgetMax': budgetMax,
        'location': location?.toJson(),
        'photoUrls': photoUrls,
        'clientId': clientId,
        'assignedProviderId': assignedProviderId,
        'quotesCount': quotesCount,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
        'deadline': deadline?.toIso8601String(),
      };

  ProjectModel copyWith({
    String? id,
    String? title,
    String? description,
    String? category,
    ProjectStatus? status,
    double? budgetMin,
    double? budgetMax,
    ProjectLocation? location,
    List<String>? photoUrls,
    String? clientId,
    UserModel? client,
    String? assignedProviderId,
    UserModel? assignedProvider,
    int? quotesCount,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deadline,
  }) {
    return ProjectModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      status: status ?? this.status,
      budgetMin: budgetMin ?? this.budgetMin,
      budgetMax: budgetMax ?? this.budgetMax,
      location: location ?? this.location,
      photoUrls: photoUrls ?? this.photoUrls,
      clientId: clientId ?? this.clientId,
      client: client ?? this.client,
      assignedProviderId: assignedProviderId ?? this.assignedProviderId,
      assignedProvider: assignedProvider ?? this.assignedProvider,
      quotesCount: quotesCount ?? this.quotesCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      deadline: deadline ?? this.deadline,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is ProjectModel && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class CreateProjectDto {
  final String title;
  final String description;
  final String category;
  final double budgetMin;
  final double budgetMax;
  final ProjectLocation? location;
  final DateTime? deadline;

  const CreateProjectDto({
    required this.title,
    required this.description,
    required this.category,
    required this.budgetMin,
    required this.budgetMax,
    this.location,
    this.deadline,
  });

  Map<String, dynamic> toJson() => {
        'title': title,
        'description': description,
        'category': category,
        'budgetMin': budgetMin,
        'budgetMax': budgetMax,
        'location': location?.toJson(),
        'deadline': deadline?.toIso8601String(),
      };
}
