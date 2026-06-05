import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com' as string,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS?.replace(/\s/g, ''),
    },
    tls: { rejectUnauthorized: false },
  } as nodemailer.TransportOptions);
}

function getLogoPath(): string {
  return path.join(process.cwd(), 'public', 'logo.png');
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Email shell ───────────────────────────────────────────────────────────────
// Matches the professional school-letterhead style (maroon header, white body,
// gray footer). Logo is embedded via CID so it renders in all major clients.
function emailShell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Sto. Niño de Praga Academy</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:'Georgia',serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:36px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:2px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.12);">

  <!-- ── LETTERHEAD HEADER ───────────────────────────────────────── -->
  <tr>
    <td style="background-color:#7f1d1d;padding:32px 40px 28px;text-align:center;border-bottom:3px solid #b91c1c;">
      <!-- Inner border frame -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.25);border-radius:2px;">
        <tr><td style="padding:20px 24px;text-align:center;">
          <!-- Logo -->
          <img src="cid:school_logo" alt="School Logo"
               width="80" height="80"
               style="border-radius:50%;border:3px solid rgba(255,255,255,0.4);display:inline-block;margin-bottom:14px;"/>
          <!-- School name -->
          <h1 style="margin:0 0 4px;color:#ffffff;font-family:'Georgia',serif;font-size:22px;font-weight:700;letter-spacing:0.5px;line-height:1.3;">
            Sto. Niño de Praga Academy
          </h1>
          <p style="margin:0 0 2px;color:#fca5a5;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">
            of La Paz Homes II, Inc.
          </p>
          <p style="margin:10px 0 0;color:#fecaca;font-family:Arial,sans-serif;font-size:12px;">
            stninomain@gmail.com &nbsp;|&nbsp; La Paz Homes II, Philippines
          </p>
        </td></tr>
      </table>
    </td>
  </tr>

  <!-- ── LETTER BODY ─────────────────────────────────────────────── -->
  <tr>
    <td style="padding:40px 48px 32px;background-color:#ffffff;">

      <!-- Date -->
      <p style="margin:0 0 24px;color:#6b7280;font-family:Arial,sans-serif;font-size:13px;">
        ${formatDate()}
      </p>

      <!-- Content -->
      ${bodyHtml}

      <!-- Divider -->
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 0;"/>
    </td>
  </tr>

  <!-- ── FOOTER ──────────────────────────────────────────────────── -->
  <tr>
    <td style="background-color:#f9fafb;padding:20px 48px;border-top:1px solid #e5e7eb;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align:center;">
            <p style="margin:0 0 4px;color:#374151;font-family:Arial,sans-serif;font-size:12px;font-weight:700;">
              Sto. Niño de Praga Academy of La Paz Homes II, Inc.
            </p>
            <p style="margin:0 0 4px;color:#6b7280;font-family:Arial,sans-serif;font-size:11px;">
              La Paz Homes II, Philippines &nbsp;|&nbsp; stninomain@gmail.com
            </p>
            <p style="margin:8px 0 0;color:#9ca3af;font-family:Arial,sans-serif;font-size:10px;font-style:italic;">
              This is an official communication from Sto. Niño de Praga Academy.
              Please do not reply directly to this email.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── BOTTOM ACCENT ───────────────────────────────────────────── -->
  <tr>
    <td style="background-color:#7f1d1d;height:6px;"></td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function sectionTitle(text: string): string {
  return `<h2 style="margin:0 0 16px;color:#7f1d1d;font-family:'Georgia',serif;font-size:20px;font-weight:700;border-bottom:2px solid #f3f4f6;padding-bottom:10px;">${text}</h2>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 16px;color:#374151;font-family:Arial,sans-serif;font-size:14px;line-height:1.75;text-align:justify;">${text}</p>`;
}

function infoBox(rows: string, borderColor = '#7f1d1d'): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:#fafafa;border-left:4px solid ${borderColor};border-radius:2px;">
    <tr><td style="padding:16px 20px;">${rows}</td></tr>
  </table>`;
}

function infoRow(label: string, value: string): string {
  return `<p style="margin:6px 0;color:#4b5563;font-family:Arial,sans-serif;font-size:13px;">
    <strong style="color:#1f2937;min-width:160px;display:inline-block;">${label}</strong> ${value}
  </p>`;
}

function warningBox(text: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:#fffbeb;border-left:4px solid #f59e0b;border-radius:2px;">
    <tr><td style="padding:14px 16px;">
      <p style="margin:0;color:#92400e;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;">
        <strong>⚠ Security Notice:</strong> ${text}
      </p>
    </td></tr>
  </table>`;
}

function actionBtn(href: string, label: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td align="center">
      <a href="${href}"
         style="display:inline-block;background-color:#7f1d1d;color:#ffffff;padding:14px 40px;
                text-decoration:none;border-radius:2px;font-family:Arial,sans-serif;
                font-weight:700;font-size:14px;letter-spacing:0.5px;">
        ${label}
      </a>
    </td></tr>
  </table>`;
}

function salutation(name: string): string {
  return `<p style="margin:0 0 20px;color:#374151;font-family:Arial,sans-serif;font-size:14px;line-height:1.75;">Dear <strong>${name}</strong>,</p>`;
}

function closing(signerName = 'The Admissions Office', signerTitle = 'Sto. Niño de Praga Academy'): string {
  return `<p style="margin:24px 0 6px;color:#374151;font-family:Arial,sans-serif;font-size:14px;">Sincerely,</p>
  <p style="margin:0 0 2px;color:#1f2937;font-family:'Georgia',serif;font-size:14px;font-weight:700;">${signerName}</p>
  <p style="margin:0;color:#6b7280;font-family:Arial,sans-serif;font-size:12px;">${signerTitle}</p>`;
}

// ─── Email interface ────────────────────────────────────────────────────────────

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface LoginCredentials {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'parent' | 'teacher';
  loginUrl: string;
}

interface AdmissionApprovalData {
  parentName: string;
  studentFirstName: string;
  studentLastName: string;
  email: string;
  password: string;
  gradeLevel: string;
  loginUrl: string;
}

interface AttendanceNotificationData {
  parentEmail: string;
  studentName: string;
  gradeLevel: string;
  section: string;
  scanType: 'timein' | 'timeout';
  scanTime: string;
}

interface AdmissionRejectionData {
  parentName: string;
  studentFirstName: string;
  studentLastName: string;
  email: string;
  reason: string;
}

// ─── Email service ──────────────────────────────────────────────────────────────

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<void> {
    const logoPath = getLogoPath();
    const hasLogo = fs.existsSync(logoPath);
    const transporter = createTransporter();
    try {
      const response = await transporter.sendMail({
        from: `"Sto. Niño de Praga Academy" <${process.env.SMTP_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: hasLogo
          ? [{ filename: 'logo.png', path: logoPath, cid: 'school_logo' }]
          : [],
      });
      console.log(`[email] sent: ${response.messageId}`);
    } finally {
      transporter.close();
    }
  }

  // ── Welcome / Login Credentials ──────────────────────────────────────────────
  static async sendLoginCredentials(credentials: LoginCredentials): Promise<void> {
    const role = credentials.role.charAt(0).toUpperCase() + credentials.role.slice(1);
    const html = emailShell(`
      ${sectionTitle('Welcome to Sto. Niño de Praga Academy')}
      ${salutation(credentials.name)}
      ${para(`Your ${role.toLowerCase()} account has been created. Below are your login credentials to access the school portal. Please keep this information confidential.`)}
      ${infoBox(
        infoRow('Email Address', credentials.email) +
        infoRow('Temporary Password', `<code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:13px;">${credentials.password}</code>`) +
        infoRow('Account Role', role)
      )}
      ${warningBox('For your security, you are required to change your password upon your first login.')}
      ${actionBtn(credentials.loginUrl, 'Access Your Portal')}
      ${para('If you have any questions or need assistance, please do not hesitate to contact the school administration.')}
      ${closing()}
    `);

    const text = `Welcome to Sto. Niño de Praga Academy\n\nDear ${credentials.name},\n\nYour account has been created.\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nRole: ${role}\n\nPlease change your password after your first login.\nLogin: ${credentials.loginUrl}`;

    await this.sendEmail({
      to: credentials.email,
      subject: 'Welcome to Sto. Niño de Praga Academy — Your Login Credentials',
      text,
      html,
    });
  }

  // ── Admission Approved ────────────────────────────────────────────────────────
  static async sendAdmissionApproval(data: AdmissionApprovalData): Promise<void> {
    const html = emailShell(`
      ${sectionTitle('Admission Approved')}
      ${salutation(data.parentName)}
      ${para(`We are delighted to inform you that the admission application for <strong>${data.studentFirstName} ${data.studentLastName}</strong> has been reviewed and <strong style="color:#16a34a;">approved</strong> by the Admissions Committee of Sto. Niño de Praga Academy.`)}
      ${para(`A student portal account has been created. Please find the login credentials below:`)}
      ${infoBox(
        `<p style="margin:0 0 10px;color:#7f1d1d;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Student Portal Access</p>` +
        infoRow('Student', `${data.studentFirstName} ${data.studentLastName}`) +
        infoRow('Email Address', data.email) +
        infoRow('Temporary Password', `<code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:13px;">${data.password}</code>`) +
        infoRow('Grade Level', data.gradeLevel)
      )}
      ${warningBox('Please change the password immediately upon the first login for security purposes.')}
      ${actionBtn(data.loginUrl, 'Access Student Portal')}
      ${para('We look forward to welcoming your child to our school community. Should you have any questions, please reach out to the admissions office.')}
      ${closing('The Admissions Office')}
    `);

    const text = `Admission Approved\n\nDear ${data.parentName},\n\nThe admission for ${data.studentFirstName} ${data.studentLastName} has been approved.\n\nEmail: ${data.email}\nTemporary Password: ${data.password}\nGrade Level: ${data.gradeLevel}\n\nPlease change the password after first login.\n\nLogin: ${data.loginUrl}`;

    await this.sendEmail({
      to: data.email,
      subject: 'Sto. Niño de Praga Academy — Admission Approved 🎉',
      text,
      html,
    });
  }

  // ── Admission Rejected ────────────────────────────────────────────────────────
  static async sendAdmissionRejection(data: AdmissionRejectionData): Promise<void> {
    const html = emailShell(`
      ${sectionTitle('Admission Application Update')}
      ${salutation(data.parentName)}
      ${para(`Thank you for your interest in enrolling <strong>${data.studentFirstName} ${data.studentLastName}</strong> at Sto. Niño de Praga Academy. We sincerely appreciate the time and effort you put into the application.`)}
      ${para(`After careful deliberation by the Admissions Committee, we regret to inform you that the application has <strong style="color:#dc2626;">not been approved</strong> at this time.`)}
      ${data.reason ? infoBox(
        `<p style="margin:0 0 8px;color:#dc2626;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Reason for Decision</p>
         <p style="margin:0;color:#4b5563;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;">${data.reason}</p>`,
        '#dc2626'
      ) : ''}
      ${para(`We encourage you to contact our admissions office if you have questions or would like guidance on reapplication in the future.`)}
      ${closing('The Admissions Office')}
    `);

    const text = `Admission Update\n\nDear ${data.parentName},\n\nThe admission application for ${data.studentFirstName} ${data.studentLastName} was not approved at this time.\n\n${data.reason ? `Reason: ${data.reason}\n\n` : ''}Please reach out to our admissions office if you have any questions.\n\nBest regards,\nSto. Niño de Praga Academy`;

    await this.sendEmail({
      to: data.email,
      subject: 'Sto. Niño de Praga Academy — Admission Application Update',
      text,
      html,
    });
  }

  // ── Ad-hoc composed email (wraps body in letterhead) ─────────────────────────
  static async sendComposedEmail(to: string, subject: string, bodyText: string): Promise<void> {
    const bodyHtml = bodyText
      .split(/\n{2,}/)
      .map((block) =>
        `<p style="margin:0 0 16px;color:#374151;font-family:Arial,sans-serif;font-size:14px;line-height:1.75;text-align:justify;">${
          block
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>')
        }</p>`
      )
      .join('');

    const html = emailShell(bodyHtml);
    await this.sendEmail({ to, subject, text: bodyText, html });
  }

  // ── Attendance Notification ───────────────────────────────────────────────────
  static async sendAttendanceNotification(data: AttendanceNotificationData): Promise<void> {
    const scanTypeText = data.scanType === 'timein' ? 'arrived at school' : 'left school';
    const actionLabel  = data.scanType === 'timein' ? 'Time In'            : 'Time Out';
    const borderColor  = data.scanType === 'timein' ? '#16a34a'            : '#ea580c';

    const html = emailShell(`
      ${sectionTitle('Attendance Notification')}
      ${salutation('Parent / Guardian')}
      ${para(`This is an automated notification to inform you that your child has <strong>${scanTypeText}</strong> as recorded by the RFID attendance system.`)}
      ${infoBox(
        infoRow('Student Name', data.studentName) +
        infoRow('Grade & Section', `${data.gradeLevel} — ${data.section}`) +
        infoRow('Activity', actionLabel) +
        infoRow('Date & Time', data.scanTime),
        borderColor
      )}
      ${para(`If you believe this notification was sent in error or if you have any concerns, please contact the school immediately.`)}
      ${closing('Attendance Monitoring System', 'Sto. Niño de Praga Academy')}
    `);

    const text = `Attendance Notification\n\nDear Parent/Guardian,\n\nYour child has ${scanTypeText}.\n\nStudent: ${data.studentName}\nGrade & Section: ${data.gradeLevel} — ${data.section}\nActivity: ${actionLabel}\nTime: ${data.scanTime}\n\nThis is an automated notification.`;

    await this.sendEmail({
      to: data.parentEmail,
      subject: `Attendance Alert — ${data.studentName} has ${scanTypeText}`,
      text,
      html,
    });
  }
}
