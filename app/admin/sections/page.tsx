'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAlert } from '@/lib/use-alert';
import { Layers, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const GRADE_LEVELS = [
  'Kinder',
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

export default function SectionsPage() {
  const [sectionsByGrade, setSectionsByGrade] = useState<
    Record<string, string[]>
  >({});
  const [selectedGrade, setSelectedGrade] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    const loadSections = async () => {
      try {
        const res = await fetch('/api/admin/settings/sections');
        const data = await res.json();
        if (data.success && data.sections) {
          setSectionsByGrade(data.sections);
        }
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
    setSectionsByGrade((prev) => {
      const existing = prev[selectedGrade] || [];
      if (existing.includes(name)) {
        showAlert({ message: 'This section already exists for this grade.', type: 'error' });
        return prev;
      }
      return { ...prev, [selectedGrade]: [...existing, name].sort() };
    });
    setNewSectionName('');
  };

  const handleRemoveSection = (grade: string, section: string) => {
    setSectionsByGrade((prev) => {
      const updated = (prev[grade] || []).filter((s) => s !== section);
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

  const totalSections = Object.values(sectionsByGrade).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const gradesWithSections = Object.keys(sectionsByGrade).filter(
    (g) => sectionsByGrade[g].length > 0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-800 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Layers className="w-8 h-8 text-red-800" />
              Manage Sections
            </h2>
            <p className="text-gray-600 mt-1">
              Define available sections for each grade level
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {totalSections} section{totalSections !== 1 ? 's' : ''} across{' '}
              {gradesWithSections.length} grade
              {gradesWithSections.length !== 1 ? 's' : ''}
            </Badge>
            <Button
              className="bg-red-800 hover:bg-red-700"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Add Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-800">Add New Section</CardTitle>
            <CardDescription>
              Select a grade level and enter a section name to add it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Section name (e.g. St. Mary, Section A)"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                className="flex-1"
              />
              <Button
                onClick={handleAddSection}
                disabled={!selectedGrade || !newSectionName.trim()}
                className="bg-red-800 hover:bg-red-700 shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sections List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-800">Sections by Grade Level</CardTitle>
            <CardDescription>
              Click the trash icon to remove a section. Don't forget to save after making changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {GRADE_LEVELS.filter(
              (g) => (sectionsByGrade[g] || []).length > 0
            ).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Layers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No sections defined yet</p>
                <p className="text-sm mt-1">
                  Use the form above to add sections for each grade level
                </p>
              </div>
            ) : (
              GRADE_LEVELS.filter(
                (g) => (sectionsByGrade[g] || []).length > 0
              ).map((grade) => (
                <div
                  key={grade}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{grade}</h4>
                    <Badge variant="outline" className="text-xs">
                      {sectionsByGrade[grade].length} section
                      {sectionsByGrade[grade].length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sectionsByGrade[grade].map((section) => (
                      <span
                        key={section}
                        className="inline-flex items-center gap-2 bg-red-50 text-red-800 text-sm pl-3 pr-1.5 py-1.5 rounded-full border border-red-200 group"
                      >
                        {section}
                        <button
                          onClick={() =>
                            handleRemoveSection(grade, section)
                          }
                          className="p-0.5 rounded-full hover:bg-red-200 transition-colors"
                          title={`Remove ${section}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
