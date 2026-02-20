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
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

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
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/services/textbee.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TextBeeService",
    ()=>TextBeeService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-route] (ecmascript)");
;
const baseUrl = 'https://api.textbee.dev/api/v1';
const apiKey = process.env.TEXTBEE_API_KEY;
const deviceId = process.env.TEXTBEE_DEVICE_ID;
class TextBeeService {
    static async sendSms(to, message) {
        let recipient = to;
        if (to.startsWith('0')) {
            recipient = '+63' + to.slice(1);
        }
        try {
            let response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].post(`${baseUrl}/gateway/devices/${deviceId}/send-sms`, {
                recipients: [
                    recipient
                ],
                message: message
            }, {
                headers: {
                    'x-api-key': apiKey
                }
            });
            return response.data.messageId;
        } catch (e) {
            console.error('Error sending SMS via TextBee:', e);
            throw e;
        }
    }
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/admin/attendance-live/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "OPTIONS",
    ()=>OPTIONS,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseAdmin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$textbee$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/textbee.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
;
const timeoutModeExpiry = new Map();
function cleanupExpiredTimeouts() {
    const now = Date.now();
    for (const [timestamp, expiry] of timeoutModeExpiry.entries()){
        if (now > expiry) {
            timeoutModeExpiry.delete(timestamp);
        }
    }
}
function isTimeoutModeActive() {
    cleanupExpiredTimeouts();
    const now = Date.now();
    for (const expiry of timeoutModeExpiry.values()){
        if (now < expiry) {
            return true;
        }
    }
    return false;
}
async function OPTIONS(request) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
async function GET(request) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    try {
        const url = new URL(request.url);
        console.log('=== GET REQUEST DEBUG ===');
        console.log('Request URL:', url.toString());
        console.log('Origin:', request.headers.get('origin') || 'N/A');
        console.log('Host:', request.headers.get('host') || 'N/A');
        console.log('Environment:', ("TURBOPACK compile-time value", "development"));
        console.log('=========================');
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const since = searchParams.get('since');
        let supabaseClient;
        try {
            supabaseClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])();
        } catch (clientError) {
            console.error('Failed to get Supabase admin client:', clientError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                records: [],
                warning: 'Database client initialization failed',
                error: ("TURBOPACK compile-time truthy", 1) ? clientError?.message : "TURBOPACK unreachable"
            }, {
                status: 200,
                headers: defaultHeaders
            });
        }
        if (!supabaseClient) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                records: [],
                warning: 'Database client not available'
            }, {
                status: 200,
                headers: defaultHeaders
            });
        }
        let data = [];
        let error = null;
        try {
            console.log('Attempting to fetch attendance records...');
            console.log('Limit:', limit);
            console.log('Since:', since);
            let querySuccess = false;
            try {
                console.log('Method 1: Trying RPC function...');
                const { data: rpcData, error: rpcError } = await supabaseClient.rpc('get_attendance_records', {
                    record_limit: limit,
                    since_time: since || undefined
                });
                if (!rpcError && rpcData) {
                    data = rpcData;
                    error = null;
                    querySuccess = true;
                    console.log('✓ RPC query successful, records:', (data || []).length);
                } else {
                    console.log('✗ RPC failed:', rpcError?.message || 'RPC function not found');
                }
            } catch (rpcException) {
                console.log('✗ RPC exception:', rpcException.message);
            }
            if (!querySuccess) {
                try {
                    console.log('Method 2: Trying direct query with explicit columns...');
                    let directQuery = supabaseClient.from('attendance_records').select('id, scan_time, scan_type, user_id, rfid_card, rfid_tag, status, time_in, time_out, created_at, device_id').order('scan_time', {
                        ascending: false
                    }).limit(limit);
                    if (since) {
                        directQuery = directQuery.gt('scan_time', since);
                    }
                    const directResult = await directQuery;
                    if (!directResult.error && directResult.data) {
                        data = directResult.data || [];
                        error = null;
                        querySuccess = true;
                        console.log('✓ Direct query (minimal) successful, records:', (data || []).length);
                    } else {
                        if (directResult.error?.code === 'PGRST200' || directResult.error?.message?.includes('relationship') || directResult.error?.message?.includes('Could not find a relationship')) {
                            console.log('⚠ PostgREST relationship error - returning empty records (this is OK)');
                            data = [];
                            error = null;
                            querySuccess = true;
                        } else {
                            throw directResult.error;
                        }
                    }
                } catch (directError) {
                    if (directError.code === 'PGRST200' || directError.message?.includes('relationship') || directError.message?.includes('Could not find a relationship')) {
                        console.log('⚠ PostgREST relationship error in catch - returning empty records');
                        data = [];
                        error = null;
                        querySuccess = true;
                    } else {
                        console.error('✗ Direct query failed:', directError);
                        data = [];
                        error = null;
                        querySuccess = true;
                    }
                }
            }
            if (!querySuccess) {
                console.log('⚠ All query methods failed - returning empty records');
                data = [];
                error = null;
            }
        } catch (queryError) {
            console.error('Query execution exception:', queryError);
            console.error('Exception name:', queryError.name);
            console.error('Exception message:', queryError.message);
            console.error('Exception stack:', queryError.stack);
            error = queryError;
        }
        if (error) {
            console.error('Database error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            console.error('Error hint:', error.hint);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                records: [],
                warning: 'Unable to fetch attendance records from database',
                error: ("TURBOPACK compile-time truthy", 1) ? error.message : "TURBOPACK unreachable",
                details: ("TURBOPACK compile-time truthy", 1) ? {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                } : "TURBOPACK unreachable"
            }, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }
        const studentIds = [
            ...new Set((data || []).map((r)=>r.user_id).filter(Boolean))
        ];
        const studentMap = {};
        const teacherMap = {};
        if (studentIds.length > 0) {
            try {
                const { data: allStudents, error: studentsError } = await supabaseClient.from('users').select('*').eq('role', 'student').limit(1000);
                if (!studentsError && allStudents) {
                    allStudents.forEach((student)=>{
                        const studentNumberStr = (student.student_number || '').toString().trim();
                        const studentIdUuid = (student.id || '').toString().trim();
                        if (studentNumberStr) studentMap[studentNumberStr] = student;
                        if (studentIdUuid) studentMap[studentIdUuid] = student;
                    });
                }
                const { data: allTeachers, error: teachersError } = await supabaseClient.from('users').select('*').eq('role', 'teacher').limit(1000);
                if (!teachersError && allTeachers) {
                    allTeachers.forEach((teacher)=>{
                        const teacherIdUuid = (teacher.id || '').toString().trim();
                        const teacherEmail = (teacher.email || '').toString().trim().toLowerCase();
                        const employeeNum = (teacher.employee_number || '').toString().trim();
                        if (teacherIdUuid) teacherMap[teacherIdUuid] = teacher;
                        if (teacherEmail) teacherMap[teacherEmail] = teacher;
                        if (employeeNum) teacherMap[employeeNum] = teacher;
                    });
                }
            } catch (fetchError) {
                console.error('Error fetching students/teachers:', fetchError);
            }
        }
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.log('📭 No attendance records found in database');
            console.log('💡 This could mean:');
            console.log('   1. No scans have been recorded yet');
            console.log('   2. Database table is empty');
            console.log('   3. ESP32 scans are not being saved (check POST endpoint logs)');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                records: [],
                message: 'No attendance records found. Scans will appear here once recorded.'
            }, {
                status: 200,
                headers: defaultHeaders
            });
        }
        console.log(`✅ Found ${(data || []).length} attendance records`);
        if ((data || []).length > 0) {
            console.log('📅 Sample record times:', data.slice(0, 3).map((r)=>({
                    scan_time: r.scan_time,
                    created_at: r.created_at,
                    id: r.id
                })));
        }
        const formattedRecords = (data || []).map((record)=>{
            let scanType = null;
            if (record.time_in && record.scan_time === record.time_in) {
                scanType = 'timein';
            } else if (record.time_out && record.scan_time === record.time_out) {
                scanType = 'timeout';
            } else if (record.scan_type) {
                scanType = record.scan_type.toLowerCase() === 'time_in' || record.scan_type.toLowerCase() === 'timein' ? 'timein' : record.scan_type.toLowerCase() === 'time_out' || record.scan_type.toLowerCase() === 'timeout' ? 'timeout' : null;
            } else if (record.type) {
                scanType = record.type.toLowerCase() === 'time_in' || record.type.toLowerCase() === 'timein' ? 'timein' : record.type.toLowerCase() === 'time_out' || record.type.toLowerCase() === 'timeout' ? 'timeout' : null;
            }
            const student = studentMap[record.user_id] || null;
            const teacher = teacherMap[record.user_id] || null;
            const isTeacher = !!teacher || student && (student.role === 'teacher' || student.user_type === 'teacher' || !student.student_number);
            const person = teacher || student;
            console.log('📋 Formatting record:', {
                id: record.id,
                user_id: record.user_id,
                rfid_card: record.rfid_card,
                rfid_tag: record.rfid_tag,
                person_found: !!person,
                person_name: person ? `${person.first_name} ${person.last_name}` : 'None'
            });
            return {
                id: record.id,
                studentId: person?.student_number || person?.employee_number || record.user_id,
                studentName: person ? `${person.first_name || ''} ${person.middle_name || ''} ${person.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
                gradeLevel: isTeacher ? null : person?.grade_level || 'N/A',
                section: isTeacher ? null : person?.section || 'N/A',
                scanTime: record.scan_time || record.created_at,
                status: record.status || 'Present',
                rfidCard: record.rfid_card || record.rfid_tag || 'N/A',
                studentPhoto: person?.photo_url || null,
                scanType: scanType,
                timeIn: record.time_in || null,
                timeOut: record.time_out || null,
                isTeacher: isTeacher || false,
                subject: isTeacher ? person?.specialization || person?.department || 'N/A' : null,
                role: person?.role || null
            };
        });
        console.log(`📤 Returning ${(formattedRecords || []).length} formatted records to frontend`);
        if ((formattedRecords || []).length > 0) {
            console.log('📅 First record scan time:', formattedRecords[0]?.scanTime);
            console.log('📅 Last record scan time:', formattedRecords[formattedRecords.length - 1]?.scanTime);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            records: formattedRecords,
            count: formattedRecords.length
        }, {
            status: 200,
            headers: defaultHeaders
        });
    } catch (error) {
        console.error('Attendance records API error:', error);
        console.error('Error stack:', error?.stack);
        console.error('Error name:', error?.name);
        console.error('Error message:', error?.message);
        try {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                records: [],
                warning: 'Unable to fetch attendance records',
                error: error?.message || 'Internal server error',
                details: ("TURBOPACK compile-time truthy", 1) ? {
                    stack: error?.stack,
                    name: error?.name,
                    message: error?.message
                } : "TURBOPACK unreachable"
            }, {
                status: 200,
                headers: defaultHeaders
            });
        } catch (jsonError) {
            console.error('Failed to create JSON response:', jsonError);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](JSON.stringify({
                success: true,
                records: [],
                warning: 'Service temporarily unavailable'
            }), {
                status: 200,
                headers: defaultHeaders
            });
        }
    }
}
async function POST(request) {
    const postHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    try {
        console.log('=== POST: ENVIRONMENT VARIABLES DEBUG ===');
        console.log('URL:', ("TURBOPACK compile-time truthy", 1) ? 'SET' : "TURBOPACK unreachable");
        console.log('URL Value:', ("TURBOPACK compile-time value", "https://ulntyefamkxkbynrugop.supabase.co"));
        console.log('ANON:', ("TURBOPACK compile-time truthy", 1) ? 'SET' : "TURBOPACK unreachable");
        console.log('ANON Key (first 20 chars):', ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbnR5ZWZhbWt4a2J5bnJ1Z29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjgwNDEsImV4cCI6MjA3NjIwNDA0MX0.TnL8jfBVJD8Z0N5rFl_KFhAku8zxiy2fFvztBDYHaWk")?.substring(0, 20) || 'MISSING');
        console.log('SERVICE:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
        console.log('SERVICE Key (first 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'MISSING');
        console.log('==========================================');
        let scanData = null;
        try {
            scanData = await request.json();
        } catch (jsonError) {
            console.error('Error parsing request JSON:', jsonError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid JSON in request body',
                message: 'Please ensure the request contains valid JSON'
            }, {
                status: 200,
                headers: postHeaders
            });
        }
        if (!scanData) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Request body is required',
                message: 'Please include RFID card data in the request'
            }, {
                status: 200,
                headers: postHeaders
            });
        }
        if (!scanData.studentId && !scanData.rfidCard) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Student ID or RFID Card is required',
                records: []
            }, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }
        const supabaseClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])();
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            if ("TURBOPACK compile-time truthy", 1) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    message: 'Scan recorded (dev mode - not saved to database)'
                });
            }
            //TURBOPACK unreachable
            ;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.toISOString();
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        const todayEndISO = todayEnd.toISOString();
        let studentId = scanData.studentId;
        if (!studentId && scanData.rfidCard) {
            let rfidNormalized = scanData.rfidCard.toString().trim().toUpperCase().replace(/\s+/g, '');
            const rfidNoLeadingZeros = rfidNormalized.replace(/^0+/, '');
            console.log(`Searching for student with RFID: ${rfidNormalized} (also trying: ${rfidNoLeadingZeros})`);
            const { data: allStudents, error: fetchError } = await supabaseClient.from('users').select('*').eq('role', 'student').limit(1000);
            if (fetchError) {
                console.error('Error fetching students:', fetchError);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: `Database error: ${fetchError.message}`,
                    searchedRfid: rfidNormalized,
                    records: []
                }, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                });
            }
            console.log(`Checking teachers first for RFID: ${rfidNormalized}`);
            const { data: allTeachers, error: teachersError } = await supabaseClient.from('users').select('*').eq('role', 'teacher').limit(1000);
            let matchedTeacher = null;
            if (!teachersError && allTeachers) {
                const teachers = (allTeachers || []).filter((teacher)=>{
                    const rfid = (teacher.rfid || '').toString().trim().toUpperCase();
                    return rfid === rfidNormalized || rfid === rfidNoLeadingZeros || rfid.includes(rfidNormalized);
                });
                if (teachers && teachers.length > 0) {
                    matchedTeacher = teachers[0];
                    console.log(`✅ Found teacher FIRST: ${matchedTeacher.first_name || 'Unknown'} ${matchedTeacher.last_name || ''}`);
                    studentId = matchedTeacher.id?.toString();
                    if (!studentId) {
                        console.error('❌ Teacher found but has no UUID:', matchedTeacher);
                        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                            success: false,
                            error: 'Teacher record is invalid (missing UUID). Please contact administrator.'
                        }, {
                            status: 200,
                            headers: postHeaders
                        });
                    }
                }
            }
            if (!matchedTeacher) {
                console.log(`No teacher found, checking students for RFID: ${rfidNormalized}`);
                const students = (allStudents || []).filter((student)=>{
                    const rfid = (student.rfid || '').toString().trim().toUpperCase();
                    return rfid === rfidNormalized || rfid === rfidNoLeadingZeros || rfid.includes(rfidNormalized);
                });
                if (!students || students.length === 0) {
                    console.log(`❌ No student or teacher found with RFID: ${rfidNormalized}`);
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: false,
                        error: `No student or teacher found for RFID: ${rfidNormalized}. Please assign this RFID card in the admin panel.`,
                        searchedRfid: rfidNormalized,
                        message: `RFID ${rfidNormalized} not assigned to any student or teacher`
                    }, {
                        status: 404,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type'
                        }
                    });
                } else {
                    const matchedStudent = students[0];
                    console.log(`Found student: ${matchedStudent.first_name || 'Unknown'} ${matchedStudent.last_name || ''}`);
                    studentId = matchedStudent.id?.toString();
                    if (!studentId) {
                        console.error('❌ Student found but has no UUID:', matchedStudent);
                        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                            success: false,
                            error: 'Student record is invalid (missing UUID). Please contact administrator.'
                        }, {
                            status: 200,
                            headers: postHeaders
                        });
                    }
                }
            }
        }
        let todayRecords = [];
        let checkError = null;
        const { data: allTodayRecords, error: fetchError } = await supabaseClient.from('attendance_records').select('id, scan_type, scan_time, time_in, time_out, user_id').gte('scan_time', todayStart).lte('scan_time', todayEndISO).order('scan_time', {
            ascending: true
        });
        if (fetchError) {
            checkError = fetchError;
            console.error('Error fetching today records:', fetchError);
        } else if (allTodayRecords) {
            todayRecords = allTodayRecords.filter((r)=>{
                const rId = (r.user_id || '').toString().trim();
                const sId = (studentId || '').toString().trim();
                return rId === sId || rId === studentId || sId === r.user_id;
            });
        }
        if (checkError) {
            console.error('Error checking existing records:', checkError);
        }
        const hasTimeIn = todayRecords.some((r)=>r.scan_type === 'timein' || r.scan_type === 'time_in' || r.time_in);
        const hasTimeOut = todayRecords.some((r)=>r.scan_type === 'timeout' || r.scan_type === 'time_out' || r.time_out);
        if (hasTimeIn && hasTimeOut) {
            console.log('⚠️ Student has already timed in and out today');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'You have completed your attendance for today.',
                error: 'Already completed attendance for today',
                hasTimeIn: true,
                hasTimeOut: true
            }, {
                status: 200,
                headers: postHeaders
            });
        }
        const currentTime = new Date().toISOString();
        let scanType = 'timein';
        let timeIn = null;
        let timeOut = null;
        const timeoutModeActive = isTimeoutModeActive();
        if (hasTimeIn && !hasTimeOut) {
            scanType = 'timeout';
            timeOut = currentTime;
            const timeInRecord = todayRecords.filter((r)=>r.scan_type === 'timein' || r.scan_type === 'time_in').sort((a, b)=>new Date(b.scan_time).getTime() - new Date(a.scan_time).getTime())[0];
            if (timeInRecord) {
                timeIn = timeInRecord.time_in || timeInRecord.scan_time;
            }
            console.log('⏰ Student already timed in today - forcing timeout');
        } else if (timeoutModeActive && !hasTimeIn) {
            scanType = 'timein';
            timeIn = currentTime;
            console.log('⚠️ Timeout mode active but no time in yet - recording as time in');
        } else if (timeoutModeActive && hasTimeIn) {
            scanType = 'timeout';
            timeOut = currentTime;
            const timeInRecord = todayRecords.filter((r)=>r.scan_type === 'timein' || r.scan_type === 'time_in').sort((a, b)=>new Date(b.scan_time).getTime() - new Date(a.scan_time).getTime())[0];
            if (timeInRecord) {
                timeIn = timeInRecord.time_in || timeInRecord.scan_time;
            }
            console.log('⏰ Timeout mode active with existing time in - recording as timeout');
        } else {
            scanType = 'timein';
            timeIn = currentTime;
            console.log('✅ Recording as time in (default)');
        }
        const attendanceRecord = {
            user_id: studentId
        };
        const rfidValue = scanData.rfidCard || '';
        if (rfidValue) {
            attendanceRecord.rfid_card = rfidValue;
            attendanceRecord.rfid_tag = rfidValue;
        } else {
            attendanceRecord.rfid_card = '';
            attendanceRecord.rfid_tag = '';
        }
        attendanceRecord.scan_time = currentTime;
        attendanceRecord.scan_type = scanType;
        attendanceRecord.time_in = timeIn;
        attendanceRecord.time_out = timeOut;
        attendanceRecord.status = scanType === 'timein' ? 'Present' : 'Present';
        attendanceRecord.created_at = currentTime;
        attendanceRecord.type = scanType;
        console.log('💾 Inserting attendance record:', {
            user_id: attendanceRecord.user_id,
            rfid_card: attendanceRecord.rfid_card,
            scan_type: attendanceRecord.scan_type,
            scan_time: attendanceRecord.scan_time
        });
        const { data: newRecord, error: insertError } = await supabaseClient.from('attendance_records').insert([
            attendanceRecord
        ]).select('*, user_id(*)').single();
        if (insertError) {
            console.error('❌ Insert failed:', insertError);
            console.error('Database error:', insertError);
            if ("TURBOPACK compile-time truthy", 1) {
                console.log('Scan data (dev mode):', {
                    studentId,
                    scanType,
                    timeIn,
                    timeOut
                });
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    message: 'Scan recorded (dev mode - not saved to database)',
                    scanType,
                    timeIn,
                    timeOut
                }, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                });
            }
            //TURBOPACK unreachable
            ;
        }
        let personInfo = null;
        let isTeacher = false;
        if (studentId) {
            const { data: allStudents } = await supabaseClient.from('users').select('*').eq('role', 'student').limit(1000);
            if (allStudents) {
                const studentIdStr = (studentId || '').toString().trim();
                personInfo = allStudents.find((student)=>{
                    const sNum = (student.student_number || '').toString().trim();
                    const sUuid = (student.id || '').toString().trim();
                    return sNum === studentIdStr || sUuid === studentIdStr;
                }) || null;
            }
            if (!personInfo) {
                const { data: allTeachers } = await supabaseClient.from('users').select('*').eq('role', 'teacher').limit(1000);
                if (allTeachers) {
                    const personIdStr = (studentId || '').toString().trim();
                    personInfo = allTeachers.find((teacher)=>{
                        const tNum = (teacher.employee_number || '').toString().trim();
                        const tUuid = (teacher.id || '').toString().trim();
                        const tEmail = (teacher.email || '').toString().trim().toLowerCase();
                        return tNum === personIdStr || tUuid === personIdStr || tEmail === personIdStr;
                    }) || null;
                    if (personInfo) {
                        isTeacher = true;
                    }
                }
            }
        }
        const formattedRecord = {
            id: newRecord.id,
            studentId: personInfo?.student_number || personInfo?.employee_number || studentId,
            studentName: personInfo ? `${personInfo.first_name || personInfo.firstName || ''} ${personInfo.last_name || personInfo.lastName || ''}`.trim() || personInfo.name || 'Unknown' : 'Unknown',
            gradeLevel: isTeacher ? null : personInfo?.grade_level || personInfo?.gradeLevel || 'N/A',
            section: isTeacher ? null : personInfo?.section || 'N/A',
            scanTime: newRecord.scan_time || newRecord.created_at,
            status: newRecord.status || 'Present',
            rfidCard: newRecord.rfid_card || scanData.rfidCard || 'N/A',
            studentPhoto: personInfo?.photo_url || personInfo?.profile_picture || personInfo?.picture || null,
            scanType: scanType,
            timeIn: newRecord.time_in || null,
            timeOut: newRecord.time_out || null,
            isTeacher: isTeacher,
            subject: isTeacher ? personInfo?.subject || personInfo?.subjects || personInfo?.subject_taught || 'N/A' : null,
            role: personInfo?.role || null
        };
        console.log('✅ Scan saved successfully!', {
            id: newRecord.id,
            student: formattedRecord.studentName,
            scanType: scanType,
            scanTime: formattedRecord.scanTime
        });
        console.log('🔍 CHECKING SMS CONDITIONS:');
        console.log('🔍 isTeacher:', isTeacher);
        console.log('🔍 scanType:', scanType);
        console.log('🔍 Will enter SMS block:', !isTeacher);
        try {
            if (!isTeacher) {
                console.log('🔔 SMS CHECK: Student scan detected (time-in or time-out)');
                console.log('🔔 isTeacher:', isTeacher);
                console.log('🔔 scanType:', scanType);
                let parentPhone = null;
                console.log('🔍 Student info for parent lookup:', {
                    parent_id: personInfo?.parent_id,
                    parentId: personInfo?.parentId,
                    parent_email: personInfo?.parent_email,
                    parentEmail: personInfo?.parentEmail,
                    student_id: personInfo?.student_id,
                    student_number: personInfo?.student_number,
                    id: personInfo?.id
                });
                try {
                    const parentRecords = [];
                    const parentId = personInfo?.parent_id || personInfo?.parentId || null;
                    if (parentId) {
                        const { data: parentRecord, error: pErr } = await supabaseClient.from('users').select('id, phone, mobile, phone_number, email').eq('id', parentId).eq('role', 'parent').limit(1).single();
                        if (!pErr && parentRecord) parentRecords.push(parentRecord);
                    }
                    const parentEmail = personInfo?.parent_email || personInfo?.parentEmail || null;
                    if (!parentRecords.length && parentEmail) {
                        const { data: parentRecord2, error: pErr2 } = await supabaseClient.from('users').select('id, phone, mobile, phone_number, email').ilike('email', parentEmail).limit(1).single();
                        if (!pErr2 && parentRecord2) parentRecords.push(parentRecord2);
                    }
                    if (!parentRecords.length && (personInfo?.student_id || personInfo?.student_number || personInfo?.id)) {
                        const sId = personInfo?.student_id || personInfo?.student_number || personInfo?.id;
                        try {
                            const { data: linkedParentIds } = await supabaseClient.from('user_relationships').select('parent_id').eq('student_id', sId).limit(10);
                            if (linkedParentIds && linkedParentIds.length > 0) {
                                const parentIds = linkedParentIds.map((r)=>r.parent_id).filter(Boolean);
                                if (parentIds.length > 0) {
                                    const { data: parentsFromLink } = await supabaseClient.from('users').select('id, phone, mobile, phone_number, email').eq('role', 'parent').in('id', parentIds);
                                    if (parentsFromLink) parentRecords.push(...parentsFromLink);
                                }
                            }
                        } catch (linkError) {}
                    }
                    if (parentRecords && parentRecords.length > 0) {
                        const p = parentRecords[0];
                        parentPhone = p?.phone || p?.mobile || p?.phone_number || null;
                        console.log('✅ Found parent from database:', {
                            id: p?.id,
                            phone: p?.phone,
                            mobile: p?.mobile,
                            phone_number: p?.phone_number,
                            finalPhone: parentPhone
                        });
                    } else {
                        console.log('⚠️ No parent records found from database queries');
                    }
                } catch (parentQueryError) {
                    console.warn('Unable to query parents table for phone number:', parentQueryError);
                }
                console.log('🔍 Checking direct student fields for parent phone...');
                if (!parentPhone && personInfo) {
                    const possibleParentFields = [
                        'parent_phone',
                        'parentPhone',
                        'parent_contact',
                        'parentContact',
                        'parent_mobile',
                        'parentMobile',
                        'phone_number',
                        'phone',
                        'emergency_contact',
                        'emergencyContact'
                    ];
                    console.log('📋 Available fields in personInfo:', Object.keys(personInfo));
                    for (const f of possibleParentFields){
                        const val = personInfo[f];
                        if (val) {
                            parentPhone = val;
                            console.log(`✅ Found parent phone in field "${f}":`, val);
                            break;
                        }
                    }
                    if (!parentPhone) {
                        console.log('❌ No parent phone found in any student field');
                        console.log('📄 Full personInfo:', JSON.stringify(personInfo, null, 2));
                    }
                }
                if (parentPhone) {
                    console.log('📞 Parent phone found (raw):', parentPhone);
                    // Convert 09XX to +639XX format
                    let formattedPhone = parentPhone.toString().trim();
                    if (formattedPhone.startsWith('0')) {
                        formattedPhone = '+63' + formattedPhone.slice(1);
                        console.log('📞 Converted phone format:', formattedPhone);
                    }
                    const smsEnabled = (process.env.SMS_ON_SCAN_ENABLED || 'false').toLowerCase();
                    console.log('📧 SMS_ON_SCAN_ENABLED:', smsEnabled);
                    console.log('📧 TEXTBEE_API_KEY:', process.env.TEXTBEE_API_KEY ? 'SET' : 'MISSING');
                    console.log('📧 TEXTBEE_DEVICE_ID:', process.env.TEXTBEE_DEVICE_ID ? 'SET' : 'MISSING');
                    if (smsEnabled !== 'true' && smsEnabled !== '1') {
                        console.log('❌ SMS notifications are disabled (SMS_ON_SCAN_ENABLED is not set to true)');
                    } else {
                        console.log('✅ SMS is ENABLED, preparing to send...');
                        // Hardcoded test number
                        const toPhone = formattedPhone;
                        console.log('📱 Sending SMS to:', toPhone);
                        // Format date as "January 30, 2026, 10:00 AM" in Philippine time
                        const scanDate = new Date(formattedRecord.scanTime || new Date());
                        const formattedDate = scanDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'Asia/Manila'
                        });
                        const formattedTime = scanDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Asia/Manila'
                        });
                        const readableDateTime = `${formattedDate}, ${formattedTime}`;
                        const smsTemplate = process.env.SMS_ON_SCAN_TEMPLATE || 'Dear parent, {studentName} ({gradeLevel} - {section}) {scanType} at {scanTime}. — Sto Niño Portal';
                        const message = smsTemplate.replace('{studentName}', formattedRecord.studentName).replace('{gradeLevel}', formattedRecord.gradeLevel || 'N/A').replace('{section}', formattedRecord.section || 'N/A').replace('{scanType}', scanType === 'timein' ? 'timed in' : 'timed out').replace('{scanTime}', readableDateTime);
                        console.log('💬 Message to send:', message);
                        try {
                            console.log('📤 Calling TextBeeService.sendSms...');
                            const messageId = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$textbee$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TextBeeService"].sendSms(toPhone, message);
                            console.log('✅ SMS sent successfully via TextBee. Message ID:', messageId);
                        } catch (smsError) {
                            console.error('❌ Failed to send SMS via TextBee:', smsError);
                            console.error('❌ Error details:', smsError.response?.data || smsError.message);
                        }
                    }
                } else {
                    console.log('❌ No parent phone found for student, skipping SMS');
                    console.log('👤 Person info:', personInfo);
                }
            }
        } catch (smsError) {
            console.error('SMS notification error:', smsError);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            record: formattedRecord,
            message: `Time ${scanType === 'timein' ? 'In' : 'Out'} recorded successfully`
        }, {
            status: 200,
            headers: postHeaders
        });
    } catch (error) {
        console.error('CRITICAL: Unhandled error in POST handler:', error);
        console.error('Error stack:', error?.stack);
        console.error('Error name:', error?.name);
        console.error('Error message:', error?.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: ("TURBOPACK compile-time truthy", 1) ? error?.message : "TURBOPACK unreachable",
            records: [],
            warning: 'Service error occurred'
        }, {
            status: 200,
            headers: postHeaders
        });
    }
}
async function PUT(request) {
    const putHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    try {
        const body = await request.json();
        const { action } = body;
        if (action === 'enable-timeout') {
            const now = Date.now();
            const expiry = now + 5000;
            const timestamp = now;
            timeoutModeExpiry.set(timestamp, expiry);
            console.log('⏰ Timeout mode enabled for 5 seconds');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: 'Timeout mode enabled for 5 seconds',
                expiresAt: expiry
            }, {
                status: 200,
                headers: putHeaders
            });
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid action'
            }, {
                status: 400,
                headers: putHeaders
            });
        }
    } catch (error) {
        console.error('Error in PUT handler:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error?.message || 'Internal server error'
        }, {
            status: 200,
            headers: putHeaders
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__59817009._.js.map