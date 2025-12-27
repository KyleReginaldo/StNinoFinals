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
"[project]/lib/supabaseClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/supabaseClient.ts
__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$78$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.78.0/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
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
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$78$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/student/dashboard/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/server.js [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { studentId, email } = body;
        if (!studentId && !email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Student ID or email is required'
            }, {
                status: 400
            });
        }
        // Get student data
        const { data: student, error: studentError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*').eq('id', studentId || '').eq('email', email || '').single();
        if (studentError || !student) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Student not found'
            }, {
                status: 404
            });
        }
        // Get attendance records for this student
        const { data: attendanceRecords, error: attendanceError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('attendance_records').select('*').eq('user_id', student.id);
        // Calculate attendance rate
        let attendanceRate = null;
        if (attendanceRecords && attendanceRecords.length > 0) {
            const presentCount = attendanceRecords.filter((record)=>record.status === 'present' || record.status === 'Present').length;
            attendanceRate = presentCount / attendanceRecords.length * 100;
        }
        // Get grades for this student
        const { data: grades, error: gradesError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('grades').select('*').eq('student_id', student.id);
        // Calculate GPA from grades
        let gpa = null;
        if (grades && grades.length > 0) {
            const totalGrade = grades.reduce((sum, grade)=>{
                const numericGrade = parseFloat(grade.grade);
                return sum + (isNaN(numericGrade) ? 0 : numericGrade);
            }, 0);
            gpa = totalGrade / grades.length;
        }
        // Dummy grades data for testing (fallback if no real data)
        const dummyGrades = [
            {
                id: '1',
                subject: 'Contemporary Philippine Arts from the Regions',
                grade: '94',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '2',
                subject: 'Media and Information Literacy',
                grade: '94',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '3',
                subject: 'Physical Education and Health',
                grade: '97',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '4',
                subject: 'Filipino sa Piling Larang',
                grade: '95',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '5',
                subject: 'Entrepreneurship',
                grade: '95',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '6',
                subject: 'Inquiries, Investigations and Immersion',
                grade: '90',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '7',
                subject: 'General Physics 2',
                grade: '96',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '8',
                subject: 'General Chemistry 2',
                grade: '96',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '9',
                subject: 'Work Immersion',
                grade: '97',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '10',
                subject: 'Practical Research 2',
                grade: '90',
                lastUpdated: new Date().toISOString()
            }
        ];
        // Count active courses (subjects with grades)
        const activeCourses = grades?.length || 0;
        // Dummy dashboard data
        const dashboardData = {
            stats: {
                gpa: gpa || 94.0,
                attendanceRate: attendanceRate !== null ? attendanceRate : 95.5,
                activeCourses: activeCourses || 10,
                pendingTasks: 2
            },
            assignments: [
                {
                    id: '1',
                    title: 'Research Paper',
                    subject: 'Practical Research 2',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'pending'
                },
                {
                    id: '2',
                    title: 'Business Plan',
                    subject: 'Entrepreneurship',
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'pending'
                }
            ],
            courseProgress: [
                {
                    id: '1',
                    subject: 'Contemporary Philippine Arts from the Regions',
                    completion: 85,
                    instructor: 'Prof. Santos'
                },
                {
                    id: '2',
                    subject: 'Media and Information Literacy',
                    completion: 90,
                    instructor: 'Prof. Garcia'
                },
                {
                    id: '3',
                    subject: 'Physical Education and Health',
                    completion: 95,
                    instructor: 'Coach Rodriguez'
                }
            ],
            schedule: {
                today: [
                    {
                        id: '1',
                        subject: 'Mathematics',
                        time: '8:00 AM',
                        location: 'Room 201',
                        instructor: 'Prof. Rodriguez',
                        accent: 'blue'
                    },
                    {
                        id: '2',
                        subject: 'Science',
                        time: '10:00 AM',
                        location: 'Lab 101',
                        instructor: 'Prof. Santos',
                        accent: 'green'
                    }
                ],
                events: [
                    {
                        id: '1',
                        title: 'Midterm Exams',
                        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        description: 'Midterm examination week',
                        accent: 'red'
                    }
                ]
            },
            grades: grades && grades.length > 0 ? grades.map((g)=>({
                    id: g.id,
                    subject: g.subject,
                    grade: g.grade,
                    lastUpdated: g.updated_at || new Date().toISOString()
                })) : dummyGrades,
            enrollment: {
                status: 'enrolled',
                academicYear: '2024-2025',
                semester: 'SECOND SEMESTER',
                gradeLevel: '12',
                strand: 'STEM'
            },
            subjects: [
                {
                    id: '1',
                    subject: 'Contemporary Philippine Arts from the Regions',
                    teacher: 'Prof. Maria Santos'
                },
                {
                    id: '2',
                    subject: 'Media and Information Literacy',
                    teacher: 'Prof. Juan Garcia'
                },
                {
                    id: '3',
                    subject: 'Physical Education and Health',
                    teacher: 'Coach Rodriguez'
                },
                {
                    id: '4',
                    subject: 'Filipino sa Piling Larang',
                    teacher: 'Prof. Ana Cruz'
                },
                {
                    id: '5',
                    subject: 'Entrepreneurship',
                    teacher: 'Prof. Carlos Reyes'
                },
                {
                    id: '6',
                    subject: 'Inquiries, Investigations and Immersion',
                    teacher: 'Prof. Lisa Torres'
                },
                {
                    id: '7',
                    subject: 'General Physics 2',
                    teacher: 'Prof. Robert Martinez'
                },
                {
                    id: '8',
                    subject: 'General Chemistry 2',
                    teacher: 'Prof. Patricia Lopez'
                },
                {
                    id: '9',
                    subject: 'Work Immersion',
                    teacher: 'Prof. Michael Brown'
                },
                {
                    id: '10',
                    subject: 'Practical Research 2',
                    teacher: 'Prof. Jennifer White'
                }
            ]
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Student dashboard API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error?.message || 'Internal server error',
            data: {
                stats: {
                    gpa: null,
                    attendanceRate: null,
                    activeCourses: null,
                    pendingTasks: null
                },
                assignments: [],
                courseProgress: [],
                schedule: {
                    today: [],
                    events: []
                },
                grades: [],
                enrollment: {
                    status: 'unknown',
                    academicYear: '2024-2025',
                    semester: 'SECOND SEMESTER',
                    gradeLevel: null,
                    strand: null
                },
                subjects: []
            }
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2d444f6a._.js.map