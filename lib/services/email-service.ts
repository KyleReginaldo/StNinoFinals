import nodemailer from 'nodemailer';

// Create a fresh transporter for every send to avoid stale connection issues.
// A module-level singleton transporter can have its SMTP connection silently
// expire, which causes random/intermittent send failures.
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS upgrade on port 587
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // No connection pooling — always open a fresh connection
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
        return; // success — stop retrying
      } catch (error) {
        lastError = error;
        console.error(`Email attempt ${attempt}/${MAX_RETRIES} failed:`, error);
        if (attempt < MAX_RETRIES) {
          // Wait 1s before retrying to let transient SMTP issues clear
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      } finally {
        // Always close the connection to avoid resource leaks
        transporter.close();
      }
    }

    throw lastError;
  }

  static async sendLoginCredentials(
    credentials: LoginCredentials
  ): Promise<void> {
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9f9f9;
                border-radius: 10px;
                padding: 30px;
                border: 1px solid #ddd;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #2c3e50;
                margin: 0;
              }
              .credentials {
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #3498db;
              }
              .credentials p {
                margin: 10px 0;
              }
              .credentials strong {
                color: #2c3e50;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .login-button {
                display: inline-block;
                background-color: #3498db;
                color: #ffffff !important;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
              }
              .login-button:hover {
                background-color: #2980b9;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                color: #7f8c8d;
                font-size: 14px;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to St. Niño Portal</h1>
              </div>
              
              <p>Dear ${credentials.name},</p>
              
              <p>Your account has been successfully created. Below are your login credentials:</p>
              
              <div class="credentials">
                <p><strong>Email:</strong> ${credentials.email}</p>
                <p><strong>Password:</strong> ${credentials.password}</p>
                <p><strong>Role:</strong> ${credentials.role.charAt(0).toUpperCase() + credentials.role.slice(1)}</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Please change your password after your first login for security purposes.
              </div>
              
              <div class="button-container">
                <a href="${credentials.loginUrl}" class="login-button">Login to Portal</a>
              </div>
              
              <div class="footer">
                <p>If you have any questions or need assistance, please contact the administrator.</p>
                <p>&copy; ${new Date().getFullYear()} St. Niño Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

    const text = `
Welcome to St. Niño Portal

Dear ${credentials.name},

Your account has been successfully created. Below are your login credentials:

Email: ${credentials.email}
Password: ${credentials.password}
Role: ${credentials.role.charAt(0).toUpperCase() + credentials.role.slice(1)}

Please change your password after your first login for security purposes.

Login here: ${credentials.loginUrl}

If you have any questions or need assistance, please contact the administrator.

© ${new Date().getFullYear()} St. Niño Portal. All rights reserved.
      `;

    await this.sendEmail({
      to: credentials.email,
      subject: 'Welcome to St. Niño Portal - Your Login Credentials',
      text: text,
      html: html,
    });
  }

  static async sendAdmissionApproval(
    data: AdmissionApprovalData
  ): Promise<void> {
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9f9f9;
                border-radius: 10px;
                padding: 30px;
                border: 1px solid #ddd;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                color: #7A0C0C;
              }
              .header h1 {
                color: #7A0C0C;
                margin: 0;
              }
              .credentials {
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #7A0C0C;
              }
              .credentials p {
                margin: 10px 0;
              }
              .credentials strong {
                color: #2c3e50;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .login-button {
                display: inline-block;
                background-color: #7A0C0C;
                color: #ffffff !important;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
              }
              .login-button:hover {
                background-color: #5a0909;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                color: #7f8c8d;
                font-size: 14px;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Admission Approved!</h1>
              </div>
              
              <p>Dear ${data.parentName},</p>
              
              <p>Congratulations! We are pleased to inform you that the admission application for <strong>${data.studentFirstName} ${data.studentLastName}</strong> has been approved.</p>
              
              <div class="credentials">
                <h3 style="color: #7A0C0C; margin-top: 0;">Student Portal Access</h3>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Temporary Password:</strong> ${data.password}</p>
                <p><strong>Grade Level:</strong> ${data.gradeLevel}</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Please change your password after first login for security purposes.
              </div>
              
              <div class="button-container">
                <a href="${data.loginUrl}" class="login-button">Access Student Portal</a>
              </div>
              
              <div class="footer">
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br><strong>Sto Niño de Praga Academy</strong></p>
                <p>&copy; ${new Date().getFullYear()} Sto Niño de Praga Academy. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

    const text = `
Admission Approved!

Dear ${data.parentName},

Congratulations! We are pleased to inform you that the admission application for ${data.studentFirstName} ${data.studentLastName} has been approved.

Student Portal Access:
Email: ${data.email}
Temporary Password: ${data.password}
Grade Level: ${data.gradeLevel}

⚠️ Please change your password after first login for security purposes.

You can access the student portal at: ${data.loginUrl}

If you have any questions, please don't hesitate to contact us.

Best regards,
Sto Niño de Praga Academy

© ${new Date().getFullYear()} Sto Niño de Praga Academy. All rights reserved.
      `;

    await this.sendEmail({
      to: data.email,
      subject: 'Welcome to Sto Niño de Praga Academy - Admission Approved!',
      text: text,
      html: html,
    });
  }

  static async sendAttendanceNotification(
    data: AttendanceNotificationData
  ): Promise<void> {
    const scanTypeText = data.scanType === 'timein' ? 'timed in' : 'timed out';
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; border: 1px solid #ddd; }
              .header { text-align: center; margin-bottom: 20px; color: #7A0C0C; }
              .header h1 { color: #7A0C0C; margin: 0; font-size: 22px; }
              .info-box { background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${data.scanType === 'timein' ? '#16a34a' : '#ea580c'}; }
              .info-box p { margin: 8px 0; }
              .footer { margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 13px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Attendance Notification</h1>
              </div>

              <p>Dear Parent/Guardian,</p>

              <p>This is to inform you that your child has <strong>${scanTypeText}</strong> at school.</p>

              <div class="info-box">
                <p><strong>Student:</strong> ${data.studentName}</p>
                <p><strong>Grade & Section:</strong> ${data.gradeLevel} - ${data.section}</p>
                <p><strong>Status:</strong> ${scanTypeText.charAt(0).toUpperCase() + scanTypeText.slice(1)}</p>
                <p><strong>Time:</strong> ${data.scanTime}</p>
              </div>

              <div class="footer">
                <p>This is an automated notification from the RFID attendance system.</p>
                <p>Best regards,<br><strong>Sto Niño de Praga Academy</strong></p>
                <p>&copy; ${new Date().getFullYear()} Sto Niño de Praga Academy. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

    const text = `Attendance Notification\n\nDear Parent/Guardian,\n\nThis is to inform you that your child has ${scanTypeText} at school.\n\nStudent: ${data.studentName}\nGrade & Section: ${data.gradeLevel} - ${data.section}\nStatus: ${scanTypeText}\nTime: ${data.scanTime}\n\nThis is an automated notification from the RFID attendance system.\n\nBest regards,\nSto Niño de Praga Academy`;

    await this.sendEmail({
      to: data.parentEmail,
      subject: `Attendance Alert: ${data.studentName} has ${scanTypeText}`,
      text,
      html,
    });
  }

  static async sendAdmissionRejection(
    data: AdmissionRejectionData
  ): Promise<void> {
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; border: 1px solid #ddd; }
              .header { text-align: center; margin-bottom: 30px; color: #7A0C0C; }
              .header h1 { color: #7A0C0C; margin: 0; }
              .reason-box { background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626; }
              .footer { margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Admission Update</h1>
              </div>

              <p>Dear ${data.parentName},</p>

              <p>Thank you for your interest in Sto Niño de Praga Academy. After careful review, we regret to inform you that the admission application for <strong>${data.studentFirstName} ${data.studentLastName}</strong> was not approved at this time.</p>

              ${data.reason ? `<div class="reason-box"><h3 style="color: #dc2626; margin-top: 0;">Reason</h3><p>${data.reason}</p></div>` : ''}

              <p>We encourage you to reach out to our admissions office if you have any questions or would like to discuss this further.</p>

              <div class="footer">
                <p>Best regards,<br><strong>Sto Niño de Praga Academy</strong></p>
                <p>&copy; ${new Date().getFullYear()} Sto Niño de Praga Academy. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

    const text = `
Admission Update

Dear ${data.parentName},

Thank you for your interest in Sto Niño de Praga Academy. After careful review, we regret to inform you that the admission application for ${data.studentFirstName} ${data.studentLastName} was not approved at this time.

${data.reason ? `Reason: ${data.reason}` : ''}

We encourage you to reach out to our admissions office if you have any questions or would like to discuss this further.

Best regards,
Sto Niño de Praga Academy

© ${new Date().getFullYear()} Sto Niño de Praga Academy. All rights reserved.
      `;

    await this.sendEmail({
      to: data.email,
      subject:
        'Sto Niño de Praga Academy - Admission Application Update',
      text: text,
      html: html,
    });
  }
}
