'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  MessageSquare,
  Save,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useState } from 'react';

interface SystemSettings {
  schoolName: string;
  academicYear: string;
  automaticBackup: boolean;
  rfidIntegration: boolean;
  emailNotifications: boolean;
  studentPortal: boolean;
  teacherPortal: boolean;
}

type StringSettingKey = 'schoolName' | 'academicYear';
type BoolSettingKey =
  | 'automaticBackup'
  | 'rfidIntegration'
  | 'emailNotifications'
  | 'studentPortal'
  | 'teacherPortal';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    schoolName: 'Sto Niño de Praga Academy',
    academicYear: '2024-2025',
    automaticBackup: true,
    rfidIntegration: true,
    emailNotifications: true,
    studentPortal: true,
    teacherPortal: true,
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // --- Test notifications state ---
  const [testSmsPhone, setTestSmsPhone] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  const handleInputChange = (field: StringSettingKey, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field: BoolSettingKey) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
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
      if (data.success) {
        setSmsFeedback({
          ok: true,
          msg: `SMS sent successfully to ${data.sentTo}`,
        });
      } else {
        setSmsFeedback({ ok: false, msg: data.error || 'Failed to send SMS' });
      }
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
      if (data.success) {
        setEmailFeedback({
          ok: true,
          msg: `Test email sent to ${testEmailAddress}`,
        });
      } else {
        setEmailFeedback({
          ok: false,
          msg: data.error || 'Failed to send email',
        });
      }
    } catch (err: any) {
      setEmailFeedback({ ok: false, msg: err?.message || 'Network error' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setFeedback('Settings saved successfully!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 mt-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SettingsIcon className="w-10 h-10 text-red-800" />
          <div>
            <h2 className="text-3xl font-bold text-red-800">System Settings</h2>
            <p className="text-gray-600">
              Global preferences and integrations for your school system
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Changes apply after saving — review before submitting
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-800">School Information</CardTitle>
            <CardDescription>
              Basic school configuration settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={settings.schoolName}
                onChange={(e) =>
                  handleInputChange('schoolName', e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                value={settings.academicYear}
                onChange={(e) =>
                  handleInputChange('academicYear', e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-800">System Configuration</CardTitle>
            <CardDescription>Enable or disable system features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  label: 'Automatic Backup',
                  field: 'automaticBackup' as BoolSettingKey,
                  description: 'Daily off-site backups and retention',
                },
                {
                  label: 'RFID Integration',
                  field: 'rfidIntegration' as BoolSettingKey,
                  description: 'Use RFID readers for attendance',
                },
                {
                  label: 'Email Notifications',
                  field: 'emailNotifications' as BoolSettingKey,
                  description: 'Send alerts to guardians and staff',
                },
                {
                  label: 'Student Portal Access',
                  field: 'studentPortal' as BoolSettingKey,
                  description: 'Allow students to view records',
                },
                {
                  label: 'Teacher Portal Access',
                  field: 'teacherPortal' as BoolSettingKey,
                  description: 'Enable teacher dashboard and tools',
                },
              ].map((item) => (
                <div
                  key={String(item.field)}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    aria-label={item.label}
                    className="h-5 w-5 rounded border-gray-300 text-red-700 focus:ring-red-500 cursor-pointer"
                    checked={settings[item.field] as boolean}
                    onChange={() => handleToggle(item.field)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {feedback && (
        <div
          className={`text-sm p-3 rounded-md ${
            feedback.includes('Error')
              ? 'text-red-700 bg-red-50 border border-red-100'
              : 'text-green-700 bg-green-50 border border-green-100'
          }`}
        >
          {feedback}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          className="bg-red-800 hover:bg-red-700 w-full sm:w-auto"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* ── Test Notifications ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-800">Test Notifications</CardTitle>
          <CardDescription>
            Verify that SMS and email integrations are working without needing
            an RFID scan or user creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test SMS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium text-gray-800">
              <MessageSquare className="w-4 h-4 text-red-800" />
              Test SMS (TextBee)
            </div>
            <p className="text-xs text-gray-500">
              Sends a test message via TextBee to confirm the device is online
              and the API key is valid.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="09XXXXXXXXX"
                value={testSmsPhone}
                onChange={(e) => setTestSmsPhone(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleTestSms}
                disabled={sendingSms || !testSmsPhone.trim()}
                className="bg-red-800 hover:bg-red-700 shrink-0"
              >
                {sendingSms ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
            {smsFeedback && (
              <p
                className={`text-sm p-2 rounded ${
                  smsFeedback.ok
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {smsFeedback.msg}
              </p>
            )}
          </div>

          {/* Test Email */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium text-gray-800">
              <Mail className="w-4 h-4 text-red-800" />
              Test Email (SMTP)
            </div>
            <p className="text-xs text-gray-500">
              Sends a test email via the configured Gmail SMTP account to
              confirm credentials and connectivity.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleTestEmail}
                disabled={sendingEmail || !testEmailAddress.trim()}
                className="bg-red-800 hover:bg-red-700 shrink-0"
              >
                {sendingEmail ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
            {emailFeedback && (
              <p
                className={`text-sm p-2 rounded ${
                  emailFeedback.ok
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {emailFeedback.msg}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
