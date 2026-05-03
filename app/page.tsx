'use client';

import type React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAlert } from '@/lib/use-alert';
import {
  Award,
  BookOpen,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Phone,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useUser } from './context/user-context';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const { showAlert } = useAlert();
  const [admissionForm, setAdmissionForm] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    parentName: '',
    emailAddress: '',
    phoneNumber: '+63',
    intendedGradeLevel: '',
    previousSchool: '',
    additionalMessage: '',
  });
  const [isSubmittingAdmission, setIsSubmittingAdmission] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [admissionTab, setAdmissionTab] = useState('requirements');

  const scrollToInquiry = () => {
    setAdmissionTab('inquiry');
    document
      .getElementById('admissions')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdmission(true);

    try {
      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: admissionForm.firstName,
          last_name: admissionForm.lastName,
          middle_initial: admissionForm.middleInitial,
          parent_name: admissionForm.parentName,
          email_address: admissionForm.emailAddress,
          phone_number: admissionForm.phoneNumber,
          intended_grade_level: admissionForm.intendedGradeLevel,
          previous_school: admissionForm.previousSchool,
          additional_message: admissionForm.additionalMessage,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmittedEmail(admissionForm.emailAddress);
        setSubmissionSuccess(true);
        // Reset form
        setAdmissionForm({
          firstName: '',
          lastName: '',
          middleInitial: '',
          parentName: '',
          emailAddress: '',
          phoneNumber: '+63',
          intendedGradeLevel: '',
          previousSchool: '',
          additionalMessage: '',
        });
      } else {
        showAlert({
          message:
            result.error || 'Failed to submit admission. Please try again.',
          type: 'error',
        });
      }
    } catch (error: any) {
      console.error('Admission submission error:', error);
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setIsSubmittingAdmission(false);
    }
  };

  const link =
    user?.role === 'parent' ? '/parent-dashboard' : `/${user?.role || ''}`;

  const NAV_LINKS = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#admissions', label: 'Admissions' },
    { href: '#contact', label: 'Contact' },
  ];

  const STATS = [
    { value: '25+', label: 'Years of Excellence' },
    { value: '1,200+', label: 'Alumni Worldwide' },
    { value: '98%', label: 'College Acceptance' },
    { value: '40+', label: 'Dedicated Educators' },
  ];

  const FEATURES = [
    {
      icon: GraduationCap,
      title: 'Academic Excellence',
      desc: 'Rigorous curriculum designed to prepare students for higher education and lifelong success.',
    },
    {
      icon: Users,
      title: 'Small Class Sizes',
      desc: 'Personalized attention through low student-to-teacher ratios for optimal learning.',
    },
    {
      icon: BookOpen,
      title: 'Holistic Education',
      desc: 'Balanced approach combining academics, arts, sports, and spiritual formation.',
    },
    {
      icon: Award,
      title: 'Proven Track Record',
      desc: '25+ years of excellence with graduates thriving in top universities and careers.',
    },
  ];

  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Sto Niño de Praga Academy"
                width={64}
                height={64}
                className="rounded-full ring-2 ring-red-100"
              />
              <div className="hidden sm:block">
                <p className="text-md font-bold text-red-900 leading-tight">
                  Sto. Niño de Praga Academy
                </p>
                <p className="text-sm text-gray-500">
                  Excellence in Education Since 1998
                </p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium text-gray-600 hover:text-red-800 transition-colors relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-red-800 group-hover:w-full transition-all duration-200" />
                </a>
              ))}
              {user && user.role ? (
                <Link href={link}>
                  <span className="inline-flex items-center text-sm font-semibold bg-red-800 hover:bg-red-700 text-white rounded-full px-5 py-2 transition-colors">
                    Dashboard
                  </span>
                </Link>
              ) : (
                <Link href="/login">
                  <span className="inline-flex items-center text-sm font-semibold bg-red-800 hover:bg-red-700 text-white rounded-full px-5 py-2 transition-colors">
                    Sign In
                  </span>
                </Link>
              )}
            </nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-800 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-2 px-3">
                {user && user.role ? (
                  <Link href={link} onClick={() => setMobileMenuOpen(false)}>
                    <span className="flex w-full justify-center text-sm font-semibold bg-red-800 hover:bg-red-700 text-white rounded-full px-5 py-2.5 transition-colors">
                      Dashboard
                    </span>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <span className="flex w-full justify-center text-sm font-semibold bg-red-800 hover:bg-red-700 text-white rounded-full px-5 py-2.5 transition-colors">
                      Sign In
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-rose-800 text-white"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              S.Y. 2026–2027
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Where Young Minds
              <br />
              <span className="text-amber-300">Flourish &amp; Grow.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Nurturing students with quality education, strong Christian
              values, and a community that celebrates every achievement — since
              1998.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={scrollToInquiry}
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-sm px-7 py-3.5 rounded-full transition-all duration-200 active:scale-95 shadow-lg shadow-amber-900/30"
              >
                <GraduationCap className="w-4 h-4" />
                Apply Now
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById('about')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-200 active:scale-95"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 60L1440 60L1440 30C1200 60 900 0 720 0C540 0 240 60 0 30L0 60Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-red-900 mb-1">
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / FEATURES ── */}
      <section id="about" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-red-700 mb-3 block">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              A school that cares about
              <br className="hidden sm:block" /> the whole child.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              We believe education is more than academics — it's about shaping
              confident, compassionate, and capable individuals ready for the
              world.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-5 group-hover:bg-red-800 transition-colors">
                  <Icon className="w-6 h-6 text-red-800 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADMISSIONS ── */}
      <section id="admissions" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-red-700 mb-3 block">
              Enrollment
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              Start your child's journey
              <br className="hidden sm:block" /> to excellence.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              We welcome students eager to learn, grow, and be part of a
              community that celebrates every achievement.
            </p>
          </div>

          <div className="max-w-5xl">
            <Tabs
              value={admissionTab}
              onValueChange={setAdmissionTab}
              className="w-full"
            >
              <TabsList className="inline-flex bg-gray-100 rounded-full p-1 mb-10 gap-1">
                <TabsTrigger
                  value="requirements"
                  className="rounded-full text-sm px-5 py-2 data-[state=active]:bg-red-800 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                >
                  Requirements
                </TabsTrigger>
                <TabsTrigger
                  value="inquiry"
                  className="rounded-full text-sm px-5 py-2 data-[state=active]:bg-red-800 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                >
                  Submit Inquiry
                </TabsTrigger>
              </TabsList>

              {/* Requirements tab */}
              <TabsContent value="requirements">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-gray-50 rounded-2xl p-8 border border-gray-100 space-y-8">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-red-800 text-white text-xs flex items-center justify-center font-bold">
                          1
                        </span>
                        For New Students
                      </h4>
                      <ul className="space-y-2.5">
                        {[
                          'Completed application form',
                          'Birth certificate (original & photocopy)',
                          'Report card from previous school',
                          'Certificate of good moral character',
                          'Medical certificate',
                          '2×2 ID photos (4 pieces)',
                          'Entrance examination (scheduled post-application)',
                        ].map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-sm text-gray-600"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-red-800 text-white text-xs flex items-center justify-center font-bold">
                          2
                        </span>
                        For Transferees
                      </h4>
                      <ul className="space-y-2.5">
                        {[
                          'All requirements for new students',
                          'Transfer credentials (Form 137)',
                          'Certificate of enrollment from previous school',
                          'Honorable dismissal',
                        ].map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-sm text-gray-600"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Important dates card */}
                  <div className="bg-red-900 text-white rounded-2xl p-8 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold tracking-widest uppercase text-red-300 mb-4">
                        Important Dates
                      </p>
                      <div className="space-y-5">
                        {[
                          {
                            period: 'March – May',
                            label: 'Application Period',
                          },
                          {
                            period: 'April – May',
                            label: 'Entrance Examination',
                          },
                          { period: 'June', label: 'Enrollment Period' },
                        ].map((d) => (
                          <div
                            key={d.label}
                            className="border-b border-white/10 pb-5 last:border-0 last:pb-0"
                          >
                            <p className="text-lg font-bold text-amber-300">
                              {d.period}
                            </p>
                            <p className="text-sm text-white/70 mt-0.5">
                              {d.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={scrollToInquiry}
                      className="mt-8 w-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-sm py-3 rounded-xl transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </TabsContent>

              {/* Inquiry form tab */}
              <TabsContent value="inquiry">
                {submissionSuccess ? (
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 sm:p-10 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Application Submitted!
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Thank you for your interest in Sto. Niño de Praga Academy.
                      <br />
                      We will contact you at <strong>
                        {submittedEmail}
                      </strong>{' '}
                      with next steps.
                    </p>
                    <button
                      onClick={() => setSubmissionSuccess(false)}
                      className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white font-semibold text-sm px-7 py-3 rounded-xl transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 sm:p-10">
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Admission Inquiry Form
                      </h3>
                      <p className="text-sm text-gray-500">
                        Fill out this form and we'll be in touch with program
                        details.
                      </p>
                    </div>
                    <form
                      onSubmit={handleAdmissionSubmit}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_80px] gap-5">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="firstName"
                            className="text-sm font-medium text-gray-700"
                            required
                          >
                            Student's First Name
                          </Label>
                          <Input
                            id="firstName"
                            value={admissionForm.firstName}
                            placeholder="First name"
                            onChange={(e) =>
                              setAdmissionForm({
                                ...admissionForm,
                                firstName: e.target.value,
                              })
                            }
                            required
                            disabled={isSubmittingAdmission}
                            className="h-11 bg-white border-gray-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="lastName"
                            className="text-sm font-medium text-gray-700"
                            required
                          >
                            Student's Last Name
                          </Label>
                          <Input
                            id="lastName"
                            value={admissionForm.lastName}
                            placeholder="Last name"
                            onChange={(e) =>
                              setAdmissionForm({
                                ...admissionForm,
                                lastName: e.target.value,
                              })
                            }
                            required
                            disabled={isSubmittingAdmission}
                            className="h-11 bg-white border-gray-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="middleInitial"
                            className="text-sm font-medium text-gray-700"
                          >
                            M.I.
                          </Label>
                          <Input
                            id="middleInitial"
                            value={admissionForm.middleInitial}
                            placeholder="M.I."
                            maxLength={2}
                            onChange={(e) =>
                              setAdmissionForm({
                                ...admissionForm,
                                middleInitial: e.target.value,
                              })
                            }
                            disabled={isSubmittingAdmission}
                            className="h-11 bg-white border-gray-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="parentName"
                          className="text-sm font-medium text-gray-700"
                          required
                        >
                          Parent / Guardian Name
                        </Label>
                        <Input
                          id="parentName"
                          value={admissionForm.parentName}
                          placeholder="Full name of parent or guardian"
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              parentName: e.target.value,
                            })
                          }
                          required
                          disabled={isSubmittingAdmission}
                          className="h-11 bg-white border-gray-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="emailAddress"
                            className="text-sm font-medium text-gray-700"
                            required
                          >
                            Email Address
                          </Label>
                          <Input
                            id="emailAddress"
                            type="email"
                            value={admissionForm.emailAddress}
                            placeholder="you@example.com"
                            onChange={(e) =>
                              setAdmissionForm({
                                ...admissionForm,
                                emailAddress: e.target.value,
                              })
                            }
                            required
                            disabled={isSubmittingAdmission}
                            className="h-11 bg-white border-gray-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="phoneNumber"
                            className="text-sm font-medium text-gray-700"
                            required
                          >
                            Phone Number
                          </Label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            maxLength={13}
                            value={admissionForm.phoneNumber}
                            placeholder="+63XXXXXXXXXX"
                            onChange={(e) => {
                              let val = e.target.value;
                              // Always keep +63 prefix; allow only digits after it
                              if (!val.startsWith('+63')) val = '+63';
                              const digits = val
                                .slice(3)
                                .replace(/\D/g, '')
                                .slice(0, 10);
                              setAdmissionForm({
                                ...admissionForm,
                                phoneNumber: '+63' + digits,
                              });
                            }}
                            required
                            disabled={isSubmittingAdmission}
                            className="h-11 bg-white border-gray-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="intendedGradeLevel"
                            className="text-sm font-medium text-gray-700"
                            required
                          >
                            Intended Grade Level
                          </Label>
                          <Select
                            value={admissionForm.intendedGradeLevel}
                            onValueChange={(v) =>
                              setAdmissionForm({
                                ...admissionForm,
                                intendedGradeLevel: v,
                              })
                            }
                            disabled={isSubmittingAdmission}
                          >
                            <SelectTrigger className="h-11 bg-white border-gray-200">
                              <SelectValue placeholder="Select grade level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kindergarten">
                                Kindergarten
                              </SelectItem>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={`grade${i + 1}`}>
                                  Grade {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="previousSchool"
                            className="text-sm font-medium text-gray-700"
                          >
                            Previous School
                          </Label>
                          <Input
                            id="previousSchool"
                            value={admissionForm.previousSchool}
                            placeholder="Previous school name (if any)"
                            onChange={(e) =>
                              setAdmissionForm({
                                ...admissionForm,
                                previousSchool: e.target.value,
                              })
                            }
                            disabled={isSubmittingAdmission}
                            className="h-11 bg-white border-gray-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="additionalMessage"
                          className="text-sm font-medium text-gray-700"
                        >
                          Additional Message
                        </Label>
                        <Textarea
                          id="additionalMessage"
                          placeholder="Tell us about your child's interests, needs, or any questions…"
                          value={admissionForm.additionalMessage}
                          onChange={(e) =>
                            setAdmissionForm({
                              ...admissionForm,
                              additionalMessage: e.target.value,
                            })
                          }
                          rows={4}
                          disabled={isSubmittingAdmission}
                          className="bg-white border-gray-200 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingAdmission}
                        className="w-full h-12 rounded-xl bg-red-900 hover:bg-red-800 text-white font-semibold text-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                      >
                        {isSubmittingAdmission
                          ? 'Submitting…'
                          : 'Submit Inquiry'}
                      </button>
                    </form>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 sm:py-28 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-red-400 mb-3 block">
              Contact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              We'd love to hear from you.
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Have questions about our programs or admissions? Reach out and our
              team will be happy to help.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl">
            {[
              {
                Icon: Phone,
                title: 'Phone',
                lines: ['(02) 123-4567', '0917-123-4567'],
              },
              {
                Icon: Mail,
                title: 'Email',
                lines: [
                  'info@stonino-praga.edu.ph',
                  'admissions@stonino-praga.edu.ph',
                ],
              },
              {
                Icon: MapPin,
                title: 'Address',
                lines: ['123 Education Street', 'Manila, Philippines'],
              },
            ].map(({ Icon, title, lines }) => (
              <div
                key={title}
                className="bg-gray-900 rounded-2xl p-7 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-red-900/50 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">
                  {title}
                </p>
                {lines.map((line) => (
                  <p
                    key={line}
                    className="text-sm text-gray-300 leading-relaxed"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black border-t border-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="rounded-full opacity-80"
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  Sto. Niño de Praga Academy
                </p>
                <p className="text-xs text-gray-600">
                  Excellence in Education Since 1998
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 text-center sm:text-right">
              © {new Date().getFullYear()} Sto. Niño de Praga Academy. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
