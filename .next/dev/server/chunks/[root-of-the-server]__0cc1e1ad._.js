module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/lib/services/email-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmailService",
    ()=>EmailService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nodemailer/lib/nodemailer.js [app-route] (ecmascript)");
;
// Create a fresh transporter for every send to avoid stale connection issues.
// A module-level singleton transporter can have its SMTP connection silently
// expire, which causes random/intermittent send failures.
function createTransporter() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        // No connection pooling — always open a fresh connection
        pool: false
    });
}
class EmailService {
    static async sendEmail(options) {
        const MAX_RETRIES = 3;
        let lastError;
        for(let attempt = 1; attempt <= MAX_RETRIES; attempt++){
            const transporter = createTransporter();
            try {
                const response = await transporter.sendMail({
                    from: process.env.SMTP_EMAIL,
                    to: options.to,
                    subject: options.subject,
                    text: options.text,
                    html: options.html
                });
                console.log(`Email sent (attempt ${attempt}): ${response.messageId}`);
                return; // success — stop retrying
            } catch (error) {
                lastError = error;
                console.error(`Email attempt ${attempt}/${MAX_RETRIES} failed:`, error);
                if (attempt < MAX_RETRIES) {
                    // Wait 1s before retrying to let transient SMTP issues clear
                    await new Promise((r)=>setTimeout(r, 1000 * attempt));
                }
            } finally{
                // Always close the connection to avoid resource leaks
                transporter.close();
            }
        }
        throw lastError;
    }
    static async sendLoginCredentials(credentials) {
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
            html: html
        });
    }
    static async sendAdmissionApproval(data) {
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
            html: html
        });
    }
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/admin/test-email/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$email$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/email-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;
        if (!email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Email address is required'
            }, {
                status: 400
            });
        }
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'SMTP_EMAIL or SMTP_PASS is not configured. Please check your environment variables.'
            }, {
                status: 500
            });
        }
        const now = new Date().toLocaleString('en-PH', {
            timeZone: 'Asia/Manila'
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$email$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EmailService"].sendEmail({
            to: email,
            subject: '[Sto Niño Portal] Test Email',
            text: `This is a test email sent from the Sto Niño admin settings page at ${now}.\n\nIf you received this, your email (SMTP) configuration is working correctly.\n\n— Sto Niño de Praga Academy`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .container { background: #f9f9f9; border-radius: 10px; padding: 30px; border: 1px solid #ddd; }
              .header { text-align: center; margin-bottom: 24px; }
              .header h1 { color: #7A0C0C; margin: 0; font-size: 22px; }
              .badge { display: inline-block; background: #d4edda; color: #155724; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: bold; }
              .footer { margin-top: 24px; text-align: center; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Sto Niño Portal — Test Email</h1>
                <br/>
                <span class="badge">✅ SMTP Working</span>
              </div>
              <p>This is a test email sent from the admin settings page at <strong>${now}</strong>.</p>
              <p>If you received this, your email configuration is working correctly.</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Sto Niño de Praga Academy. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Test email sent successfully',
            sentTo: email
        });
    } catch (error) {
        console.error('Test email error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error?.message || 'Failed to send test email'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0cc1e1ad._.js.map