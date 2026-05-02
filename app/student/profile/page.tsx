'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Hash, Layers, Mail, MapPin, Phone, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStudentAuth } from '../hooks/useStudentAuth';

export default function ProfilePage() {
  const { student, isLoading } = useStudentAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
  });

  const displayName = useMemo(() => {
    if (!student) return 'Student';
    if (student.first_name && student.last_name)
      return `${student.first_name} ${student.last_name}`;
    return student.email?.split('@')[0] || 'Student';
  }, [student]);

  const avatarLetters = useMemo(() =>
    displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase(),
  [displayName]);

  const handleEdit = () => {
    if (!student) return;
    setForm({
      first_name:   student.first_name  || '',
      last_name:    student.last_name   || '',
      middle_name:  student.middle_name || '',
      phone_number: student.phone_number || student.phone || student.contact_number || '',
      date_of_birth: student.date_of_birth || '',
      address:      student.address     || '',
    });
    setError('');
    setEditing(true);
  };

  const handleCancel = () => { setEditing(false); setError(''); };

  const handleSave = async () => {
    if (!student) return;
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First name and last name are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/student/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, ...form }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Failed to save.');

      // Sync localStorage
      const stored = localStorage.getItem('student');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('student', JSON.stringify({ ...parsed, ...form }));
      }
      setEditing(false);
      // Reload to reflect updated name
      window.location.reload();
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  if (!student) return null;

  const gradeSection = [student.grade_level, student.section].filter(Boolean).join(' — ');

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">

      {/* Avatar + Name */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-700/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-blue-700">{avatarLetters}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 capitalize">{displayName.toLowerCase()}</h2>
            {(student.student_id || student.student_number) && (
              <p className="text-sm text-gray-400 mt-0.5">#{student.student_id || student.student_number}</p>
            )}
            {gradeSection && (
              <span className="inline-flex items-center mt-1.5 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                {gradeSection}
              </span>
            )}
          </div>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={handleEdit}>Edit Profile</Button>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Personal Information</p>
          <p className="text-xs text-gray-400 mt-0.5">Your student profile and contact details</p>
        </div>

        {editing ? (
          <div className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>First Name</Label>
                <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div>
                <Label required>Last Name</Label>
                <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Middle Name</Label>
              <Input value={form.middle_name} onChange={(e) => setForm({ ...form, middle_name: e.target.value })} placeholder="Optional" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={form.phone_number}
                placeholder="09XXXXXXXXX"
                inputMode="numeric"
                maxLength={11}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value.replace(/\D/g, '') })}
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, Barangay, City" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-gray-800 text-white">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-5 divide-y divide-gray-100">
            {[
              { icon: User,         label: 'Full Name',      value: displayName },
              { icon: Hash,         label: 'Student Number', value: student.student_id || student.student_number },
              { icon: GraduationCap, label: 'Grade Level',   value: student.grade_level },
              { icon: Layers,       label: 'Section',        value: student.section },
              { icon: Mail,         label: 'Email',          value: student.email },
              { icon: Phone,        label: 'Contact Number', value: student.phone_number || student.phone || student.contact_number },
              { icon: MapPin,       label: 'Address',        value: student.address },
            ].map(({ icon: Icon, label, value }) =>
              value ? (
                <div key={label} className="flex items-start gap-3 py-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
