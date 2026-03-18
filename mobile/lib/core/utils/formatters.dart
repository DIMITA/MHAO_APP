import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  // ── Currency ──────────────────────────────────────────────────────────────

  static String formatCFA(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'fr_FR',
      symbol: 'FCFA',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  static String formatCFACompact(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M FCFA';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(0)}k FCFA';
    }
    return '${amount.toStringAsFixed(0)} FCFA';
  }

  static String formatBudgetRange(double min, double max) {
    return '${formatCFACompact(min)} – ${formatCFACompact(max)}';
  }

  // ── Date ──────────────────────────────────────────────────────────────────

  static String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy', 'fr_FR').format(date);
  }

  static String formatDateLong(DateTime date) {
    return DateFormat('d MMMM yyyy', 'fr_FR').format(date);
  }

  static String formatDateTime(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm', 'fr_FR').format(date);
  }

  static String formatRelative(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 1) return 'À l\'instant';
    if (diff.inMinutes < 60) return 'Il y a ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'Il y a ${diff.inHours}h';
    if (diff.inDays < 7) return 'Il y a ${diff.inDays}j';
    return formatDate(date);
  }

  // ── Phone ─────────────────────────────────────────────────────────────────

  static String formatBeninPhone(String phone) {
    // Format: +229 XX XX XX XX
    final cleaned = phone.replaceAll(RegExp(r'\D'), '');
    if (cleaned.length == 8) {
      return '+229 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} '
          '${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)}';
    }
    return phone;
  }

  static String maskPhone(String phone) {
    if (phone.length < 4) return phone;
    final last4 = phone.substring(phone.length - 4);
    final masked = 'X' * (phone.length - 4);
    return '$masked$last4';
  }

  // ── Names ─────────────────────────────────────────────────────────────────

  static String formatFullName(String firstName, String lastName) {
    return '$firstName $lastName'.trim();
  }

  static String getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  // ── Numbers ───────────────────────────────────────────────────────────────

  static String formatRating(double rating) {
    return rating.toStringAsFixed(1);
  }

  static String formatCount(int count) {
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(0)}k';
    return count.toString();
  }
}
