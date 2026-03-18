import 'package:flutter/material.dart';

enum UserRole { client, prestataire, admin }

enum KycStatus { pending, submitted, verified, rejected }

extension UserRoleExt on UserRole {
  String get label {
    switch (this) {
      case UserRole.client:
        return 'Client';
      case UserRole.prestataire:
        return 'Prestataire';
      case UserRole.admin:
        return 'Admin';
    }
  }

  String get value {
    switch (this) {
      case UserRole.client:
        return 'CLIENT';
      case UserRole.prestataire:
        return 'PRESTATAIRE';
      case UserRole.admin:
        return 'ADMIN';
    }
  }

  static UserRole fromString(String s) {
    switch (s.toUpperCase()) {
      case 'PRESTATAIRE':
        return UserRole.prestataire;
      case 'ADMIN':
        return UserRole.admin;
      default:
        return UserRole.client;
    }
  }
}

extension KycStatusExt on KycStatus {
  String get label {
    switch (this) {
      case KycStatus.pending:
        return 'Non soumis';
      case KycStatus.submitted:
        return 'En cours de vérification';
      case KycStatus.verified:
        return 'Vérifié';
      case KycStatus.rejected:
        return 'Rejeté';
    }
  }

  Color get color {
    switch (this) {
      case KycStatus.pending:
        return const Color(0xFF6B7280);
      case KycStatus.submitted:
        return const Color(0xFFF59E0B);
      case KycStatus.verified:
        return const Color(0xFF16A34A);
      case KycStatus.rejected:
        return const Color(0xFFDC2626);
    }
  }

  static KycStatus fromString(String s) {
    switch (s.toUpperCase()) {
      case 'SUBMITTED':
        return KycStatus.submitted;
      case 'VERIFIED':
        return KycStatus.verified;
      case 'REJECTED':
        return KycStatus.rejected;
      default:
        return KycStatus.pending;
    }
  }
}

class UserModel {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? phone;
  final UserRole role;
  final KycStatus kycStatus;
  final String? avatarUrl;
  final bool isVerified;
  final bool isActive;
  final double? rating;
  final int? reviewCount;
  final int? projectCount;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.phone,
    required this.role,
    this.kycStatus = KycStatus.pending,
    this.avatarUrl,
    this.isVerified = false,
    this.isActive = true,
    this.rating,
    this.reviewCount,
    this.projectCount,
    required this.createdAt,
    this.updatedAt,
  });

  String get fullName => '$firstName $lastName'.trim();

  bool get isClient => role == UserRole.client;
  bool get isProvider => role == UserRole.prestataire;
  bool get isAdmin => role == UserRole.admin;
  bool get isKycVerified => kycStatus == KycStatus.verified;

  String get initials {
    final f = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final l = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$f$l';
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      phone: json['phone'] as String?,
      role: UserRoleExt.fromString(json['role'] as String? ?? 'CLIENT'),
      kycStatus:
          KycStatusExt.fromString(json['kycStatus'] as String? ?? 'PENDING'),
      avatarUrl: json['avatarUrl'] as String?,
      isVerified: json['isVerified'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? true,
      rating: (json['rating'] as num?)?.toDouble(),
      reviewCount: json['reviewCount'] as int?,
      projectCount: json['projectCount'] as int?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'role': role.value,
      'kycStatus': kycStatus.name.toUpperCase(),
      'avatarUrl': avatarUrl,
      'isVerified': isVerified,
      'isActive': isActive,
      'rating': rating,
      'reviewCount': reviewCount,
      'projectCount': projectCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? phone,
    UserRole? role,
    KycStatus? kycStatus,
    String? avatarUrl,
    bool? isVerified,
    bool? isActive,
    double? rating,
    int? reviewCount,
    int? projectCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      kycStatus: kycStatus ?? this.kycStatus,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isVerified: isVerified ?? this.isVerified,
      isActive: isActive ?? this.isActive,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      projectCount: projectCount ?? this.projectCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is UserModel && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class RegisterDto {
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String password;
  final UserRole role;

  const RegisterDto({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.password,
    required this.role,
  });

  Map<String, dynamic> toJson() => {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'phone': phone,
        'password': password,
        'role': role.value,
      };
}
