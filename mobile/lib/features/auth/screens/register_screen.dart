import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/validators.dart';
import '../models/user_model.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  // Step tracking
  int _currentStep = 0;

  // Step 1: Role selection
  UserRole? _selectedRole;

  // Step 2: Personal info
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final dto = RegisterDto(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      password: _passwordController.text,
      role: _selectedRole!,
    );

    await ref.read(authProvider.notifier).register(dto);

    if (!mounted) return;

    final state = ref.read(authProvider);
    if (state.hasError) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(state.error.toString()),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    // Save phone for OTP verification
    ref.read(pendingPhoneProvider.notifier).state = _phoneController.text.trim();
    context.push(AppRoutes.verifyOtp, extra: _phoneController.text.trim());
  }

  void _nextStep() {
    if (_currentStep == 0 && _selectedRole == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez choisir votre rôle')),
      );
      return;
    }
    setState(() => _currentStep = 1);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () {
            if (_currentStep > 0) {
              setState(() => _currentStep = 0);
            } else {
              context.pop();
            }
          },
        ),
        title: const Text('Créer un compte'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Step indicator
            _StepperIndicator(
              steps: const ['Rôle', 'Informations'],
              currentStep: _currentStep,
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _currentStep == 0
                      ? _RoleStep(
                          key: const ValueKey('role'),
                          selectedRole: _selectedRole,
                          onRoleSelected: (role) =>
                              setState(() => _selectedRole = role),
                          onNext: _nextStep,
                        )
                      : _InfoStep(
                          key: const ValueKey('info'),
                          formKey: _formKey,
                          firstNameController: _firstNameController,
                          lastNameController: _lastNameController,
                          emailController: _emailController,
                          phoneController: _phoneController,
                          passwordController: _passwordController,
                          confirmPasswordController: _confirmPasswordController,
                          obscurePassword: _obscurePassword,
                          obscureConfirm: _obscureConfirm,
                          onTogglePassword: () => setState(
                              () => _obscurePassword = !_obscurePassword),
                          onToggleConfirm: () => setState(
                              () => _obscureConfirm = !_obscureConfirm),
                          isLoading: isLoading,
                          onSubmit: _submit,
                        ),
                ),
              ),
            ),

            // Login link
            Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Déjà un compte? ',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  TextButton(
                    onPressed: () => context.go(AppRoutes.login),
                    child: const Text('Se connecter'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Step indicator ────────────────────────────────────────────────────────────

class _StepperIndicator extends StatelessWidget {
  final List<String> steps;
  final int currentStep;

  const _StepperIndicator({
    required this.steps,
    required this.currentStep,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: Row(
        children: List.generate(steps.length * 2 - 1, (index) {
          if (index.isOdd) {
            // Connector line
            final stepIndex = index ~/ 2;
            final isCompleted = stepIndex < currentStep;
            return Expanded(
              child: Container(
                height: 2,
                color: isCompleted ? AppColors.primary : AppColors.divider,
              ),
            );
          }

          final stepIndex = index ~/ 2;
          final isActive = stepIndex == currentStep;
          final isCompleted = stepIndex < currentStep;

          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isCompleted || isActive
                      ? AppColors.primary
                      : AppColors.background,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isCompleted || isActive
                        ? AppColors.primary
                        : AppColors.border,
                    width: 2,
                  ),
                ),
                child: Center(
                  child: isCompleted
                      ? const Icon(Icons.check, size: 16, color: Colors.white)
                      : Text(
                          '${stepIndex + 1}',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isActive
                                ? Colors.white
                                : AppColors.textSecondary,
                          ),
                        ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                steps[stepIndex],
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  fontWeight:
                      isActive ? FontWeight.w600 : FontWeight.w400,
                  color: isActive || isCompleted
                      ? AppColors.textPrimary
                      : AppColors.textSecondary,
                ),
              ),
            ],
          );
        }),
      ),
    );
  }
}

// ── Step 1: Role ──────────────────────────────────────────────────────────────

class _RoleStep extends StatelessWidget {
  final UserRole? selectedRole;
  final ValueChanged<UserRole> onRoleSelected;
  final VoidCallback onNext;

  const _RoleStep({
    super.key,
    required this.selectedRole,
    required this.onRoleSelected,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Je suis…',
          style: Theme.of(context).textTheme.displaySmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Choisissez votre rôle sur la plateforme.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
        const SizedBox(height: 32),

        // CLIENT card
        _RoleCard(
          role: UserRole.client,
          icon: Icons.person_outlined,
          title: 'Client',
          description:
              'Je cherche des artisans pour mes projets de construction ou rénovation.',
          isSelected: selectedRole == UserRole.client,
          onTap: () => onRoleSelected(UserRole.client),
        ),
        const SizedBox(height: 16),

        // PROVIDER card
        _RoleCard(
          role: UserRole.prestataire,
          icon: Icons.engineering_outlined,
          title: 'Prestataire',
          description:
              'Je suis artisan ou entrepreneur et je cherche des clients.',
          isSelected: selectedRole == UserRole.prestataire,
          onTap: () => onRoleSelected(UserRole.prestataire),
        ),

        const SizedBox(height: 40),

        ElevatedButton(
          onPressed: onNext,
          child: const Text('Continuer'),
        ),
      ],
    );
  }
}

class _RoleCard extends StatelessWidget {
  final UserRole role;
  final IconData icon;
  final String title;
  final String description;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleCard({
    required this.role,
    required this.icon,
    required this.title,
    required this.description,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryContainer : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                size: 28,
                color: isSelected ? Colors.white : AppColors.textSecondary,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.textPrimary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                          height: 1.4,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(
              isSelected
                  ? Icons.check_circle_rounded
                  : Icons.radio_button_unchecked_rounded,
              color: isSelected ? AppColors.primary : AppColors.border,
              size: 24,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Step 2: Personal info ─────────────────────────────────────────────────────

class _InfoStep extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController firstNameController;
  final TextEditingController lastNameController;
  final TextEditingController emailController;
  final TextEditingController phoneController;
  final TextEditingController passwordController;
  final TextEditingController confirmPasswordController;
  final bool obscurePassword;
  final bool obscureConfirm;
  final VoidCallback onTogglePassword;
  final VoidCallback onToggleConfirm;
  final bool isLoading;
  final VoidCallback onSubmit;

  const _InfoStep({
    super.key,
    required this.formKey,
    required this.firstNameController,
    required this.lastNameController,
    required this.emailController,
    required this.phoneController,
    required this.passwordController,
    required this.confirmPasswordController,
    required this.obscurePassword,
    required this.obscureConfirm,
    required this.onTogglePassword,
    required this.onToggleConfirm,
    required this.isLoading,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Vos informations',
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Remplissez vos informations personnelles.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: 24),

          // First + Last name row
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: firstNameController,
                  textCapitalization: TextCapitalization.words,
                  textInputAction: TextInputAction.next,
                  validator: (v) => Validators.required(v, 'Prénom'),
                  decoration: const InputDecoration(labelText: 'Prénom'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: lastNameController,
                  textCapitalization: TextCapitalization.words,
                  textInputAction: TextInputAction.next,
                  validator: (v) => Validators.required(v, 'Nom'),
                  decoration: const InputDecoration(labelText: 'Nom'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Email
          TextFormField(
            controller: emailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            validator: Validators.email,
            decoration: const InputDecoration(
              labelText: 'Adresse email',
              prefixIcon: Icon(Icons.email_outlined),
            ),
          ),
          const SizedBox(height: 16),

          // Phone
          TextFormField(
            controller: phoneController,
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.next,
            validator: Validators.beninPhone,
            decoration: const InputDecoration(
              labelText: 'Téléphone',
              hintText: '97 XX XX XX',
              prefixIcon: Icon(Icons.phone_outlined),
              prefixText: '+229 ',
            ),
          ),
          const SizedBox(height: 16),

          // Password
          TextFormField(
            controller: passwordController,
            obscureText: obscurePassword,
            textInputAction: TextInputAction.next,
            validator: Validators.password,
            decoration: InputDecoration(
              labelText: 'Mot de passe',
              prefixIcon: const Icon(Icons.lock_outline),
              suffixIcon: IconButton(
                icon: Icon(
                  obscurePassword
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                  color: AppColors.textSecondary,
                ),
                onPressed: onTogglePassword,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Confirm password
          TextFormField(
            controller: confirmPasswordController,
            obscureText: obscureConfirm,
            textInputAction: TextInputAction.done,
            validator: (v) =>
                Validators.confirmPassword(v, passwordController.text),
            decoration: InputDecoration(
              labelText: 'Confirmer le mot de passe',
              prefixIcon: const Icon(Icons.lock_outline),
              suffixIcon: IconButton(
                icon: Icon(
                  obscureConfirm
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                  color: AppColors.textSecondary,
                ),
                onPressed: onToggleConfirm,
              ),
            ),
          ),

          const SizedBox(height: 32),

          // Submit
          ElevatedButton(
            onPressed: isLoading ? null : onSubmit,
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text('Créer mon compte'),
          ),
        ],
      ),
    );
  }
}
