import 'package:flutter/material.dart';

import '../features/projects/models/project_model.dart';
import '../features/quotes/models/quote_model.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  final Color backgroundColor;
  final double fontSize;

  const StatusBadge({
    super.key,
    required this.label,
    required this.color,
    required this.backgroundColor,
    this.fontSize = 11,
  });

  factory StatusBadge.fromProjectStatus(ProjectStatus status) {
    return StatusBadge(
      label: status.label,
      color: status.color,
      backgroundColor: status.backgroundColor,
    );
  }

  factory StatusBadge.fromQuoteStatus(QuoteStatus status) {
    return StatusBadge(
      label: status.label,
      color: status.color,
      backgroundColor: status.backgroundColor,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Poppins',
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
