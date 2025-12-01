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
exports.id = "app/api/teacher/login/route";
exports.ids = ["app/api/teacher/login/route"];
exports.modules = {

/***/ "(rsc)/./app/api/teacher/login/route.ts":
/*!****************************************!*\
  !*** ./app/api/teacher/login/route.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/supabaseAdmin */ \"(rsc)/./lib/supabaseAdmin.ts\");\n\n\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const { email, password } = body;\n        // Validate input\n        if (!email || !password) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: 'Email and password are required'\n            }, {\n                status: 400\n            });\n        }\n        const admin = (0,_lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__.getSupabaseAdmin)();\n        // Query the teachers table (case-insensitive email search)\n        const emailLower = email.toLowerCase().trim();\n        const { data: teachers, error } = await admin.from('teachers').select('*').limit(10);\n        if (error) {\n            console.error('Database error:', error);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: 'Database connection error. Please try again.'\n            }, {\n                status: 500\n            });\n        }\n        // Find teacher by email (case-insensitive)\n        const teacher = teachers?.find((t)=>t.email && t.email.toLowerCase().trim() === emailLower);\n        if (!teacher) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: 'Invalid email or password'\n            }, {\n                status: 401\n            });\n        }\n        // Check for Password field (both lowercase and capitalized)\n        const teacherPassword = teacher.Password !== undefined ? teacher.Password : teacher.password !== undefined ? teacher.password : null;\n        if (!teacherPassword || teacherPassword !== password) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: 'Invalid email or password'\n            }, {\n                status: 401\n            });\n        }\n        // Return teacher data (excluding password)\n        const teacherWithoutPassword = {\n            ...teacher\n        };\n        if (teacherWithoutPassword.Password !== undefined) delete teacherWithoutPassword.Password;\n        if (teacherWithoutPassword.password !== undefined) delete teacherWithoutPassword.password;\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            teacher: teacherWithoutPassword\n        });\n    } catch (e) {\n        console.error('Teacher login error:', e);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: e?.message ?? 'Unknown error'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3RlYWNoZXIvbG9naW4vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTBDO0FBQ1k7QUFFL0MsZUFBZUUsS0FBS0MsT0FBZ0I7SUFDekMsSUFBSTtRQUNGLE1BQU1DLE9BQU8sTUFBTUQsUUFBUUUsSUFBSTtRQUMvQixNQUFNLEVBQUVDLEtBQUssRUFBRUMsUUFBUSxFQUFFLEdBQUdIO1FBRTVCLGlCQUFpQjtRQUNqQixJQUFJLENBQUNFLFNBQVMsQ0FBQ0MsVUFBVTtZQUN2QixPQUFPUCxxREFBWUEsQ0FBQ0ssSUFBSSxDQUN0QjtnQkFBRUcsU0FBUztnQkFBT0MsT0FBTztZQUFrQyxHQUMzRDtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsTUFBTUMsUUFBUVYsb0VBQWdCQTtRQUU5QiwyREFBMkQ7UUFDM0QsTUFBTVcsYUFBYU4sTUFBTU8sV0FBVyxHQUFHQyxJQUFJO1FBQzNDLE1BQU0sRUFBRUMsTUFBTUMsUUFBUSxFQUFFUCxLQUFLLEVBQUUsR0FBRyxNQUFNRSxNQUNyQ00sSUFBSSxDQUFDLFlBQ0xDLE1BQU0sQ0FBQyxLQUNQQyxLQUFLLENBQUM7UUFFVCxJQUFJVixPQUFPO1lBQ1RXLFFBQVFYLEtBQUssQ0FBQyxtQkFBbUJBO1lBQ2pDLE9BQU9ULHFEQUFZQSxDQUFDSyxJQUFJLENBQ3RCO2dCQUFFRyxTQUFTO2dCQUFPQyxPQUFPO1lBQStDLEdBQ3hFO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSwyQ0FBMkM7UUFDM0MsTUFBTVcsVUFBVUwsVUFBVU0sS0FBSyxDQUFDQyxJQUM5QkEsRUFBRWpCLEtBQUssSUFBSWlCLEVBQUVqQixLQUFLLENBQUNPLFdBQVcsR0FBR0MsSUFBSSxPQUFPRjtRQUc5QyxJQUFJLENBQUNTLFNBQVM7WUFDWixPQUFPckIscURBQVlBLENBQUNLLElBQUksQ0FDdEI7Z0JBQUVHLFNBQVM7Z0JBQU9DLE9BQU87WUFBNEIsR0FDckQ7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLDREQUE0RDtRQUM1RCxNQUFNYyxrQkFBa0JILFFBQVFJLFFBQVEsS0FBS0MsWUFBWUwsUUFBUUksUUFBUSxHQUNsREosUUFBUWQsUUFBUSxLQUFLbUIsWUFBWUwsUUFBUWQsUUFBUSxHQUFHO1FBRTNFLElBQUksQ0FBQ2lCLG1CQUFtQkEsb0JBQW9CakIsVUFBVTtZQUNwRCxPQUFPUCxxREFBWUEsQ0FBQ0ssSUFBSSxDQUN0QjtnQkFBRUcsU0FBUztnQkFBT0MsT0FBTztZQUE0QixHQUNyRDtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsMkNBQTJDO1FBQzNDLE1BQU1pQix5QkFBeUI7WUFBRSxHQUFHTixPQUFPO1FBQUM7UUFDNUMsSUFBSU0sdUJBQXVCRixRQUFRLEtBQUtDLFdBQVcsT0FBT0MsdUJBQXVCRixRQUFRO1FBQ3pGLElBQUlFLHVCQUF1QnBCLFFBQVEsS0FBS21CLFdBQVcsT0FBT0MsdUJBQXVCcEIsUUFBUTtRQUV6RixPQUFPUCxxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO1lBQ3ZCRyxTQUFTO1lBQ1RhLFNBQVNNO1FBQ1g7SUFDRixFQUFFLE9BQU9DLEdBQVE7UUFDZlIsUUFBUVgsS0FBSyxDQUFDLHdCQUF3Qm1CO1FBQ3RDLE9BQU81QixxREFBWUEsQ0FBQ0ssSUFBSSxDQUN0QjtZQUFFRyxTQUFTO1lBQU9DLE9BQU9tQixHQUFHQyxXQUFXO1FBQWdCLEdBQ3ZEO1lBQUVuQixRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsiRDpcXGNhcHN0b25lXFxTdE5pbm9GaW5hbHNcXGFwcFxcYXBpXFx0ZWFjaGVyXFxsb2dpblxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXHJcbmltcG9ydCB7IGdldFN1cGFiYXNlQWRtaW4gfSBmcm9tICdAL2xpYi9zdXBhYmFzZUFkbWluJ1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKClcclxuICAgIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSBib2R5XHJcblxyXG4gICAgLy8gVmFsaWRhdGUgaW5wdXRcclxuICAgIGlmICghZW1haWwgfHwgIXBhc3N3b3JkKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VtYWlsIGFuZCBwYXNzd29yZCBhcmUgcmVxdWlyZWQnIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhZG1pbiA9IGdldFN1cGFiYXNlQWRtaW4oKVxyXG5cclxuICAgIC8vIFF1ZXJ5IHRoZSB0ZWFjaGVycyB0YWJsZSAoY2FzZS1pbnNlbnNpdGl2ZSBlbWFpbCBzZWFyY2gpXHJcbiAgICBjb25zdCBlbWFpbExvd2VyID0gZW1haWwudG9Mb3dlckNhc2UoKS50cmltKClcclxuICAgIGNvbnN0IHsgZGF0YTogdGVhY2hlcnMsIGVycm9yIH0gPSBhd2FpdCBhZG1pblxyXG4gICAgICAuZnJvbSgndGVhY2hlcnMnKVxyXG4gICAgICAuc2VsZWN0KCcqJylcclxuICAgICAgLmxpbWl0KDEwKVxyXG5cclxuICAgIGlmIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdEYXRhYmFzZSBlcnJvcjonLCBlcnJvcilcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICAgIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRGF0YWJhc2UgY29ubmVjdGlvbiBlcnJvci4gUGxlYXNlIHRyeSBhZ2Fpbi4nIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICAvLyBGaW5kIHRlYWNoZXIgYnkgZW1haWwgKGNhc2UtaW5zZW5zaXRpdmUpXHJcbiAgICBjb25zdCB0ZWFjaGVyID0gdGVhY2hlcnM/LmZpbmQoKHQ6IGFueSkgPT4gXHJcbiAgICAgIHQuZW1haWwgJiYgdC5lbWFpbC50b0xvd2VyQ2FzZSgpLnRyaW0oKSA9PT0gZW1haWxMb3dlclxyXG4gICAgKVxyXG5cclxuICAgIGlmICghdGVhY2hlcikge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGVtYWlsIG9yIHBhc3N3b3JkJyB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIFBhc3N3b3JkIGZpZWxkIChib3RoIGxvd2VyY2FzZSBhbmQgY2FwaXRhbGl6ZWQpXHJcbiAgICBjb25zdCB0ZWFjaGVyUGFzc3dvcmQgPSB0ZWFjaGVyLlBhc3N3b3JkICE9PSB1bmRlZmluZWQgPyB0ZWFjaGVyLlBhc3N3b3JkIDogXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlYWNoZXIucGFzc3dvcmQgIT09IHVuZGVmaW5lZCA/IHRlYWNoZXIucGFzc3dvcmQgOiBudWxsXHJcblxyXG4gICAgaWYgKCF0ZWFjaGVyUGFzc3dvcmQgfHwgdGVhY2hlclBhc3N3b3JkICE9PSBwYXNzd29yZCkge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGVtYWlsIG9yIHBhc3N3b3JkJyB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJuIHRlYWNoZXIgZGF0YSAoZXhjbHVkaW5nIHBhc3N3b3JkKVxyXG4gICAgY29uc3QgdGVhY2hlcldpdGhvdXRQYXNzd29yZCA9IHsgLi4udGVhY2hlciB9XHJcbiAgICBpZiAodGVhY2hlcldpdGhvdXRQYXNzd29yZC5QYXNzd29yZCAhPT0gdW5kZWZpbmVkKSBkZWxldGUgdGVhY2hlcldpdGhvdXRQYXNzd29yZC5QYXNzd29yZFxyXG4gICAgaWYgKHRlYWNoZXJXaXRob3V0UGFzc3dvcmQucGFzc3dvcmQgIT09IHVuZGVmaW5lZCkgZGVsZXRlIHRlYWNoZXJXaXRob3V0UGFzc3dvcmQucGFzc3dvcmRcclxuXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICB0ZWFjaGVyOiB0ZWFjaGVyV2l0aG91dFBhc3N3b3JkLFxyXG4gICAgfSlcclxuICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1RlYWNoZXIgbG9naW4gZXJyb3I6JywgZSlcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGU/Lm1lc3NhZ2UgPz8gJ1Vua25vd24gZXJyb3InIH0sXHJcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxyXG4gICAgKVxyXG4gIH1cclxufVxyXG5cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFN1cGFiYXNlQWRtaW4iLCJQT1NUIiwicmVxdWVzdCIsImJvZHkiLCJqc29uIiwiZW1haWwiLCJwYXNzd29yZCIsInN1Y2Nlc3MiLCJlcnJvciIsInN0YXR1cyIsImFkbWluIiwiZW1haWxMb3dlciIsInRvTG93ZXJDYXNlIiwidHJpbSIsImRhdGEiLCJ0ZWFjaGVycyIsImZyb20iLCJzZWxlY3QiLCJsaW1pdCIsImNvbnNvbGUiLCJ0ZWFjaGVyIiwiZmluZCIsInQiLCJ0ZWFjaGVyUGFzc3dvcmQiLCJQYXNzd29yZCIsInVuZGVmaW5lZCIsInRlYWNoZXJXaXRob3V0UGFzc3dvcmQiLCJlIiwibWVzc2FnZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/teacher/login/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabaseAdmin.ts":
/*!******************************!*\
  !*** ./lib/supabaseAdmin.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSupabaseAdmin: () => (/* binding */ getSupabaseAdmin)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/.pnpm/@supabase+supabase-js@2.78.0/node_modules/@supabase/supabase-js/dist/module/index.js\");\n\nconst supabaseUrl = \"https://ulntyefamkxkbynrugop.supabase.co\";\nconst serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\nfunction getSupabaseAdmin() {\n    if (!supabaseUrl || !serviceRoleKey) {\n        throw new Error('Missing Supabase admin env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only).');\n    }\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, serviceRoleKey, {\n        auth: {\n            autoRefreshToken: false,\n            persistSession: false\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2VBZG1pbi50cyIsIm1hcHBpbmdzIjoiOzs7OztBQUF5RTtBQUV6RSxNQUFNQyxjQUFjQywwQ0FBb0M7QUFDeEQsTUFBTUcsaUJBQWlCSCxRQUFRQyxHQUFHLENBQUNHLHlCQUF5QjtBQUVyRCxTQUFTQztJQUNkLElBQUksQ0FBQ04sZUFBZSxDQUFDSSxnQkFBZ0I7UUFDbkMsTUFBTSxJQUFJRyxNQUFNO0lBQ2xCO0lBRUEsT0FBT1IsbUVBQVlBLENBQUNDLGFBQXVCSSxnQkFBMEI7UUFDbkVJLE1BQU07WUFDSkMsa0JBQWtCO1lBQ2xCQyxnQkFBZ0I7UUFDbEI7SUFDRjtBQUNGIiwic291cmNlcyI6WyJEOlxcY2Fwc3RvbmVcXFN0Tmlub0ZpbmFsc1xcbGliXFxzdXBhYmFzZUFkbWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCwgdHlwZSBTdXBhYmFzZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcclxuXHJcbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMXHJcbmNvbnN0IHNlcnZpY2VSb2xlS2V5ID0gcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFN1cGFiYXNlQWRtaW4oKTogU3VwYWJhc2VDbGllbnQge1xyXG4gIGlmICghc3VwYWJhc2VVcmwgfHwgIXNlcnZpY2VSb2xlS2V5KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgU3VwYWJhc2UgYWRtaW4gZW52LiBTZXQgTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIGFuZCBTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIChzZXJ2ZXItb25seSkuJylcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCBhcyBzdHJpbmcsIHNlcnZpY2VSb2xlS2V5IGFzIHN0cmluZywge1xyXG4gICAgYXV0aDoge1xyXG4gICAgICBhdXRvUmVmcmVzaFRva2VuOiBmYWxzZSxcclxuICAgICAgcGVyc2lzdFNlc3Npb246IGZhbHNlLFxyXG4gICAgfSxcclxuICB9KVxyXG59XHJcblxyXG5cclxuIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInNlcnZpY2VSb2xlS2V5IiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsImdldFN1cGFiYXNlQWRtaW4iLCJFcnJvciIsImF1dGgiLCJhdXRvUmVmcmVzaFRva2VuIiwicGVyc2lzdFNlc3Npb24iXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabaseAdmin.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fteacher%2Flogin%2Froute&page=%2Fapi%2Fteacher%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fteacher%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fteacher%2Flogin%2Froute&page=%2Fapi%2Fteacher%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fteacher%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_capstone_StNinoFinals_app_api_teacher_login_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/teacher/login/route.ts */ \"(rsc)/./app/api/teacher/login/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/teacher/login/route\",\n        pathname: \"/api/teacher/login\",\n        filename: \"route\",\n        bundlePath: \"app/api/teacher/login/route\"\n    },\n    resolvedPagePath: \"D:\\\\capstone\\\\StNinoFinals\\\\app\\\\api\\\\teacher\\\\login\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_capstone_StNinoFinals_app_api_teacher_login_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNS4yLjRfcmVhY3QtZG9tQDE4LjMuMV9yZWFjdEAxOC4zLjFfX3JlYWN0QDE4LjMuMS9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ0ZWFjaGVyJTJGbG9naW4lMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnRlYWNoZXIlMkZsb2dpbiUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnRlYWNoZXIlMkZsb2dpbiUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDY2Fwc3RvbmUlNUNTdE5pbm9GaW5hbHMlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNjYXBzdG9uZSU1Q1N0Tmlub0ZpbmFscyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDYztBQUMzRjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiRDpcXFxcY2Fwc3RvbmVcXFxcU3ROaW5vRmluYWxzXFxcXGFwcFxcXFxhcGlcXFxcdGVhY2hlclxcXFxsb2dpblxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvdGVhY2hlci9sb2dpbi9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3RlYWNoZXIvbG9naW5cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3RlYWNoZXIvbG9naW4vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJEOlxcXFxjYXBzdG9uZVxcXFxTdE5pbm9GaW5hbHNcXFxcYXBwXFxcXGFwaVxcXFx0ZWFjaGVyXFxcXGxvZ2luXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fteacher%2Flogin%2Froute&page=%2Fapi%2Fteacher%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fteacher%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1","vendor-chunks/tslib@2.8.1","vendor-chunks/tr46@0.0.3","vendor-chunks/@supabase+auth-js@2.78.0","vendor-chunks/@supabase+storage-js@2.78.0","vendor-chunks/@supabase+realtime-js@2.78.0","vendor-chunks/@supabase+postgrest-js@2.78.0","vendor-chunks/@supabase+node-fetch@2.6.15","vendor-chunks/whatwg-url@5.0.0","vendor-chunks/@supabase+supabase-js@2.78.0","vendor-chunks/@supabase+functions-js@2.78.0","vendor-chunks/webidl-conversions@3.0.1"], () => (__webpack_exec__("(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fteacher%2Flogin%2Froute&page=%2Fapi%2Fteacher%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fteacher%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();