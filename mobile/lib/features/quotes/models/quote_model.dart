import 'package:flutter/material.dart';

import '../../auth/models/user_model.dart';

enum QuoteStatus { pending, accepted, rejected, countered, expired }

extension QuoteStatusExt on QuoteStatus {
  String get label {
    switch (this) {
      case QuoteStatus.pending:
        return 'En attente';
      case QuoteStatus.accepted:
        return 'Accepté';
      case QuoteStatus.rejected:
        return 'Refusé';
      case QuoteStatus.countered:
        return 'Contre-offre';
      case QuoteStatus.expired:
        return 'Expiré';
    }
  }

  String get value {
    switch (this) {
      case QuoteStatus.pending:
        return 'PENDING';
      case QuoteStatus.accepted:
        return 'ACCEPTED';
      case QuoteStatus.rejected:
        return 'REJECTED';
      case QuoteStatus.countered:
        return 'COUNTERED';
      case QuoteStatus.expired:
        return 'EXPIRED';
    }
  }

  Color get color {
    switch (this) {
      case QuoteStatus.pending:
        return const Color(0xFFF59E0B);
      case QuoteStatus.accepted:
        return const Color(0xFF16A34A);
      case QuoteStatus.rejected:
        return const Color(0xFFDC2626);
      case QuoteStatus.countered:
        return const Color(0xFF2563EB);
      case QuoteStatus.expired:
        return const Color(0xFF6B7280);
    }
  }

  Color get backgroundColor => color.withOpacity(0.1);

  static QuoteStatus fromString(String s) {
    switch (s.toUpperCase()) {
      case 'ACCEPTED':
        return QuoteStatus.accepted;
      case 'REJECTED':
        return QuoteStatus.rejected;
      case 'COUNTERED':
        return QuoteStatus.countered;
      case 'EXPIRED':
        return QuoteStatus.expired;
      default:
        return QuoteStatus.pending;
    }
  }
}

class QuoteItem {
  final String description;
  final double quantity;
  final String unit;
  final double unitPrice;

  const QuoteItem({
    required this.description,
    required this.quantity,
    required this.unit,
    required this.unitPrice,
  });

  double get total => quantity * unitPrice;

  factory QuoteItem.fromJson(Map<String, dynamic> json) => QuoteItem(
        description: json['description'] as String,
        quantity: (json['quantity'] as num).toDouble(),
        unit: json['unit'] as String? ?? 'unité',
        unitPrice: (json['unitPrice'] as num).toDouble(),
      );

  Map<String, dynamic> toJson() => {
        'description': description,
        'quantity': quantity,
        'unit': unit,
        'unitPrice': unitPrice,
      };
}

class QuoteModel {
  final String id;
  final String projectId;
  final String providerId;
  final UserModel? provider;
  final QuoteStatus status;
  final double amount;
  final String? description;
  final List<QuoteItem> items;
  final int estimatedDays;
  final DateTime? validUntil;
  final String? notes;
  final String? rejectionReason;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const QuoteModel({
    required this.id,
    required this.projectId,
    required this.providerId,
    this.provider,
    required this.status,
    required this.amount,
    this.description,
    this.items = const [],
    required this.estimatedDays,
    this.validUntil,
    this.notes,
    this.rejectionReason,
    required this.createdAt,
    this.updatedAt,
  });

  bool get isPending => status == QuoteStatus.pending;
  bool get isAccepted => status == QuoteStatus.accepted;
  bool get isExpired =>
      validUntil != null && DateTime.now().isAfter(validUntil!);

  String get statusLabel => status.label;
  Color get statusColor => status.color;

  String get durationLabel =>
      '$estimatedDays jour${estimatedDays > 1 ? 's' : ''}';

  factory QuoteModel.fromJson(Map<String, dynamic> json) {
    return QuoteModel(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      providerId: json['providerId'] as String,
      provider: json['provider'] != null
          ? UserModel.fromJson(json['provider'] as Map<String, dynamic>)
          : null,
      status:
          QuoteStatusExt.fromString(json['status'] as String? ?? 'PENDING'),
      amount: (json['amount'] as num).toDouble(),
      description: json['description'] as String?,
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => QuoteItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      estimatedDays: json['estimatedDays'] as int? ?? 1,
      validUntil: json['validUntil'] != null
          ? DateTime.parse(json['validUntil'] as String)
          : null,
      notes: json['notes'] as String?,
      rejectionReason: json['rejectionReason'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'projectId': projectId,
        'providerId': providerId,
        'status': status.value,
        'amount': amount,
        'description': description,
        'items': items.map((e) => e.toJson()).toList(),
        'estimatedDays': estimatedDays,
        'validUntil': validUntil?.toIso8601String(),
        'notes': notes,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is QuoteModel && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class CreateQuoteDto {
  final String projectId;
  final double amount;
  final String description;
  final List<QuoteItem> items;
  final int estimatedDays;
  final DateTime? validUntil;
  final String? notes;

  const CreateQuoteDto({
    required this.projectId,
    required this.amount,
    required this.description,
    this.items = const [],
    required this.estimatedDays,
    this.validUntil,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
        'projectId': projectId,
        'amount': amount,
        'description': description,
        'items': items.map((e) => e.toJson()).toList(),
        'estimatedDays': estimatedDays,
        'validUntil': validUntil?.toIso8601String(),
        'notes': notes,
      };
}
