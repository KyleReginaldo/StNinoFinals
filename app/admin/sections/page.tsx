'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAlert } from '@/lib/use-alert';
import { Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const GRADE_LEVELS = [
  'Kinder',
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

export default function SectionsPage() {
  const [sectionsByGrade, setSectionsByGrade] = useState<Record<string, string[]>>({});
  const [selectedGrade, setSelectedGrade] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const loadSections = async () => {
      try {
        const res = await fetch('/api/admin/settings/sections');
        const data = await res.json();
        if (data.success && data.sections) setSectionsByGrade(data.sections);
      } catch (error) {
        console.error('Error loading sections:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, []);

  const handleAddSection = () => {
    if (!selectedGrade || !newSectionName.trim()) return;
    const name = newSectionName.trim();
    const existing = sectionsByGrade[selectedGrade] || [];
    if (existing.map(s => s.toLowerCase()).includes(name.toLowerCase())) {
      setAddError(`"${name}" already exists in ${selectedGrade}.`);
      return;
    }
    setAddError(null);
    setSectionsByGrade(prev => ({
      ...prev,
      [selectedGrade]: [...(prev[selectedGrade] || []), name].sort(),
    }));
    setNewSectionName('');
  };

  const handleRemoveSection = (grade: string, section: string) => {
    setSectionsByGrade(prev => {
      const updated = (prev[grade] || []).filter(s => s !== section);
      if (updated.length === 0) {
        const { [grade]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [grade]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: sectionsByGrade }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert({ message: 'Sections saved successfully!', type: 'success' });
      } else {
        showAlert({ message: 'Failed to save sections.', type: 'error' });
      }
    } catch {
      showAlert({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const totalSections = Object.values(sectionsByGrade).reduce((sum, arr) => sum + arr.length, 0);
  const gradesWithSections = Object.keys(sectionsByGrade).filter(g => sectionsByGrade[g].length > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Add Section + Save */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedGrade} onValueChange={v => { setSelectedGrade(v); setAddError(null); }}>
            <SelectTrigger className="w-full sm:w-48 h-8 text-sm">
              <SelectValue placeholder="Grade level" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_LEVELS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex-1 space-y-1">
            <input
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                addError
                  ? 'border-red-400 focus:ring-red-400/20 text-red-900 placeholder:text-red-300'
                  : 'border-gray-200 focus:ring-gray-900/10'
              }`}
              placeholder="Section name (e.g. St. Mary, Section A)"
              value={newSectionName}
              onChange={e => { setNewSectionName(e.target.value); setAddError(null); }}
              onKeyDown={e => e.key === 'Enter' && handleAddSection()}
            />
            {addError && (
              <p className="text-xs text-red-500">{addError}</p>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddSection}
            disabled={!selectedGrade || !newSectionName.trim()}
            className="bg-gray-900 hover:bg-gray-800 text-white shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            variant="outline"
            className="shrink-0"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Sections Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-44">
                Grade Level
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Sections
              </th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-20 pr-5">
                Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {GRADE_LEVELS.map(grade => {
              const sections = sectionsByGrade[grade] || [];
              return (
                <tr key={grade} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900 align-top whitespace-nowrap">
                    {grade}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {sections.length === 0 ? (
                      <span className="text-gray-300 text-sm">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {sections.map(section => (
                          <span
                            key={section}
                            className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 pl-2.5 pr-1.5 py-1 rounded-full"
                          >
                            {section}
                            <button
                              onClick={() => handleRemoveSection(grade, section)}
                              title={`Remove ${section}`}
                              className="rounded-full p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-300 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 pr-5 text-right align-top">
                    {sections.length > 0 ? (
                      <span className="text-xs font-medium text-gray-500 tabular-nums">
                        {sections.length}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-5 py-2.5 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">
            {totalSections} section{totalSections !== 1 ? 's' : ''} across {gradesWithSections} grade level{gradesWithSections !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
