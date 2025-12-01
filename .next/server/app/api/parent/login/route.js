/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/parent/login/route";
exports.ids = ["app/api/parent/login/route"];
exports.modules = {

/***/ "(rsc)/./app/api/parent/login/route.ts":
/*!***************************************!*\
  !*** ./app/api/parent/login/route.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/supabaseAdmin */ \"(rsc)/./lib/supabaseAdmin.ts\");\n\n\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const { email, password } = body;\n        // Validate input\n        if (!email || !password) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: 'Email and password are required'\n            }, {\n                status: 400\n            });\n        }\n        const admin = (0,_lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__.getSupabaseAdmin)();\n        const emailLower = email.toLowerCase().trim();\n        // First, try to find parent/guardian in a parents/guardians table\n        // If that doesn't exist, we'll check students table for parent_email field\n        let parent = null;\n        let children = [];\n        // Try to find in parents table (if it exists)\n        const { data: parents, error: parentsError } = await admin.from('parents').select('*').limit(10);\n        if (!parentsError && parents) {\n            parent = parents.find((p)=>p.email && p.email.toLowerCase().trim() === emailLower);\n        }\n        // If not found in parents table, check students table for parent_email\n        if (!parent) {\n            const { data: students, error: studentsError } = await admin.from('students').select('*').limit(100);\n            if (!studentsError && students) {\n                // Find student with matching parent_email\n                const studentWithParent = students.find((s)=>s.parent_email && s.parent_email.toLowerCase().trim() === emailLower);\n                if (studentWithParent) {\n                    // Create a parent object from student's parent info\n                    parent = {\n                        id: `parent_${studentWithParent.id}`,\n                        email: studentWithParent.parent_email,\n                        name: studentWithParent.parent_name || 'Parent/Guardian',\n                        password: studentWithParent.parent_password || null,\n                        Password: studentWithParent.parent_password || null\n                    };\n                    // Find all children with this parent_email\n                    children = students.filter((s)=>s.parent_email && s.parent_email.toLowerCase().trim() === emailLower);\n                }\n            }\n        } else {\n            // If parent found in parents table, get their children\n            const { data: students, error: studentsError } = await admin.from('students').select('*').limit(100);\n            if (!studentsError && students) {\n                // Find children by parent_id or parent_email\n                children = students.filter((s)=>s.parent_id && s.parent_id === parent.id || s.parent_email && s.parent_email.toLowerCase().trim() === emailLower);\n            }\n        }\n        if (!parent) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: 'Invalid email or password'\n            }, {\n                status: 401\n            });\n        }\n        // Check password\n        const parentPassword = parent.Password !== undefined ? parent.Password : parent.password !== undefined ? parent.password : null;\n        if (!parentPassword || parentPassword !== password) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: 'Invalid email or password'\n            }, {\n                status: 401\n            });\n        }\n        // Return parent data with children (excluding passwords)\n        const parentWithoutPassword = {\n            ...parent\n        };\n        if (parentWithoutPassword.Password !== undefined) delete parentWithoutPassword.Password;\n        if (parentWithoutPassword.password !== undefined) delete parentWithoutPassword.password;\n        // Clean children data (remove passwords)\n        const cleanChildren = children.map((child)=>{\n            const cleanChild = {\n                ...child\n            };\n            if (cleanChild.Password !== undefined) delete cleanChild.Password;\n            if (cleanChild.password !== undefined) delete cleanChild.password;\n            return cleanChild;\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            parent: parentWithoutPassword,\n            children: cleanChildren,\n            userType: 'parent'\n        });\n    } catch (error) {\n        console.error('Parent login error:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: error?.message || 'Unknown error'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMzRDtZQUFFcEMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIkQ6XFxjYXBzdG9uZVxcU3ROaW5vRmluYWxzXFxhcHBcXGFwaVxccGFyZW50XFxsb2dpblxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXHJcbmltcG9ydCB7IGdldFN1cGFiYXNlQWRtaW4gfSBmcm9tICdAL2xpYi9zdXBhYmFzZUFkbWluJ1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKClcclxuICAgIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSBib2R5XHJcblxyXG4gICAgLy8gVmFsaWRhdGUgaW5wdXRcclxuICAgIGlmICghZW1haWwgfHwgIXBhc3N3b3JkKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VtYWlsIGFuZCBwYXNzd29yZCBhcmUgcmVxdWlyZWQnIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhZG1pbiA9IGdldFN1cGFiYXNlQWRtaW4oKVxyXG4gICAgY29uc3QgZW1haWxMb3dlciA9IGVtYWlsLnRvTG93ZXJDYXNlKCkudHJpbSgpXHJcblxyXG4gICAgLy8gRmlyc3QsIHRyeSB0byBmaW5kIHBhcmVudC9ndWFyZGlhbiBpbiBhIHBhcmVudHMvZ3VhcmRpYW5zIHRhYmxlXHJcbiAgICAvLyBJZiB0aGF0IGRvZXNuJ3QgZXhpc3QsIHdlJ2xsIGNoZWNrIHN0dWRlbnRzIHRhYmxlIGZvciBwYXJlbnRfZW1haWwgZmllbGRcclxuICAgIGxldCBwYXJlbnQgPSBudWxsXHJcbiAgICBsZXQgY2hpbGRyZW46IGFueVtdID0gW11cclxuXHJcbiAgICAvLyBUcnkgdG8gZmluZCBpbiBwYXJlbnRzIHRhYmxlIChpZiBpdCBleGlzdHMpXHJcbiAgICBjb25zdCB7IGRhdGE6IHBhcmVudHMsIGVycm9yOiBwYXJlbnRzRXJyb3IgfSA9IGF3YWl0IGFkbWluXHJcbiAgICAgIC5mcm9tKCdwYXJlbnRzJylcclxuICAgICAgLnNlbGVjdCgnKicpXHJcbiAgICAgIC5saW1pdCgxMClcclxuXHJcbiAgICBpZiAoIXBhcmVudHNFcnJvciAmJiBwYXJlbnRzKSB7XHJcbiAgICAgIHBhcmVudCA9IHBhcmVudHMuZmluZCgocDogYW55KSA9PiBcclxuICAgICAgICBwLmVtYWlsICYmIHAuZW1haWwudG9Mb3dlckNhc2UoKS50cmltKCkgPT09IGVtYWlsTG93ZXJcclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIG5vdCBmb3VuZCBpbiBwYXJlbnRzIHRhYmxlLCBjaGVjayBzdHVkZW50cyB0YWJsZSBmb3IgcGFyZW50X2VtYWlsXHJcbiAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICBjb25zdCB7IGRhdGE6IHN0dWRlbnRzLCBlcnJvcjogc3R1ZGVudHNFcnJvciB9ID0gYXdhaXQgYWRtaW5cclxuICAgICAgICAuZnJvbSgnc3R1ZGVudHMnKVxyXG4gICAgICAgIC5zZWxlY3QoJyonKVxyXG4gICAgICAgIC5saW1pdCgxMDApXHJcblxyXG4gICAgICBpZiAoIXN0dWRlbnRzRXJyb3IgJiYgc3R1ZGVudHMpIHtcclxuICAgICAgICAvLyBGaW5kIHN0dWRlbnQgd2l0aCBtYXRjaGluZyBwYXJlbnRfZW1haWxcclxuICAgICAgICBjb25zdCBzdHVkZW50V2l0aFBhcmVudCA9IHN0dWRlbnRzLmZpbmQoKHM6IGFueSkgPT4gXHJcbiAgICAgICAgICBzLnBhcmVudF9lbWFpbCAmJiBzLnBhcmVudF9lbWFpbC50b0xvd2VyQ2FzZSgpLnRyaW0oKSA9PT0gZW1haWxMb3dlclxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgaWYgKHN0dWRlbnRXaXRoUGFyZW50KSB7XHJcbiAgICAgICAgICAvLyBDcmVhdGUgYSBwYXJlbnQgb2JqZWN0IGZyb20gc3R1ZGVudCdzIHBhcmVudCBpbmZvXHJcbiAgICAgICAgICBwYXJlbnQgPSB7XHJcbiAgICAgICAgICAgIGlkOiBgcGFyZW50XyR7c3R1ZGVudFdpdGhQYXJlbnQuaWR9YCxcclxuICAgICAgICAgICAgZW1haWw6IHN0dWRlbnRXaXRoUGFyZW50LnBhcmVudF9lbWFpbCxcclxuICAgICAgICAgICAgbmFtZTogc3R1ZGVudFdpdGhQYXJlbnQucGFyZW50X25hbWUgfHwgJ1BhcmVudC9HdWFyZGlhbicsXHJcbiAgICAgICAgICAgIHBhc3N3b3JkOiBzdHVkZW50V2l0aFBhcmVudC5wYXJlbnRfcGFzc3dvcmQgfHwgbnVsbCxcclxuICAgICAgICAgICAgUGFzc3dvcmQ6IHN0dWRlbnRXaXRoUGFyZW50LnBhcmVudF9wYXNzd29yZCB8fCBudWxsLFxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEZpbmQgYWxsIGNoaWxkcmVuIHdpdGggdGhpcyBwYXJlbnRfZW1haWxcclxuICAgICAgICAgIGNoaWxkcmVuID0gc3R1ZGVudHMuZmlsdGVyKChzOiBhbnkpID0+IFxyXG4gICAgICAgICAgICBzLnBhcmVudF9lbWFpbCAmJiBzLnBhcmVudF9lbWFpbC50b0xvd2VyQ2FzZSgpLnRyaW0oKSA9PT0gZW1haWxMb3dlclxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gSWYgcGFyZW50IGZvdW5kIGluIHBhcmVudHMgdGFibGUsIGdldCB0aGVpciBjaGlsZHJlblxyXG4gICAgICBjb25zdCB7IGRhdGE6IHN0dWRlbnRzLCBlcnJvcjogc3R1ZGVudHNFcnJvciB9ID0gYXdhaXQgYWRtaW5cclxuICAgICAgICAuZnJvbSgnc3R1ZGVudHMnKVxyXG4gICAgICAgIC5zZWxlY3QoJyonKVxyXG4gICAgICAgIC5saW1pdCgxMDApXHJcblxyXG4gICAgICBpZiAoIXN0dWRlbnRzRXJyb3IgJiYgc3R1ZGVudHMpIHtcclxuICAgICAgICAvLyBGaW5kIGNoaWxkcmVuIGJ5IHBhcmVudF9pZCBvciBwYXJlbnRfZW1haWxcclxuICAgICAgICBjaGlsZHJlbiA9IHN0dWRlbnRzLmZpbHRlcigoczogYW55KSA9PiBcclxuICAgICAgICAgIChzLnBhcmVudF9pZCAmJiBzLnBhcmVudF9pZCA9PT0gcGFyZW50LmlkKSB8fFxyXG4gICAgICAgICAgKHMucGFyZW50X2VtYWlsICYmIHMucGFyZW50X2VtYWlsLnRvTG93ZXJDYXNlKCkudHJpbSgpID09PSBlbWFpbExvd2VyKVxyXG4gICAgICAgIClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZW1haWwgb3IgcGFzc3dvcmQnIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDQwMSB9XHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBwYXNzd29yZFxyXG4gICAgY29uc3QgcGFyZW50UGFzc3dvcmQgPSBwYXJlbnQuUGFzc3dvcmQgIT09IHVuZGVmaW5lZCA/IHBhcmVudC5QYXNzd29yZCA6IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucGFzc3dvcmQgIT09IHVuZGVmaW5lZCA/IHBhcmVudC5wYXNzd29yZCA6IG51bGxcclxuXHJcbiAgICBpZiAoIXBhcmVudFBhc3N3b3JkIHx8IHBhcmVudFBhc3N3b3JkICE9PSBwYXNzd29yZCkge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGVtYWlsIG9yIHBhc3N3b3JkJyB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJuIHBhcmVudCBkYXRhIHdpdGggY2hpbGRyZW4gKGV4Y2x1ZGluZyBwYXNzd29yZHMpXHJcbiAgICBjb25zdCBwYXJlbnRXaXRob3V0UGFzc3dvcmQgPSB7IC4uLnBhcmVudCB9XHJcbiAgICBpZiAocGFyZW50V2l0aG91dFBhc3N3b3JkLlBhc3N3b3JkICE9PSB1bmRlZmluZWQpIGRlbGV0ZSBwYXJlbnRXaXRob3V0UGFzc3dvcmQuUGFzc3dvcmRcclxuICAgIGlmIChwYXJlbnRXaXRob3V0UGFzc3dvcmQucGFzc3dvcmQgIT09IHVuZGVmaW5lZCkgZGVsZXRlIHBhcmVudFdpdGhvdXRQYXNzd29yZC5wYXNzd29yZFxyXG5cclxuICAgIC8vIENsZWFuIGNoaWxkcmVuIGRhdGEgKHJlbW92ZSBwYXNzd29yZHMpXHJcbiAgICBjb25zdCBjbGVhbkNoaWxkcmVuID0gY2hpbGRyZW4ubWFwKChjaGlsZDogYW55KSA9PiB7XHJcbiAgICAgIGNvbnN0IGNsZWFuQ2hpbGQgPSB7IC4uLmNoaWxkIH1cclxuICAgICAgaWYgKGNsZWFuQ2hpbGQuUGFzc3dvcmQgIT09IHVuZGVmaW5lZCkgZGVsZXRlIGNsZWFuQ2hpbGQuUGFzc3dvcmRcclxuICAgICAgaWYgKGNsZWFuQ2hpbGQucGFzc3dvcmQgIT09IHVuZGVmaW5lZCkgZGVsZXRlIGNsZWFuQ2hpbGQucGFzc3dvcmRcclxuICAgICAgcmV0dXJuIGNsZWFuQ2hpbGRcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgcGFyZW50OiBwYXJlbnRXaXRob3V0UGFzc3dvcmQsXHJcbiAgICAgIGNoaWxkcmVuOiBjbGVhbkNoaWxkcmVuLFxyXG4gICAgICB1c2VyVHlwZTogJ3BhcmVudCcsXHJcbiAgICB9KVxyXG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1BhcmVudCBsb2dpbiBlcnJvcjonLCBlcnJvcilcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yPy5tZXNzYWdlIHx8ICdVbmtub3duIGVycm9yJyB9LFxyXG4gICAgICB7IHN0YXR1czogNTAwIH1cclxuICAgIClcclxuICB9XHJcbn1cclxuXHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRTdXBhYmFzZUFkbWluIiwiUE9TVCIsInJlcXVlc3QiLCJib2R5IiwianNvbiIsImVtYWlsIiwicGFzc3dvcmQiLCJzdWNjZXNzIiwiZXJyb3IiLCJzdGF0dXMiLCJhZG1pbiIsImVtYWlsTG93ZXIiLCJ0b0xvd2VyQ2FzZSIsInRyaW0iLCJwYXJlbnQiLCJjaGlsZHJlbiIsImRhdGEiLCJwYXJlbnRzIiwicGFyZW50c0Vycm9yIiwiZnJvbSIsInNlbGVjdCIsImxpbWl0IiwiZmluZCIsInAiLCJzdHVkZW50cyIsInN0dWRlbnRzRXJyb3IiLCJzdHVkZW50V2l0aFBhcmVudCIsInMiLCJwYXJlbnRfZW1haWwiLCJpZCIsIm5hbWUiLCJwYXJlbnRfbmFtZSIsInBhcmVudF9wYXNzd29yZCIsIlBhc3N3b3JkIiwiZmlsdGVyIiwicGFyZW50X2lkIiwicGFyZW50UGFzc3dvcmQiLCJ1bmRlZmluZWQiLCJwYXJlbnRXaXRob3V0UGFzc3dvcmQiLCJjbGVhbkNoaWxkcmVuIiwibWFwIiwiY2hpbGQiLCJjbGVhbkNoaWxkIiwidXNlclR5cGUiLCJjb25zb2xlIiwibWVzc2FnZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/parent/login/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabaseAdmin.ts":
/*!******************************!*\
  !*** ./lib/supabaseAdmin.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSupabaseAdmin: () => (/* binding */ getSupabaseAdmin)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/.pnpm/@supabase+supabase-js@2.78.0/node_modules/@supabase/supabase-js/dist/module/index.js\");\n\nconst supabaseUrl = \"https://ulntyefamkxkbynrugop.supabase.co\";\nconst serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\nfunction getSupabaseAdmin() {\n    if (!supabaseUrl || !serviceRoleKey) {\n        throw new Error('Missing Supabase admin env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only).');\n    }\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, serviceRoleKey, {\n        auth: {\n            autoRefreshToken: false,\n            persistSession: false\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2VBZG1pbi50cyIsIm1hcHBpbmdzIjoiOzs7OztBQUF5RTtBQUV6RSxNQUFNQyxjQUFjQywwQ0FBb0M7QUFDeEQsTUFBTUcsaUJBQWlCSCxRQUFRQyxHQUFHLENBQUNHLHlCQUF5QjtBQUVyRCxTQUFTQztJQUNkLElBQUksQ0FBQ04sZUFBZSxDQUFDSSxnQkFBZ0I7UUFDbkMsTUFBTSxJQUFJRyxNQUFNO0lBQ2xCO0lBRUEsT0FBT1IsbUVBQVlBLENBQUNDLGFBQXVCSSxnQkFBMEI7UUFDbkVJLE1BQU07WUFDSkMsa0JBQWtCO1lBQ2xCQyxnQkFBZ0I7UUFDbEI7SUFDRjtBQUNGIiwic291cmNlcyI6WyJEOlxcY2Fwc3RvbmVcXFN0Tmlub0ZpbmFsc1xcbGliXFxzdXBhYmFzZUFkbWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCwgdHlwZSBTdXBhYmFzZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcclxuXHJcbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMXHJcbmNvbnN0IHNlcnZpY2VSb2xlS2V5ID0gcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFN1cGFiYXNlQWRtaW4oKTogU3VwYWJhc2VDbGllbnQge1xyXG4gIGlmICghc3VwYWJhc2VVcmwgfHwgIXNlcnZpY2VSb2xlS2V5KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgU3VwYWJhc2UgYWRtaW4gZW52LiBTZXQgTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIGFuZCBTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIChzZXJ2ZXItb25seSkuJylcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCBhcyBzdHJpbmcsIHNlcnZpY2VSb2xlS2V5IGFzIHN0cmluZywge1xyXG4gICAgYXV0aDoge1xyXG4gICAgICBhdXRvUmVmcmVzaFRva2VuOiBmYWxzZSxcclxuICAgICAgcGVyc2lzdFNlc3Npb246IGZhbHNlLFxyXG4gICAgfSxcclxuICB9KVxyXG59XHJcblxyXG5cclxuIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInNlcnZpY2VSb2xlS2V5IiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsImdldFN1cGFiYXNlQWRtaW4iLCJFcnJvciIsImF1dGgiLCJhdXRvUmVmcmVzaFRva2VuIiwicGVyc2lzdFNlc3Npb24iXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabaseAdmin.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fparent%2Flogin%2Froute&page=%2Fapi%2Fparent%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fparent%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fparent%2Flogin%2Froute&page=%2Fapi%2Fparent%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fparent%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_capstone_StNinoFinals_app_api_parent_login_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/parent/login/route.ts */ \"(rsc)/./app/api/parent/login/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/parent/login/route\",\n        pathname: \"/api/parent/login\",\n        filename: \"route\",\n        bundlePath: \"app/api/parent/login/route\"\n    },\n    resolvedPagePath: \"D:\\\\capstone\\\\StNinoFinals\\\\app\\\\api\\\\parent\\\\login\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_capstone_StNinoFinals_app_api_parent_login_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNS4yLjRfcmVhY3QtZG9tQDE4LjMuMV9yZWFjdEAxOC4zLjFfX3JlYWN0QDE4LjMuMS9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZwYXJlbnQlMkZsb2dpbiUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGcGFyZW50JTJGbG9naW4lMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZwYXJlbnQlMkZsb2dpbiUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDY2Fwc3RvbmUlNUNTdE5pbm9GaW5hbHMlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNjYXBzdG9uZSU1Q1N0Tmlub0ZpbmFscyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDYTtBQUMxRjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiRDpcXFxcY2Fwc3RvbmVcXFxcU3ROaW5vRmluYWxzXFxcXGFwcFxcXFxhcGlcXFxccGFyZW50XFxcXGxvZ2luXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9wYXJlbnQvbG9naW4vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9wYXJlbnQvbG9naW5cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3BhcmVudC9sb2dpbi9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXGNhcHN0b25lXFxcXFN0Tmlub0ZpbmFsc1xcXFxhcHBcXFxcYXBpXFxcXHBhcmVudFxcXFxsb2dpblxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fparent%2Flogin%2Froute&page=%2Fapi%2Fparent%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fparent%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \*********************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \*********************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1","vendor-chunks/tslib@2.8.1","vendor-chunks/tr46@0.0.3","vendor-chunks/@supabase+auth-js@2.78.0","vendor-chunks/@supabase+storage-js@2.78.0","vendor-chunks/@supabase+realtime-js@2.78.0","vendor-chunks/@supabase+postgrest-js@2.78.0","vendor-chunks/@supabase+node-fetch@2.6.15","vendor-chunks/whatwg-url@5.0.0","vendor-chunks/@supabase+supabase-js@2.78.0","vendor-chunks/@supabase+functions-js@2.78.0","vendor-chunks/webidl-conversions@3.0.1"], () => (__webpack_exec__("(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fparent%2Flogin%2Froute&page=%2Fapi%2Fparent%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fparent%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();