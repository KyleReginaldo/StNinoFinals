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
const transporter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});
class EmailService {
    static async sendEmail(options) {
        try {
            let response = await transporter.sendMail({
                from: process.env.SMTP_EMAIL,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html
            });
            console.log(`Email sent: ${response.messageId}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
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
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[project]/lib/supabaseAdmin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseAdmin",
    ()=>getSupabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
/**
 * Supabase Admin Client for Server-Side Operations
 * 
 * ⚠️ SECURITY WARNING: This client uses the SERVICE ROLE KEY
 * - Bypasses ALL Row Level Security (RLS) policies
 * - Full database access with no restrictions
 * - ONLY use in server-side code (API routes, Server Components)
 * - NEVER import or use in client-side components
 * 
 * Use Cases:
 * - Admin operations requiring elevated privileges
 * - System-level database operations
 * - Background jobs and cron tasks
 */ const supabaseUrl = ("TURBOPACK compile-time value", "https://ulntyefamkxkbynrugop.supabase.co");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
function getSupabaseAdmin() {
    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase admin env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only).');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
}),
"[project]/lib/supabaseClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/supabaseClient.ts
__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
/**
 * Supabase Client for Client-Side Operations
 * 
 * This client uses the ANON key and is safe to use in browser code.
 * It respects Row Level Security (RLS) policies in Supabase.
 * 
 * DO NOT use service role key here - it bypasses RLS and is a security risk.
 * For admin operations, use getSupabaseAdmin() in server-side code only.
 */ // Get environment variables
const supabaseUrl = ("TURBOPACK compile-time value", "https://ulntyefamkxkbynrugop.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbnR5ZWZhbWt4a2J5bnJ1Z29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjgwNDEsImV4cCI6MjA3NjIwNDA0MX0.TnL8jfBVJD8Z0N5rFl_KFhAku8zxiy2fFvztBDYHaWk");
// Validate that environment variables are set
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/admissions/approve/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$email$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/email-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseAdmin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
;
;
async function POST(request) {
    try {
        const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])();
        const body = await request.json();
        const { admissionId, action } = body; // action: 'approve' or 'reject'
        if (!admissionId || !action) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Missing admissionId or action'
            }, {
                status: 400
            });
        }
        if (action !== 'approve' && action !== 'reject') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Action must be "approve" or "reject"'
            }, {
                status: 400
            });
        }
        // Fetch the admission record
        const { data: admission, error: fetchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('admissions').select('*').eq('id', admissionId).single();
        if (fetchError || !admission) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Admission not found'
            }, {
                status: 404
            });
        }
        if (action === 'reject') {
            // Simply update status to rejected
            const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('admissions').update({
                status: 'rejected'
            }).eq('id', admissionId);
            if (updateError) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: updateError.message
                }, {
                    status: 500
                });
            }
            // TODO: Send rejection email
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: 'Admission rejected successfully'
            });
        }
        // APPROVAL PROCESS
        if (action === 'approve') {
            // Generate a temporary password
            const tempPassword = `SN${Math.random().toString(36).slice(-8)}${Date.now().toString(36)}`;
            // Create user in Supabase Auth
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: admission.email_address,
                password: tempPassword,
                email_confirm: true,
                user_metadata: {
                    first_name: admission.first_name,
                    last_name: admission.last_name,
                    role: 'student'
                }
            });
            if (authError) {
                console.error('Auth creation error:', authError);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: `Failed to create auth user: ${authError.message}`
                }, {
                    status: 500
                });
            }
            if (!authData.user) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: 'Failed to create auth user'
                }, {
                    status: 500
                });
            }
            // Create user record in users table
            const { error: userError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('users').insert({
                id: authData.user.id,
                email: admission.email_address,
                first_name: admission.first_name,
                last_name: admission.last_name,
                role: 'student',
                grade_level: admission.intended_grade_level,
                created_at: new Date().toISOString()
            });
            if (userError) {
                console.error('User creation error:', userError);
                // Rollback: Delete auth user if user record creation fails
                await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: `Failed to create user record: ${userError.message}`
                }, {
                    status: 500
                });
            }
            // Update admission status to approved
            const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('admissions').update({
                status: 'approved'
            }).eq('id', admissionId);
            if (updateError) {
                console.error('Status update error:', updateError);
            }
            // Send approval email with credentials
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$email$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EmailService"].sendAdmissionApproval({
                    parentName: admission.parent_name,
                    studentFirstName: admission.first_name,
                    studentLastName: admission.last_name,
                    email: admission.email_address,
                    password: tempPassword,
                    gradeLevel: admission.intended_grade_level,
                    loginUrl: `${request.headers.get('origin')}/student`
                });
            } catch (emailError) {
                console.error('Email error:', emailError);
            // Don't fail the whole process if email fails
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: 'Admission approved and student account created successfully',
                data: {
                    userId: authData.user.id,
                    email: admission.email_address
                }
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Invalid action'
        }, {
            status: 400
        });
    } catch (error) {
        console.error('Approval/Rejection error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error?.message || 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1f94fe53._.js.map