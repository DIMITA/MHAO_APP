import 'package:flutter/material.dart';

enum PaymentStatus { pending, escrowed, partial, released, refunded, disputed }

enum MilestoneStatus { pending, inProgress, completed, approved, released }

enum PaymentMethod { mobileMoney, bankTransfer, cash }

extension PaymentStatusExt on PaymentStatus {
  String get label {
    switch (this) {
      case PaymentStatus.pending:
        return 'En attente';
      case PaymentStatus.escrowed:
        return 'En séquestre';
      case PaymentStatus.partial:
        return 'Partiel';
      case PaymentStatus.released:
        return 'Libéré';
      case PaymentStatus.refunded:
        return 'Remboursé';
      case PaymentStatus.disputed:
        return 'Contesté';
    }
  }

  Color get color {
    switch (this) {
      case PaymentStatus.pending:
        return const Color(0xFF6B7280);
      case PaymentStatus.escrowed:
        return const Color(0xFF2563EB);
      case PaymentStatus.partial:
        return const Color(0xFFF97316);
      case PaymentStatus.released:
        return const Color(0xFF16A34A);
      case PaymentStatus.refunded:
        return const Color(0xFF7C3AED);
      case PaymentStatus.disputed:
        return const Color(0xFFDC2626);
    }
  }

  static PaymentStatus fromString(String s) {
    switch (s.toUpperCase()) {
      case 'ESCROWED':
        return PaymentStatus.escrowed;
      case 'PARTIAL':
        return PaymentStatus.partial;
      case 'RELEASED':
        return PaymentStatus.released;
      case 'REFUNDED':
        return PaymentStatus.refunded;
      case 'DISPUTED':
        return PaymentStatus.disputed;
      default:
        return PaymentStatus.pending;
    }
  }
}

extension MilestoneStatusExt on MilestoneStatus {
  String get label {
    switch (this) {
      case MilestoneStatus.pending:
        return 'En attente';
      case MilestoneStatus.inProgress:
        return 'En cours';
      case MilestoneStatus.completed:
        return 'Terminé';
      case MilestoneStatus.approved:
        return 'Approuvé';
      case MilestoneStatus.released:
        return 'Paiement libéré';
    }
  }

  Color get color {
    switch (this) {
      case MilestoneStatus.pending:
        return const Color(0xFF6B7280);
      case MilestoneStatus.inProgress:
        return const Color(0xFFF97316);
      case MilestoneStatus.completed:
        return const Color(0xFF2563EB);
      case MilestoneStatus.approved:
        return const Color(0xFF16A34A);
      case MilestoneStatus.released:
        return const Color(0xFF16A34A);
    }
  }

  static MilestoneStatus fromString(String s) {
    switch (s.toUpperCase()) {
      case 'IN_PROGRESS':
        return MilestoneStatus.inProgress;
      case 'COMPLETED':
        return MilestoneStatus.completed;
      case 'APPROVED':
        return MilestoneStatus.approved;
      case 'RELEASED':
        return MilestoneStatus.released;
      default:
        return MilestoneStatus.pending;
    }
  }
}

class MilestoneModel {
  final String id;
  final String title;
  final String? description;
  final double amount;
  final int orderIndex;
  final MilestoneStatus status;
  final DateTime? dueDate;
  final DateTime? completedAt;
  final DateTime? approvedAt;

  const MilestoneModel({
    required this.id,
    required this.title,
    this.description,
    required this.amount,
    required this.orderIndex,
    required this.status,
    this.dueDate,
    this.completedAt,
    this.approvedAt,
  });

  bool get isApprovedOrReleased =>
      status == MilestoneStatus.approved || status == MilestoneStatus.released;

  bool get canApprove => status == MilestoneStatus.completed;

  factory MilestoneModel.fromJson(Map<String, dynamic> json) {
    return MilestoneModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      amount: (json['amount'] as num).toDouble(),
      orderIndex: json['orderIndex'] as int? ?? 0,
      status: MilestoneStatusExt.fromString(
          json['status'] as String? ?? 'PENDING'),
      dueDate: json['dueDate'] != null
          ? DateTime.parse(json['dueDate'] as String)
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'] as String)
          : null,
      approvedAt: json['approvedAt'] != null
          ? DateTime.parse(json['approvedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'amount': amount,
        'orderIndex': orderIndex,
        'status': status.name.toUpperCase(),
        'dueDate': dueDate?.toIso8601String(),
        'completedAt': completedAt?.toIso8601String(),
        'approvedAt': approvedAt?.toIso8601String(),
      };
}

class PaymentModel {
  final String id;
  final String projectId;
  final String quoteId;
  final String clientId;
  final String providerId;
  final double totalAmount;
  final double releasedAmount;
  final PaymentStatus status;
  final PaymentMethod? paymentMethod;
  final List<MilestoneModel> milestones;
  final String? transactionId;
  final String? escrowReference;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const PaymentModel({
    required this.id,
    required this.projectId,
    required this.quoteId,
    required this.clientId,
    required this.providerId,
    required this.totalAmount,
    this.releasedAmount = 0,
    required this.status,
    this.paymentMethod,
    this.milestones = const [],
    this.transactionId,
    this.escrowReference,
    required this.createdAt,
    this.updatedAt,
  });

  double get pendingAmount => totalAmount - releasedAmount;
  double get progressPercent =>
      totalAmount > 0 ? releasedAmount / totalAmount : 0;

  int get completedMilestones =>
      milestones.where((m) => m.isApprovedOrReleased).length;
  int get totalMilestones => milestones.length;

  bool get isEscrowed => status == PaymentStatus.escrowed;

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      quoteId: json['quoteId'] as String,
      clientId: json['clientId'] as String,
      providerId: json['providerId'] as String,
      totalAmount: (json['totalAmount'] as num).toDouble(),
      releasedAmount: (json['releasedAmount'] as num?)?.toDouble() ?? 0,
      status: PaymentStatusExt.fromString(
          json['status'] as String? ?? 'PENDING'),
      paymentMethod: _parsePaymentMethod(json['paymentMethod'] as String?),
      milestones: (json['milestones'] as List<dynamic>?)
              ?.map((e) => MilestoneModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      transactionId: json['transactionId'] as String?,
      escrowReference: json['escrowReference'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  static PaymentMethod? _parsePaymentMethod(String? s) {
    if (s == null) return null;
    switch (s.toUpperCase()) {
      case 'MOBILE_MONEY':
        return PaymentMethod.mobileMoney;
      case 'BANK_TRANSFER':
        return PaymentMethod.bankTransfer;
      case 'CASH':
        return PaymentMethod.cash;
      default:
        return null;
    }
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'projectId': projectId,
        'quoteId': quoteId,
        'clientId': clientId,
        'providerId': providerId,
        'totalAmount': totalAmount,
        'releasedAmount': releasedAmount,
        'status': status.name.toUpperCase(),
        'paymentMethod': paymentMethod?.name.toUpperCase(),
        'milestones': milestones.map((m) => m.toJson()).toList(),
        'transactionId': transactionId,
        'escrowReference': escrowReference,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is PaymentModel && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
