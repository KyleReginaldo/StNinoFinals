import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
    pool: false,
  });
}

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

// ─── Shared email shell ────────────────────────────────────────────
// All templates use this wrapper for consistent branding.
function emailShell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
  <!-- Header -->
  <tr><td style="background-color:#7f1d1d;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">Sto. Niño de Praga Academy</h1>
    <p style="margin:6px 0 0;color:#fca5a5;font-size:12px;text-transform:uppercase;letter-spacing:1px;">School Management Portal</p>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:40px;">
    ${bodyHtml}
  </td></tr>
  <!-- Footer -->
  <tr><td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">Sto. Niño de Praga Academy</p>
    <p style="margin:0;color:#d1d5db;font-size:11px;">This is an automated message. Please do not reply.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:12px 0 28px;">
    <a href="${href}" style="display:inline-block;background-color:#7f1d1d;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:4px;font-weight:600;font-size:15px;">${label}</a>
  </td></tr></table>`;
}

function infoBox(rows: string, borderColor = '#7f1d1d'): string {
  return `<div style="background-color:#f9fafb;padding:20px;margin:20px 0;border-left:4px solid ${borderColor};border-radius:2px;">
    ${rows}
  </div>`;
}

function infoRow(label: string, value: string): string {
  return `<p style="margin:8px 0;color:#4b5563;font-size:14px;"><strong style="color:#1f2937;">${label}:</strong> ${value}</p>`;
}

function warningBox(text: string): string {
  return `<div style="background-color:#fef3c7;padding:14px 16px;margin:20px 0;border-left:4px solid #f59e0b;border-radius:2px;">
    <p style="margin:0;color:#92400e;font-size:13px;"><strong>⚠ Security Notice:</strong> ${text}</p>
  </div>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 20px;"/>`;
}

// ─── Email service ─────────────────────────────────────────────────

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<void> {
    const MAX_RETRIES = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const transporter = createTransporter();
      try {
        const response = await transporter.sendMail({
          from: process.env.SMTP_EMAIL,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        console.log(`Email sent (attempt ${attempt}): ${response.messageId}`);
        return;
      } catch (error) {
        lastError = error;
        console.error(`Email attempt ${attempt}/${MAX_RETRIES} failed:`, error);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      } finally {
        transporter.close();
      }
    }

    throw lastError;
  }

  // ── Welcome / Login Credentials ──────────────────────────────────
  static async sendLoginCredentials(credentials: LoginCredentials): Promise<void> {
    const role = credentials.role.charAt(0).toUpperCase() + credentials.role.slice(1);

    const html = emailShell(`
      <h2 style="margin:0 0 16px;color:#7f1d1d;font-size:22px;font-weight:700;">Welcome!</h2>
      <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
        Dear ${credentials.name}, your account has been created. Here are your login credentials:
      </p>
      ${infoBox(
        infoRow('Email', credentials.email) +
        infoRow('Password', credentials.password) +
        infoRow('Role', role)
      )}
      ${warningBox('Please change your password after your first login.')}
      ${btn(credentials.loginUrl, 'Login to Portal')}
      ${divider()}
      <p style="margin:0;color:#6b7280;font-size:13px;">If you have any questions, please contact the school administration.</p>
    `);

    const text = `Welcome to Sto. Niño de Praga Academy\n\nDear ${credentials.name},\n\nYour account has been created.\n\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nRole: ${role}\n\nPlease change your password after your first login.\n\nLogin: ${credentials.loginUrl}`;

    await this.sendEmail({
      to: credentials.email,
      subject: 'Welcome to Sto. Niño de Praga Academy — Your Login Credentials',
      text,
      html,
    });
  }

  // ── Admission Approved ───────────────────────────────────────────
  static async sendAdmissionApproval(data: AdmissionApprovalData): Promise<void> {
    const html = emailShell(`
      <h2 style="margin:0 0 16px;color:#7f1d1d;font-size:22px;font-weight:700;">Admission Approved</h2>
      <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
        Dear ${data.parentName}, we are pleased to inform you that the admission for
        <strong>${data.studentFirstName} ${data.studentLastName}</strong> has been approved.
      </p>
      ${infoBox(
        `<p style="margin:0 0 12px;color:#7f1d1d;font-size:14px;font-weight:700;">Student Portal Access</p>` +
        infoRow('Email', data.email) +
        infoRow('Temporary Password', data.password) +
        infoRow('Grade Level', data.gradeLevel)
      )}
      ${warningBox('Please change the password after first login.')}
      ${btn(data.loginUrl, 'Access Student Portal')}
      ${divider()}
      <p style="margin:0;color:#6b7280;font-size:13px;">If you have any questions, please contact the admissions office.</p>
    `);

    const text = `Admission Approved\n\nDear ${data.parentName},\n\nThe admission for ${data.studentFirstName} ${data.studentLastName} has been approved.\n\nEmail: ${data.email}\nTemporary Password: ${data.password}\nGrade Level: ${data.gradeLevel}\n\nPlease change the password after first login.\n\nLogin: ${data.loginUrl}`;

    await this.sendEmail({
      to: data.email,
      subject: 'Sto. Niño de Praga Academy — Admission Approved',
      text,
      html,
    });
  }

  // ── Attendance Notification ──────────────────────────────────────
  static async sendAttendanceNotification(data: AttendanceNotificationData): Promise<void> {
    const scanTypeText = data.scanType === 'timein' ? 'timed in' : 'timed out';
    const borderColor = data.scanType === 'timein' ? '#16a34a' : '#ea580c';

    const html = emailShell(`
      <h2 style="margin:0 0 16px;color:#7f1d1d;font-size:22px;font-weight:700;">Attendance Notification</h2>
      <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
        Dear Parent/Guardian, your child has <strong>${scanTypeText}</strong> at school.
      </p>
      ${infoBox(
        infoRow('Student', data.studentName) +
        infoRow('Grade & Section', `${data.gradeLevel} — ${data.section}`) +
        infoRow('Status', scanTypeText.charAt(0).toUpperCase() + scanTypeText.slice(1)) +
        infoRow('Time', data.scanTime),
        borderColor
      )}
      ${divider()}
      <p style="margin:0;color:#6b7280;font-size:13px;">This is an automated notification from the RFID attendance system.</p>
    `);

    const text = `Attendance Notification\n\nDear Parent/Guardian,\n\nYour child has ${scanTypeText} at school.\n\nStudent: ${data.studentName}\nGrade & Section: ${data.gradeLevel} — ${data.section}\nStatus: ${scanTypeText}\nTime: ${data.scanTime}\n\nThis is an automated notification from the RFID attendance system.`;

    await this.sendEmail({
      to: data.parentEmail,
      subject: `Attendance Alert: ${data.studentName} has ${scanTypeText}`,
      text,
      html,
    });
  }

  // ── Admission Rejected ───────────────────────────────────────────
  static async sendAdmissionRejection(data: AdmissionRejectionData): Promise<void> {
    const html = emailShell(`
      <h2 style="margin:0 0 16px;color:#7f1d1d;font-size:22px;font-weight:700;">Admission Update</h2>
      <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
        Dear ${data.parentName}, thank you for your interest in Sto. Niño de Praga Academy.
        After careful review, the admission application for
        <strong>${data.studentFirstName} ${data.studentLastName}</strong> was not approved at this time.
      </p>
      ${data.reason ? infoBox(
        `<p style="margin:0 0 8px;color:#dc2626;font-size:14px;font-weight:700;">Reason</p>
         <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.5;">${data.reason}</p>`,
        '#dc2626'
      ) : ''}
      <p style="margin:0 0 0;color:#4b5563;font-size:15px;line-height:1.6;">
        We encourage you to reach out to our admissions office if you have any questions.
      </p>
      ${divider()}
      <p style="margin:0;color:#6b7280;font-size:13px;">Best regards, Sto. Niño de Praga Academy</p>
    `);

    const text = `Admission Update\n\nDear ${data.parentName},\n\nThe admission application for ${data.studentFirstName} ${data.studentLastName} was not approved at this time.\n\n${data.reason ? `Reason: ${data.reason}\n\n` : ''}We encourage you to reach out to our admissions office if you have any questions.\n\nBest regards,\nSto. Niño de Praga Academy`;

    await this.sendEmail({
      to: data.email,
      subject: 'Sto. Niño de Praga Academy — Admission Application Update',
      text,
      html,
    });
  }
}
