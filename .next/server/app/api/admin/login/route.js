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
exports.id = "app/api/admin/login/route";
exports.ids = ["app/api/admin/login/route"];
exports.modules = {

/***/ "(rsc)/./app/api/admin/login/route.ts":
/*!**************************************!*\
  !*** ./app/api/admin/login/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/supabaseAdmin */ \"(rsc)/./lib/supabaseAdmin.ts\");\n\n\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const { email, password } = body;\n        // Validate input\n        if (!email || !password) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                ok: false,\n                error: 'Email and password are required'\n            }, {\n                status: 400\n            });\n        }\n        const admin = (0,_lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__.getSupabaseAdmin)();\n        // Query the Admin table (note: case-sensitive table name)\n        const emailLower = email.toLowerCase().trim();\n        const { data: admins, error } = await admin.from('Admin').select('*').limit(10);\n        if (error) {\n            console.error('Database error:', error);\n            // Return 200 with error message instead of 500\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                ok: false,\n                error: 'Database connection error. Please try again.'\n            }, {\n                status: 200\n            } // Return 200 to prevent Internal Server Error page\n            );\n        }\n        // Find admin by email (case-insensitive)\n        const adminUser = admins?.find((a)=>(a.Email || a.email) && (a.Email || a.email).toString().toLowerCase().trim() === emailLower);\n        if (!adminUser) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                ok: false,\n                error: 'Invalid email or password'\n            }, {\n                status: 401\n            });\n        }\n        // Check for Password field (both lowercase and capitalized)\n        const adminPassword = adminUser.Password !== undefined ? adminUser.Password : adminUser.password !== undefined ? adminUser.password : null;\n        if (!adminPassword || adminPassword !== password) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                ok: false,\n                error: 'Invalid email or password'\n            }, {\n                status: 401\n            });\n        }\n        // Return admin data (excluding password)\n        const adminWithoutPassword = {\n            ...adminUser\n        };\n        if (adminWithoutPassword.Password !== undefined) delete adminWithoutPassword.Password;\n        if (adminWithoutPassword.password !== undefined) delete adminWithoutPassword.password;\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            ok: true,\n            user: adminWithoutPassword,\n            userType: 'admin'\n        });\n    } catch (e) {\n        // Return 200 with error message instead of 500 to prevent Internal Server Error\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            ok: false,\n            error: e?.message ?? 'Unknown error'\n        }, {\n            status: 200\n        } // Always return 200, never 500\n        );\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FkbWluL2xvZ2luL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUEwQztBQUNZO0FBRS9DLGVBQWVFLEtBQUtDLE9BQWdCO0lBQ3pDLElBQUk7UUFDRixNQUFNQyxPQUFPLE1BQU1ELFFBQVFFLElBQUk7UUFDL0IsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLFFBQVEsRUFBRSxHQUFHSDtRQUU1QixpQkFBaUI7UUFDakIsSUFBSSxDQUFDRSxTQUFTLENBQUNDLFVBQVU7WUFDdkIsT0FBT1AscURBQVlBLENBQUNLLElBQUksQ0FDdEI7Z0JBQUVHLElBQUk7Z0JBQU9DLE9BQU87WUFBa0MsR0FDdEQ7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLE1BQU1DLFFBQVFWLG9FQUFnQkE7UUFFOUIsMERBQTBEO1FBQzFELE1BQU1XLGFBQWFOLE1BQU1PLFdBQVcsR0FBR0MsSUFBSTtRQUMzQyxNQUFNLEVBQUVDLE1BQU1DLE1BQU0sRUFBRVAsS0FBSyxFQUFFLEdBQUcsTUFBTUUsTUFDbkNNLElBQUksQ0FBQyxTQUNMQyxNQUFNLENBQUMsS0FDUEMsS0FBSyxDQUFDO1FBRVQsSUFBSVYsT0FBTztZQUNUVyxRQUFRWCxLQUFLLENBQUMsbUJBQW1CQTtZQUNqQywrQ0FBK0M7WUFDL0MsT0FBT1QscURBQVlBLENBQUNLLElBQUksQ0FDdEI7Z0JBQUVHLElBQUk7Z0JBQU9DLE9BQU87WUFBK0MsR0FDbkU7Z0JBQUVDLFFBQVE7WUFBSSxFQUFFLG1EQUFtRDs7UUFFdkU7UUFFQSx5Q0FBeUM7UUFDekMsTUFBTVcsWUFBWUwsUUFBUU0sS0FBSyxDQUFDQyxJQUM5QixDQUFDQSxFQUFFQyxLQUFLLElBQUlELEVBQUVqQixLQUFLLEtBQUssQ0FBQ2lCLEVBQUVDLEtBQUssSUFBSUQsRUFBRWpCLEtBQUssRUFBRW1CLFFBQVEsR0FBR1osV0FBVyxHQUFHQyxJQUFJLE9BQU9GO1FBR25GLElBQUksQ0FBQ1MsV0FBVztZQUNkLE9BQU9yQixxREFBWUEsQ0FBQ0ssSUFBSSxDQUN0QjtnQkFBRUcsSUFBSTtnQkFBT0MsT0FBTztZQUE0QixHQUNoRDtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsNERBQTREO1FBQzVELE1BQU1nQixnQkFBZ0JMLFVBQVVNLFFBQVEsS0FBS0MsWUFBWVAsVUFBVU0sUUFBUSxHQUN0RE4sVUFBVWQsUUFBUSxLQUFLcUIsWUFBWVAsVUFBVWQsUUFBUSxHQUFHO1FBRTdFLElBQUksQ0FBQ21CLGlCQUFpQkEsa0JBQWtCbkIsVUFBVTtZQUNoRCxPQUFPUCxxREFBWUEsQ0FBQ0ssSUFBSSxDQUN0QjtnQkFBRUcsSUFBSTtnQkFBT0MsT0FBTztZQUE0QixHQUNoRDtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEseUNBQXlDO1FBQ3pDLE1BQU1tQix1QkFBdUI7WUFBRSxHQUFHUixTQUFTO1FBQUM7UUFDNUMsSUFBSVEscUJBQXFCRixRQUFRLEtBQUtDLFdBQVcsT0FBT0MscUJBQXFCRixRQUFRO1FBQ3JGLElBQUlFLHFCQUFxQnRCLFFBQVEsS0FBS3FCLFdBQVcsT0FBT0MscUJBQXFCdEIsUUFBUTtRQUVyRixPQUFPUCxxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO1lBQ3ZCRyxJQUFJO1lBQ0pzQixNQUFNRDtZQUNORSxVQUFVO1FBQ1o7SUFDRixFQUFFLE9BQU9DLEdBQVE7UUFDZixnRkFBZ0Y7UUFDaEYsT0FBT2hDLHFEQUFZQSxDQUFDSyxJQUFJLENBQ3RCO1lBQUVHLElBQUk7WUFBT0MsT0FBT3VCLEdBQUdDLFdBQVc7UUFBZ0IsR0FDbEQ7WUFBRXZCLFFBQVE7UUFBSSxFQUFFLCtCQUErQjs7SUFFbkQ7QUFDRiIsInNvdXJjZXMiOlsiRDpcXGNhcHN0b25lXFxTdE5pbm9GaW5hbHNcXGFwcFxcYXBpXFxhZG1pblxcbG9naW5cXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xyXG5pbXBvcnQgeyBnZXRTdXBhYmFzZUFkbWluIH0gZnJvbSAnQC9saWIvc3VwYWJhc2VBZG1pbidcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcXVlc3QuanNvbigpXHJcbiAgICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCB9ID0gYm9keVxyXG5cclxuICAgIC8vIFZhbGlkYXRlIGlucHV0XHJcbiAgICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCkge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBvazogZmFsc2UsIGVycm9yOiAnRW1haWwgYW5kIHBhc3N3b3JkIGFyZSByZXF1aXJlZCcgfSxcclxuICAgICAgICB7IHN0YXR1czogNDAwIH1cclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFkbWluID0gZ2V0U3VwYWJhc2VBZG1pbigpXHJcblxyXG4gICAgLy8gUXVlcnkgdGhlIEFkbWluIHRhYmxlIChub3RlOiBjYXNlLXNlbnNpdGl2ZSB0YWJsZSBuYW1lKVxyXG4gICAgY29uc3QgZW1haWxMb3dlciA9IGVtYWlsLnRvTG93ZXJDYXNlKCkudHJpbSgpXHJcbiAgICBjb25zdCB7IGRhdGE6IGFkbWlucywgZXJyb3IgfSA9IGF3YWl0IGFkbWluXHJcbiAgICAgIC5mcm9tKCdBZG1pbicpXHJcbiAgICAgIC5zZWxlY3QoJyonKVxyXG4gICAgICAubGltaXQoMTApXHJcblxyXG4gICAgaWYgKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0RhdGFiYXNlIGVycm9yOicsIGVycm9yKVxyXG4gICAgICAvLyBSZXR1cm4gMjAwIHdpdGggZXJyb3IgbWVzc2FnZSBpbnN0ZWFkIG9mIDUwMFxyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBvazogZmFsc2UsIGVycm9yOiAnRGF0YWJhc2UgY29ubmVjdGlvbiBlcnJvci4gUGxlYXNlIHRyeSBhZ2Fpbi4nIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDIwMCB9IC8vIFJldHVybiAyMDAgdG8gcHJldmVudCBJbnRlcm5hbCBTZXJ2ZXIgRXJyb3IgcGFnZVxyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmluZCBhZG1pbiBieSBlbWFpbCAoY2FzZS1pbnNlbnNpdGl2ZSlcclxuICAgIGNvbnN0IGFkbWluVXNlciA9IGFkbWlucz8uZmluZCgoYTogYW55KSA9PiBcclxuICAgICAgKGEuRW1haWwgfHwgYS5lbWFpbCkgJiYgKGEuRW1haWwgfHwgYS5lbWFpbCkudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSA9PT0gZW1haWxMb3dlclxyXG4gICAgKVxyXG5cclxuICAgIGlmICghYWRtaW5Vc2VyKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IG9rOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGVtYWlsIG9yIHBhc3N3b3JkJyB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIFBhc3N3b3JkIGZpZWxkIChib3RoIGxvd2VyY2FzZSBhbmQgY2FwaXRhbGl6ZWQpXHJcbiAgICBjb25zdCBhZG1pblBhc3N3b3JkID0gYWRtaW5Vc2VyLlBhc3N3b3JkICE9PSB1bmRlZmluZWQgPyBhZG1pblVzZXIuUGFzc3dvcmQgOiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGFkbWluVXNlci5wYXNzd29yZCAhPT0gdW5kZWZpbmVkID8gYWRtaW5Vc2VyLnBhc3N3b3JkIDogbnVsbFxyXG5cclxuICAgIGlmICghYWRtaW5QYXNzd29yZCB8fCBhZG1pblBhc3N3b3JkICE9PSBwYXNzd29yZCkge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBvazogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBlbWFpbCBvciBwYXNzd29yZCcgfSxcclxuICAgICAgICB7IHN0YXR1czogNDAxIH1cclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJldHVybiBhZG1pbiBkYXRhIChleGNsdWRpbmcgcGFzc3dvcmQpXHJcbiAgICBjb25zdCBhZG1pbldpdGhvdXRQYXNzd29yZCA9IHsgLi4uYWRtaW5Vc2VyIH1cclxuICAgIGlmIChhZG1pbldpdGhvdXRQYXNzd29yZC5QYXNzd29yZCAhPT0gdW5kZWZpbmVkKSBkZWxldGUgYWRtaW5XaXRob3V0UGFzc3dvcmQuUGFzc3dvcmRcclxuICAgIGlmIChhZG1pbldpdGhvdXRQYXNzd29yZC5wYXNzd29yZCAhPT0gdW5kZWZpbmVkKSBkZWxldGUgYWRtaW5XaXRob3V0UGFzc3dvcmQucGFzc3dvcmRcclxuXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xyXG4gICAgICBvazogdHJ1ZSxcclxuICAgICAgdXNlcjogYWRtaW5XaXRob3V0UGFzc3dvcmQsXHJcbiAgICAgIHVzZXJUeXBlOiAnYWRtaW4nLFxyXG4gICAgfSlcclxuICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgIC8vIFJldHVybiAyMDAgd2l0aCBlcnJvciBtZXNzYWdlIGluc3RlYWQgb2YgNTAwIHRvIHByZXZlbnQgSW50ZXJuYWwgU2VydmVyIEVycm9yXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgIHsgb2s6IGZhbHNlLCBlcnJvcjogZT8ubWVzc2FnZSA/PyAnVW5rbm93biBlcnJvcicgfSxcclxuICAgICAgeyBzdGF0dXM6IDIwMCB9IC8vIEFsd2F5cyByZXR1cm4gMjAwLCBuZXZlciA1MDBcclxuICAgIClcclxuICB9XHJcbn1cclxuXHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRTdXBhYmFzZUFkbWluIiwiUE9TVCIsInJlcXVlc3QiLCJib2R5IiwianNvbiIsImVtYWlsIiwicGFzc3dvcmQiLCJvayIsImVycm9yIiwic3RhdHVzIiwiYWRtaW4iLCJlbWFpbExvd2VyIiwidG9Mb3dlckNhc2UiLCJ0cmltIiwiZGF0YSIsImFkbWlucyIsImZyb20iLCJzZWxlY3QiLCJsaW1pdCIsImNvbnNvbGUiLCJhZG1pblVzZXIiLCJmaW5kIiwiYSIsIkVtYWlsIiwidG9TdHJpbmciLCJhZG1pblBhc3N3b3JkIiwiUGFzc3dvcmQiLCJ1bmRlZmluZWQiLCJhZG1pbldpdGhvdXRQYXNzd29yZCIsInVzZXIiLCJ1c2VyVHlwZSIsImUiLCJtZXNzYWdlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admin/login/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabaseAdmin.ts":
/*!******************************!*\
  !*** ./lib/supabaseAdmin.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSupabaseAdmin: () => (/* binding */ getSupabaseAdmin)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/.pnpm/@supabase+supabase-js@2.78.0/node_modules/@supabase/supabase-js/dist/module/index.js\");\n\nconst supabaseUrl = \"https://ulntyefamkxkbynrugop.supabase.co\";\nconst serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\nfunction getSupabaseAdmin() {\n    if (!supabaseUrl || !serviceRoleKey) {\n        throw new Error('Missing Supabase admin env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only).');\n    }\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, serviceRoleKey, {\n        auth: {\n            autoRefreshToken: false,\n            persistSession: false\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2VBZG1pbi50cyIsIm1hcHBpbmdzIjoiOzs7OztBQUF5RTtBQUV6RSxNQUFNQyxjQUFjQywwQ0FBb0M7QUFDeEQsTUFBTUcsaUJBQWlCSCxRQUFRQyxHQUFHLENBQUNHLHlCQUF5QjtBQUVyRCxTQUFTQztJQUNkLElBQUksQ0FBQ04sZUFBZSxDQUFDSSxnQkFBZ0I7UUFDbkMsTUFBTSxJQUFJRyxNQUFNO0lBQ2xCO0lBRUEsT0FBT1IsbUVBQVlBLENBQUNDLGFBQXVCSSxnQkFBMEI7UUFDbkVJLE1BQU07WUFDSkMsa0JBQWtCO1lBQ2xCQyxnQkFBZ0I7UUFDbEI7SUFDRjtBQUNGIiwic291cmNlcyI6WyJEOlxcY2Fwc3RvbmVcXFN0Tmlub0ZpbmFsc1xcbGliXFxzdXBhYmFzZUFkbWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCwgdHlwZSBTdXBhYmFzZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcclxuXHJcbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMXHJcbmNvbnN0IHNlcnZpY2VSb2xlS2V5ID0gcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFN1cGFiYXNlQWRtaW4oKTogU3VwYWJhc2VDbGllbnQge1xyXG4gIGlmICghc3VwYWJhc2VVcmwgfHwgIXNlcnZpY2VSb2xlS2V5KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgU3VwYWJhc2UgYWRtaW4gZW52LiBTZXQgTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIGFuZCBTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIChzZXJ2ZXItb25seSkuJylcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCBhcyBzdHJpbmcsIHNlcnZpY2VSb2xlS2V5IGFzIHN0cmluZywge1xyXG4gICAgYXV0aDoge1xyXG4gICAgICBhdXRvUmVmcmVzaFRva2VuOiBmYWxzZSxcclxuICAgICAgcGVyc2lzdFNlc3Npb246IGZhbHNlLFxyXG4gICAgfSxcclxuICB9KVxyXG59XHJcblxyXG5cclxuIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInNlcnZpY2VSb2xlS2V5IiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsImdldFN1cGFiYXNlQWRtaW4iLCJFcnJvciIsImF1dGgiLCJhdXRvUmVmcmVzaFRva2VuIiwicGVyc2lzdFNlc3Npb24iXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabaseAdmin.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Flogin%2Froute&page=%2Fapi%2Fadmin%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Flogin%2Froute&page=%2Fapi%2Fadmin%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_capstone_StNinoFinals_app_api_admin_login_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admin/login/route.ts */ \"(rsc)/./app/api/admin/login/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admin/login/route\",\n        pathname: \"/api/admin/login\",\n        filename: \"route\",\n        bundlePath: \"app/api/admin/login/route\"\n    },\n    resolvedPagePath: \"D:\\\\capstone\\\\StNinoFinals\\\\app\\\\api\\\\admin\\\\login\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_capstone_StNinoFinals_app_api_admin_login_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNS4yLjRfcmVhY3QtZG9tQDE4LjMuMV9yZWFjdEAxOC4zLjFfX3JlYWN0QDE4LjMuMS9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbiUyRmxvZ2luJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhZG1pbiUyRmxvZ2luJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYWRtaW4lMkZsb2dpbiUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDY2Fwc3RvbmUlNUNTdE5pbm9GaW5hbHMlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNjYXBzdG9uZSU1Q1N0Tmlub0ZpbmFscyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDWTtBQUN6RjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiRDpcXFxcY2Fwc3RvbmVcXFxcU3ROaW5vRmluYWxzXFxcXGFwcFxcXFxhcGlcXFxcYWRtaW5cXFxcbG9naW5cXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2FkbWluL2xvZ2luL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYWRtaW4vbG9naW5cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2FkbWluL2xvZ2luL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiRDpcXFxcY2Fwc3RvbmVcXFxcU3ROaW5vRmluYWxzXFxcXGFwcFxcXFxhcGlcXFxcYWRtaW5cXFxcbG9naW5cXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Flogin%2Froute&page=%2Fapi%2Fadmin%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1","vendor-chunks/tslib@2.8.1","vendor-chunks/tr46@0.0.3","vendor-chunks/@supabase+auth-js@2.78.0","vendor-chunks/@supabase+storage-js@2.78.0","vendor-chunks/@supabase+realtime-js@2.78.0","vendor-chunks/@supabase+postgrest-js@2.78.0","vendor-chunks/@supabase+node-fetch@2.6.15","vendor-chunks/whatwg-url@5.0.0","vendor-chunks/@supabase+supabase-js@2.78.0","vendor-chunks/@supabase+functions-js@2.78.0","vendor-chunks/webidl-conversions@3.0.1"], () => (__webpack_exec__("(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Flogin%2Froute&page=%2Fapi%2Fadmin%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Flogin%2Froute.ts&appDir=D%3A%5Ccapstone%5CStNinoFinals%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Ccapstone%5CStNinoFinals&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();