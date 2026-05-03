import Image from 'next/image';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full ring-2 ring-red-100 w-10 h-10"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-red-900 leading-tight">
                  Sto. Niño de Praga Academy
                </p>
                <p className="text-xs text-gray-500">
                  Excellence in Education Since 1998
                </p>
              </div>
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-red-800 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-red-700 mb-3 block">
            Legal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400">Last updated: January 1, 2025</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Sto. Niño de Praga Academy online portal
              and related services ("Services"), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">
              2. Use of the Portal
            </h2>
            <p>
              The portal is provided exclusively for students, guardians,
              parents, and school staff of Sto. Niño de Praga Academy. Access
              credentials are personal and non-transferable. You are responsible
              for maintaining the confidentiality of your account and password.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Do not share your login credentials with others.</li>
              <li>Log out after each session, especially on shared devices.</li>
              <li>
                Report any unauthorized access to the school administration
                immediately.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">
              3. Student and Guardian Accounts
            </h2>
            <p>
              Accounts are created and managed by the school administration.
              Students and guardians may access their respective portals to view
              grades, attendance records, announcements, and enrollment
              information. Any discrepancy in records must be reported to the
              school registrar.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">
              4. Enrollment and Admission
            </h2>
            <p>
              Submission of an enrollment or admission inquiry through this
              portal does not guarantee enrollment. Final acceptance is subject
              to the school's admission process, available slots, and compliance
              with all requirements. The school reserves the right to approve or
              deny any application.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">
              5. Prohibited Conduct
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                Attempt to gain unauthorized access to other accounts or
                systems.
              </li>
              <li>
                Upload or transmit harmful, offensive, or unlawful content.
              </li>
              <li>
                Use the portal for commercial purposes unrelated to the school.
              </li>
              <li>
                Interfere with or disrupt the integrity of the portal or its
                data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">
              6. Intellectual Property
            </h2>
            <p>
              All content on this portal — including text, logos, images, and
              software — is the property of Sto. Niño de Praga Academy.
              Reproduction or redistribution without written permission is
              prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">
              7. Limitation of Liability
            </h2>
            <p>
              The school shall not be liable for any indirect, incidental, or
              consequential damages arising from the use of or inability to use
              the portal. Service availability is provided on a best-effort
              basis.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">
              8. Changes to Terms
            </h2>
            <p>
              The school reserves the right to update these Terms at any time.
              Continued use of the portal after changes constitutes acceptance
              of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">
              9. Contact
            </h2>
            <p>
              For questions about these Terms, contact the school administration
              at{' '}
              <a
                href="mailto:info@stnino.ph"
                className="text-red-700 hover:underline"
              >
                info@stnino.ph
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Sto. Niño de Praga Academy
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-red-700 font-medium">
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
