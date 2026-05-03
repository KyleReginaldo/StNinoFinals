'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Mail, MapPin, MessageSquare, Phone, RefreshCw, Save, Settings as SettingsIcon, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SystemSettings {
  schoolName: string;
  academicYear: string;
  automaticBackup: boolean;
  rfidIntegration: boolean;
  emailNotifications: boolean;
  studentPortal: boolean;
  teacherPortal: boolean;
  phone: string;
  contactEmail: string;
  address: string;
  officeHours: string;
}

type StringSettingKey = 'schoolName' | 'phone' | 'contactEmail' | 'address' | 'officeHours';
type BoolSettingKey =
  | 'automaticBackup'
  | 'rfidIntegration'
  | 'emailNotifications'
  | 'studentPortal'
  | 'teacherPortal';

const TOGGLES: { label: string; field: BoolSettingKey; description: string }[] = [
  { label: 'Automatic Backup',    field: 'automaticBackup',    description: 'Daily off-site backups and retention'    },
  { label: 'RFID Integration',    field: 'rfidIntegration',    description: 'Use RFID readers for attendance'         },
  { label: 'Email Notifications', field: 'emailNotifications', description: 'Send alerts to guardians and staff'      },
  { label: 'Student Portal',      field: 'studentPortal',      description: 'Allow students to view their records'    },
  { label: 'Teacher Portal',      field: 'teacherPortal',      description: 'Enable teacher dashboard and tools'      },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 ${
        checked ? 'bg-gray-900' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function FeedbackLine({ ok, msg }: { ok: boolean; msg: string }) {
  return (
    <p className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-red-500'}`}>
      {ok
        ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
        : <XCircle    className="w-3.5 h-3.5 shrink-0" />}
      {msg}
    </p>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    schoolName: 'Sto Niño de Praga Academy',
    academicYear: '2024-2025',
    automaticBackup: true,
    rfidIntegration: true,
    emailNotifications: true,
    studentPortal: true,
    teacherPortal: true,
    phone: '',
    contactEmail: '',
    address: '',
    officeHours: '',
  });
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saveFeedback, setSaveFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [testSmsPhone, setTestSmsPhone] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) setSettings(data.settings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  const handleInputChange = (field: StringSettingKey, value: string) =>
    setSettings(prev => ({ ...prev, [field]: value }));

  const handleToggle = (field: BoolSettingKey) =>
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));

  const handleSave = async () => {
    setSaving(true);
    setSaveFeedback(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      const ok = !!data.success;
      setSaveFeedback({ ok, msg: ok ? 'Settings saved successfully.' : 'Error saving settings. Please try again.' });
      if (ok) setTimeout(() => setSaveFeedback(null), 3000);
    } catch {
      setSaveFeedback({ ok: false, msg: 'Error saving settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSms = async () => {
    if (!testSmsPhone.trim()) return;
    setSendingSms(true);
    setSmsFeedback(null);
    try {
      const res = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testSmsPhone.trim() }),
      });
      const data = await res.json();
      setSmsFeedback(data.success
        ? { ok: true,  msg: `Sent to ${data.sentTo}` }
        : { ok: false, msg: data.error || 'Failed to send SMS' });
    } catch (err: any) {
      setSmsFeedback({ ok: false, msg: err?.message || 'Network error' });
    } finally {
      setSendingSms(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress.trim()) return;
    setSendingEmail(true);
    setEmailFeedback(null);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmailAddress.trim() }),
      });
      const data = await res.json();
      setEmailFeedback(data.success
        ? { ok: true,  msg: `Email sent to ${testEmailAddress}` }
        : { ok: false, msg: data.error || 'Failed to send email' });
    } catch (err: any) {
      setEmailFeedback({ ok: false, msg: err?.message || 'Network error' });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            System Settings
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Global preferences and integrations for your school system
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveFeedback && <FeedbackLine ok={saveFeedback.ok} msg={saveFeedback.msg} />}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-900 hover:bg-gray-800 text-white shrink-0"
          >
            {saving
              ? <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />Saving…</>
              : <><Save className="w-3.5 h-3.5 mr-2" />Save Settings</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* School Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">School Information</p>
            <p className="text-xs text-gray-400 mt-0.5">Basic school configuration settings</p>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="schoolName" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                School Name
              </label>
              <input
                id="schoolName"
                value={settings.schoolName}
                onChange={e => handleInputChange('schoolName', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Academic Year
              </label>
              <div className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                {settings.academicYear}
                <span className="ml-auto text-[10px] text-gray-400 font-medium uppercase tracking-wide">Auto-calculated</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">System Configuration</p>
            <p className="text-xs text-gray-400 mt-0.5">Enable or disable system features</p>
          </div>
          <div className="divide-y divide-gray-100">
            {TOGGLES.map(item => (
              <div key={item.field} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                </div>
                <Toggle
                  checked={settings[item.field] as boolean}
                  onChange={() => handleToggle(item.field)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Contact Information</p>
          <p className="text-xs text-gray-400 mt-0.5">Displayed on the public landing page</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 py-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <Phone className="w-3 h-3" /> Phone
            </label>
            <input
              value={settings.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              placeholder="e.g. (02) 123-4567"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <Mail className="w-3 h-3" /> Contact Email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={e => handleInputChange('contactEmail', e.target.value)}
              placeholder="e.g. info@school.edu.ph"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <MapPin className="w-3 h-3" /> Address
            </label>
            <input
              value={settings.address}
              onChange={e => handleInputChange('address', e.target.value)}
              placeholder="e.g. 123 Education St, Manila"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <Clock className="w-3 h-3" /> Office Hours
            </label>
            <input
              value={settings.officeHours}
              onChange={e => handleInputChange('officeHours', e.target.value)}
              placeholder="e.g. Mon–Fri, 7:00 AM – 5:00 PM"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Test Notifications</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Verify SMS and email integrations are working without needing an RFID scan or user creation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Test SMS */}
          <div className="px-5 py-5 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">Test SMS <span className="text-xs font-normal text-gray-400 ml-1">via TextBee</span></p>
            </div>
            <p className="text-xs text-gray-400">
              Sends a test message to confirm the device is online and the API key is valid.
            </p>
            <div className="flex gap-2">
              <input
                placeholder="09XXXXXXXXX"
                value={testSmsPhone}
                onChange={e => { setTestSmsPhone(e.target.value); setSmsFeedback(null); }}
                onKeyDown={e => e.key === 'Enter' && handleTestSms()}
                className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white font-mono"
              />
              <Button
                onClick={handleTestSms}
                disabled={sendingSms || !testSmsPhone.trim()}
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white shrink-0"
              >
                {sendingSms
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : 'Send'}
              </Button>
            </div>
            {smsFeedback && <FeedbackLine ok={smsFeedback.ok} msg={smsFeedback.msg} />}
          </div>

          {/* Test Email */}
          <div className="px-5 py-5 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">Test Email <span className="text-xs font-normal text-gray-400 ml-1">via SMTP</span></p>
            </div>
            <p className="text-xs text-gray-400">
              Sends a test email via the configured Gmail SMTP account to confirm credentials and connectivity.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="test@example.com"
                value={testEmailAddress}
                onChange={e => { setTestEmailAddress(e.target.value); setEmailFeedback(null); }}
                onKeyDown={e => e.key === 'Enter' && handleTestEmail()}
                className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
              />
              <Button
                onClick={handleTestEmail}
                disabled={sendingEmail || !testEmailAddress.trim()}
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white shrink-0"
              >
                {sendingEmail
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : 'Send'}
              </Button>
            </div>
            {emailFeedback && <FeedbackLine ok={emailFeedback.ok} msg={emailFeedback.msg} />}
          </div>
        </div>
      </div>
    </div>
  );
}
