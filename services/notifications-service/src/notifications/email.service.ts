import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isDev: boolean;
  private transporter: any;

  constructor(private readonly configService: ConfigService) {
    this.isDev = this.configService.get<string>('NODE_ENV', 'development') === 'development';
    if (!this.isDev) {
      this.initializeTransporter();
    }
  }

  private initializeTransporter(): void {
    try {
      const nodemailer = require('nodemailer');
      const smtpHost = this.configService.get<string>('SMTP_HOST');
      const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
      const smtpUser = this.configService.get<string>('SMTP_USER');
      const smtpPass = this.configService.get<string>('SMTP_PASS');

      if (!smtpHost || !smtpUser || !smtpPass) {
        this.logger.warn('SMTP credentials not configured; email sending disabled');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      this.logger.log(`Email transporter initialized (${smtpHost}:${smtpPort})`);
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error);
    }
  }

  private renderTemplate(template: string, context: Record<string, unknown>): string {
    const templates: Record<string, (ctx: Record<string, unknown>) => string> = {
      'project-alert': (ctx) =>
        `<h2>Nouveau projet disponible</h2><p>Un nouveau projet "${ctx.projectTitle}" correspond à votre profil. Connectez-vous pour soumettre votre devis.</p>`,
      'quote-accepted': (ctx) =>
        `<h2>Votre devis a été accepté !</h2><p>Félicitations ! Votre devis pour le projet "${ctx.projectTitle}" a été accepté. Le client vous contactera bientôt.</p>`,
      'payment-received': (ctx) =>
        `<h2>Paiement reçu</h2><p>Votre paiement de ${ctx.amount} FCFA a été reçu et placé en escrow pour votre projet.</p>`,
      'milestone-approved': (ctx) =>
        `<h2>Milestone approuvé</h2><p>Le milestone "${ctx.milestoneTitle}" a été approuvé. Un paiement de ${ctx.amount} FCFA vous sera versé.</p>`,
      'kyc-verified': (ctx) =>
        `<h2>Profil vérifié</h2><p>Votre profil prestataire a été vérifié. Vous pouvez maintenant répondre aux projets sur MHAO.</p>`,
      'kyc-rejected': (ctx) =>
        `<h2>Vérification rejetée</h2><p>Votre demande de vérification a été rejetée. Raison: ${ctx.reason ?? 'Non spécifiée'}. Veuillez soumettre à nouveau vos documents.</p>`,
      'dispute-resolved': (ctx) =>
        `<h2>Litige résolu</h2><p>Le litige pour votre projet a été résolu. Résolution: ${ctx.resolution}. ${ctx.reason ?? ''}</p>`,
    };

    const templateFn = templates[template];
    if (templateFn) {
      return templateFn(context);
    }

    return `<p>${JSON.stringify(context)}</p>`;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, template, context } = options;
    const htmlContent = this.renderTemplate(template, context);

    if (this.isDev) {
      this.logger.log(
        `[DEV] Email → to=${to} | subject="${subject}" | template=${template} | context=${JSON.stringify(context)}`,
      );
      return;
    }

    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized; skipping email');
      return;
    }

    try {
      const fromAddress = this.configService.get<string>('EMAIL_FROM', 'noreply@mhao.app');
      const info = await this.transporter.sendMail({
        from: `"MHAO Platform" <${fromAddress}>`,
        to,
        subject,
        html: htmlContent,
      });
      this.logger.log(`Email sent: ${info.messageId} → ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }
}
