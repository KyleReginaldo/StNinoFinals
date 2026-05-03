import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full ring-2 ring-red-100 w-10 h-10" />
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-red-900 leading-tight">Sto. Niño de Praga Academy</p>
                <p className="text-xs text-gray-500">Excellence in Education Since 1998</p>
              </div>
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-red-800 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-red-700 mb-3 block">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: January 1, 2025</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">1. Overview</h2>
            <p>
              Sto. Niño de Praga Academy ("the School", "we", "us") is committed to protecting the
              privacy of students, parents, guardians, and staff. This Privacy Policy explains how we
              collect, use, and safeguard personal information in compliance with the Data Privacy Act
              of 2012 (Republic Act No. 10173) of the Philippines.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">2. Information We Collect</h2>
            <p>We collect the following types of personal information:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Students:</strong> Full name, date of birth, grade level, section, student number, LRN, address, contact details, attendance records, and academic grades.</li>
              <li><strong>Parents / Guardians:</strong> Full name, relationship to student, contact number, and email address.</li>
              <li><strong>Teachers / Staff:</strong> Full name, employee number, contact details, and assigned classes.</li>
              <li><strong>RFID Data:</strong> Card identifiers used for attendance tracking purposes only.</li>
              <li><strong>Admission Inquiries:</strong> Name, contact information, and previous school details submitted through the portal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">3. How We Use Your Information</h2>
            <p>Personal information is used solely for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Managing student enrollment and academic records.</li>
              <li>Monitoring and recording daily attendance via the RFID system.</li>
              <li>Communicating school announcements, grades, and updates to students and guardians.</li>
              <li>Processing admission and enrollment applications.</li>
              <li>Generating reports required by the Department of Education (DepEd).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">4. Data Sharing</h2>
            <p>
              We do not sell, rent, or trade personal information to third parties. Information may be
              shared only with:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Government agencies as required by law (e.g., DepEd, PSA).</li>
              <li>Authorized school personnel on a need-to-know basis.</li>
              <li>Service providers who assist in operating our portal, under strict confidentiality agreements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect personal data
              against unauthorized access, alteration, disclosure, or destruction. Access to the portal
              is secured through password authentication, and sensitive data is encrypted in transit.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">6. Data Retention</h2>
            <p>
              Student records are retained for a minimum period as required by DepEd regulations.
              Admission inquiry data not resulting in enrollment is deleted after one school year.
              RFID attendance logs are retained for the current and immediately preceding school year.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">7. Your Rights</h2>
            <p>Under RA 10173, you have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access</strong> your personal data held by the School.</li>
              <li><strong>Correct</strong> inaccurate or incomplete information.</li>
              <li><strong>Object</strong> to the processing of your data in certain circumstances.</li>
              <li><strong>Erasure</strong> of data that is no longer necessary for its original purpose.</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact our Data Protection Officer at{' '}
              <a href="mailto:info@stnino.ph" className="text-red-700 hover:underline">info@stnino.ph</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">8. Cookies</h2>
            <p>
              The portal uses session cookies solely to maintain your login state. No third-party
              tracking or advertising cookies are used.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Significant changes will be communicated
              through the school portal or official announcements.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-2">10. Contact Us</h2>
            <p>
              For privacy-related concerns or requests, please contact the school administration:
            </p>
            <address className="not-italic mt-2 space-y-1">
              <p className="font-semibold text-gray-700">Sto. Niño de Praga Academy</p>
              <p>Trece Martires City, Cavite, Philippines</p>
              <p>
                Email:{' '}
                <a href="mailto:info@stnino.ph" className="text-red-700 hover:underline">info@stnino.ph</a>
              </p>
            </address>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Sto. Niño de Praga Academy</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-xs text-red-700 font-medium">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
