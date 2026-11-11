'use client';

import { SchoolYearTabs } from '@/components/admin/school-year-tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GRADE_LEVELS, normalizeGradeLevel } from '@/lib/grade-levels';
import { useRefresh } from '@/lib/refresh-context';
import { SHS_STRANDS } from '@/lib/school-year';
import { useAlert } from '@/lib/use-alert';
import { Archive, ArchiveRestore, Loader2, Plus, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';


// ─── Batch Enroll Modal ───────────────────────────────────────────────────────

interface EligibleStudent {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel: string | null;
}

function BatchEnrollModal({
  section,
  open,
  onClose,
  onEnrolled,
}: {
  section: SectionRow | null;
  open: boolean;
  onClose: () => void;
  onEnrolled: () => void;
}) {
  const { showAlert } = useAlert();
  const [students, setStudents] = useState<EligibleStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  // Client: only the section's grade level by default; other grades only on purpose
  const [otherGrades, setOtherGrades] = useState(false);

  useEffect(() => {
    if (!open || !section) return;
    setSelected(new Set());
    setSearch('');
    setOtherGrades(false);
    setLoading(true);
    fetch(`/api/admin/sections/eligible-students?sectionId=${section.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStudents(d.students ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, section]);

  const sameGrade = (s: EligibleStudent) =>
    normalizeGradeLevel(s.gradeLevel) === normalizeGradeLevel(section?.grade_level);
  const otherGradeCount = students.filter((s) => !sameGrade(s)).length;
  const filtered = students.filter((s) => {
    if (!otherGrades && !sameGrade(s)) return false;
    const q = search.toLowerCase();
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const allSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.studentId));
  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s.studentId));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.add(s.studentId));
        return next;
      });
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEnroll = async () => {
    if (!section || selected.size === 0) return;
    setEnrolling(true);
    try {
      const res = await fetch('/api/admin/sections/batch-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: section.id,
          studentIds: Array.from(selected),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert({ message: data.message, type: 'success' });
        onEnrolled();
        onClose();
      } else {
        showAlert({
          message: data.error ?? 'Failed to enroll students.',
          type: 'error',
        });
      }
    } catch {
      showAlert({ message: 'Network error.', type: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-gray-700" />
            Batch Enroll Students
          </DialogTitle>
        </DialogHeader>

        {section && (
          <p className="text-sm text-gray-500 -mt-2">
            Assigning to{' '}
            <span className="font-semibold text-gray-800">{section.name}</span>
            {' · '}{section.grade_level}{' · '}{section.school_year}
            {' · '}
            <span className={
              section.student_count >= section.max_capacity
                ? 'text-red-500 font-medium'
                : 'text-gray-500'
            }>
              {section.student_count}/{section.max_capacity} slots
            </span>
          </p>
        )}

        <input
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {otherGradeCount > 0 && (
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none -mt-1">
            <input
              type="checkbox"
              checked={otherGrades}
              onChange={(e) => {
                setOtherGrades(e.target.checked);
                setSelected(new Set()); // never enroll someone you can't see
              }}
              className="rounded border-gray-300"
            />
            Also show students from other grade levels ({otherGradeCount})
          </label>
        )}

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              {students.length === 0 || (!otherGrades && students.every((s) => !sameGrade(s)))
                ? `No ${section?.grade_level ?? ''} students without a section.`
                : 'No students match your search.'}
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {/* Select all row */}
              <label className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100 cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Select all ({filtered.length})
                </span>
              </label>
              {filtered.map((s) => (
                <label
                  key={s.studentId}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(s.studentId)}
                    onChange={() => toggle(s.studentId)}
                    className="rounded border-gray-300"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {s.firstName} {s.lastName}
                      </p>
                      {s.gradeLevel && (
                        <span className="shrink-0 text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                          {s.gradeLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={enrolling}>
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={enrolling || selected.size === 0}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {enrolling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Enrolling…
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Enroll {selected.size > 0 ? `${selected.size} ` : ''}Student
                {selected.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Formal sections per school year (sections table) ────────────────────────

interface SectionRow {
  id: string;
  name: string;
  grade_level: string;
  school_year: string;
  strand?: string | null;
  max_capacity: number;
  student_count: number;
  class_count: number;
}

// Click the number to change a section's capacity (can't go below its current students)
function CapacityCell({ section, onSaved }: { section: SectionRow; onSaved: (capacity: number) => void }) {
  const { showAlert } = useAlert();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(section.max_capacity));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const capacity = Number(value);
    if (capacity === section.max_capacity) return setEditing(false);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: section.id, max_capacity: capacity }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onSaved(capacity);
      setEditing(false);
    } catch (e: any) {
      showAlert({ message: e?.message || 'We could not save the new capacity.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => { setValue(String(section.max_capacity)); setEditing(true); }}
        className="px-2 py-0.5 rounded hover:bg-gray-100 underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
        title="Change capacity"
        aria-label={`Capacity ${section.max_capacity}, click to change`}
      >
        {section.max_capacity}
      </button>
    );
  }
  return (
    <input
      type="number"
      min={Math.max(1, section.student_count)}
      autoFocus
      disabled={saving}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') setEditing(false);
      }}
      className="w-16 px-1.5 py-0.5 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      aria-label="Section capacity"
    />
  );
}

function FormalSectionsPanel() {
  const [schoolYear, setSchoolYear] = useState('');
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Record<string, string[]>>({});
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [batchSection, setBatchSection] = useState<SectionRow | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [archiving, setArchiving] = useState<string | null>(null);

  // Add section form
  const [addGrade, setAddGrade] = useState('');
  const [addName, setAddName] = useState('');
  const [addCapacity, setAddCapacity] = useState('45');
  const [addStrand, setAddStrand] = useState('');
  const addIsSHS = addGrade === 'Grade 11' || addGrade === 'Grade 12';
  const [adding, setAdding] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  const { showAlert } = useAlert();
  const { refreshKey } = useRefresh();

  useEffect(() => {
    // School year defaults to the active one via SchoolYearTabs
    // Load templates for "Import from template" button
    fetch('/api/admin/settings/sections')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTemplates(d.sections ?? {});
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSections = async (sy: string, archived: boolean) => {
    if (!sy) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/sections?schoolYear=${encodeURIComponent(sy)}${archived ? '&archived=true' : ''}`
      );
      const data = await res.json();
      if (data.success) setSections(data.sections ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolYear) loadSections(schoolYear, showArchived);
  }, [schoolYear, showArchived, refreshKey]);

  const handleArchive = async (id: string, name: string) => {
    setArchiving(id);
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: false }),
      });
      const data = await res.json();
      if (data.success) {
        setSections((prev) => prev.filter((s) => s.id !== id));
        showAlert({ message: `Archived section "${name}".`, type: 'success' });
      } else {
        showAlert({ message: data.error || 'Failed to archive.', type: 'error' });
      }
    } catch {
      showAlert({ message: 'Network error.', type: 'error' });
    } finally {
      setArchiving(null);
    }
  };

  const handleRestoreSection = async (id: string, name: string) => {
    setArchiving(id);
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: true }),
      });
      const data = await res.json();
      if (data.success) {
        setSections((prev) => prev.filter((s) => s.id !== id));
        showAlert({ message: `Restored section "${name}".`, type: 'success' });
      } else {
        showAlert({ message: data.error || 'Failed to restore.', type: 'error' });
      }
    } catch {
      showAlert({ message: 'Network error.', type: 'error' });
    } finally {
      setArchiving(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/sections?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSections((prev) => prev.filter((s) => s.id !== id));
        showAlert({ message: `Removed section "${name}".`, type: 'success' });
      } else {
        showAlert({
          message: data.error || 'Failed to delete.',
          type: 'error',
        });
      }
    } catch {
      showAlert({ message: 'Network error.', type: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const handleAdd = async () => {
    if (!addGrade || !addName.trim() || !schoolYear || (addIsSHS && !addStrand)) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName.trim(),
          gradeLevel: addGrade,
          strand: addIsSHS ? addStrand : null,
          schoolYear,
          maxCapacity: parseInt(addCapacity) || 45,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSections((prev) => [...prev, data.section]);
        setAddName('');
        setShowAddSection(false);
        showAlert({
          message: `Section "${data.section.name}" created.`,
          type: 'success',
        });
      } else {
        showAlert({
          message: data.error || 'Failed to create.',
          type: 'error',
        });
      }
    } catch {
      showAlert({ message: 'Network error.', type: 'error' });
    } finally {
      setAdding(false);
    }
  };

  const handleImportFromTemplate = async () => {
    if (!schoolYear) return;
    const toCreate: { grade: string; name: string }[] = [];
    for (const [grade, names] of Object.entries(templates)) {
      for (const name of names) {
        // Skip if already exists
        if (!sections.some((s) => s.grade_level === grade && s.name === name)) {
          toCreate.push({ grade, name });
        }
      }
    }
    if (toCreate.length === 0) {
      showAlert({
        message: 'All template sections already exist for this school year.',
        type: 'info',
      });
      return;
    }
    setImporting(true);
    let created = 0;
    for (const { grade, name } of toCreate) {
      try {
        const res = await fetch('/api/admin/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            gradeLevel: grade,
            schoolYear,
            maxCapacity: 45,
          }),
        });
        const data = await res.json();
        if (data.success) created++;
      } catch {
        // continue
      }
    }
    setImporting(false);
    showAlert({
      message: `Imported ${created} section${created !== 1 ? 's' : ''} from templates.`,
      type: 'success',
    });
    loadSections(schoolYear, showArchived);
  };

  const grouped = GRADE_LEVELS.reduce<Record<string, SectionRow[]>>(
    (acc, g) => {
      acc[g] = sections.filter((s) => s.grade_level === g);
      return acc;
    },
    {}
  );

  const hasTemplates = Object.values(templates).some((a) => a.length > 0);
  const gradesWithSections = GRADE_LEVELS.filter((g) => grouped[g].length > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Sections {showArchived && <span className="text-xs font-normal text-amber-600 ml-1">(Archived)</span>}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            These are the actual Sections that students get enrolled into. Each
            section spans all quarters and tracks enrollment capacity.
          </p>
        </div>
        <button
          onClick={() => setShowArchived((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border shrink-0 active:scale-[0.97] transition-[background-color,border-color,color,transform] duration-150 ease-out ${showArchived ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          {showArchived ? 'View Active' : 'View Archived'}
        </button>
      </div>

      {/* Controls row */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 space-y-3">
        <SchoolYearTabs value={schoolYear} onChange={setSchoolYear} allowAll={false} />

        {!showArchived && (
          <div className="flex justify-end border-t border-gray-100 pt-3">
            <Button
              size="sm"
              onClick={() => setShowAddSection(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Section
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>New section for school year {schoolYear}.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label required>Grade Level</Label>
              <Select value={addGrade} onValueChange={setAddGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {addIsSHS ? (
              <div className="space-y-2">
                <Label required>Strand</Label>
                <Select value={addStrand} onValueChange={setAddStrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strand" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHS_STRANDS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div />
            )}
            <div className="space-y-2">
              <Label htmlFor="sectionName" required>Section Name</Label>
              <Input
                id="sectionName"
                placeholder="e.g. Rizal"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sectionCapacity">Capacity</Label>
              <Input
                id="sectionCapacity"
                type="number"
                min={1}
                value={addCapacity}
                onChange={(e) => setAddCapacity(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddSection(false)} disabled={adding}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={adding || !addGrade || !addName.trim() || (addIsSHS && !addStrand)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {adding && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
              Save Section
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sections table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : gradesWithSections.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            {showArchived
              ? `No archived sections for ${schoolYear}.`
              : `No sections for ${schoolYear} yet.`}
            {!showArchived && hasTemplates && (
              <span>
                {' '}
                Use &ldquo;Import from templates&rdquo; to create them
                automatically.
              </span>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[770px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-40">
                  Grade
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-24">
                  Enrolled
                </th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-24">
                  Capacity
                </th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-20">
                  Classes
                </th>
                <th className="px-4 py-2.5 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gradesWithSections.flatMap((grade) =>
                grouped[grade].map((sec, i) => (
                  <tr key={sec.id} className="hover:bg-gray-50">
                    <td className="px-5 py-2.5 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {i === 0 ? grade : ''}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-800">
                      {sec.name}
                      {sec.strand && (
                        <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                          {sec.strand}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm tabular-nums">
                      <span
                        className={
                          sec.student_count >= sec.max_capacity
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-700'
                        }
                      >
                        {sec.student_count}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm text-gray-500 tabular-nums">
                      <CapacityCell
                        section={sec}
                        onSaved={(cap) => setSections((prev) => prev.map((x) => (x.id === sec.id ? { ...x, max_capacity: cap } : x)))}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm text-gray-500 tabular-nums">
                      {sec.class_count}
                    </td>
                    <td className="px-4 py-2.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {showArchived ? (
                          <button
                            onClick={() => handleRestoreSection(sec.id, sec.name)}
                            disabled={archiving === sec.id}
                            title={`Restore ${sec.name}`}
                            className="p-1 rounded text-green-600 hover:text-green-700 hover:bg-green-50 active:scale-90 transition-[color,background-color,transform] duration-150 ease-out disabled:opacity-30"
                          >
                            {archiving === sec.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setBatchSection(sec)}
                              title={`Batch enroll students into ${sec.name}`}
                              className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 active:scale-90 transition-[color,background-color,transform] duration-150 ease-out"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleArchive(sec.id, sec.name)}
                              disabled={archiving === sec.id || sec.student_count > 0}
                              title={
                                sec.student_count > 0
                                  ? 'Cannot archive — students are enrolled'
                                  : `Archive ${sec.name}`
                              }
                              className="p-1 rounded text-gray-300 hover:text-amber-600 hover:bg-amber-50 active:scale-90 transition-[color,background-color,transform] duration-150 ease-out disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {archiving === sec.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Archive className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDelete(sec.id, sec.name)}
                              disabled={
                                deleting === sec.id || sec.student_count > 0
                              }
                              title={
                                sec.student_count > 0
                                  ? 'Cannot delete — students are enrolled'
                                  : `Delete ${sec.name}`
                              }
                              className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-[color,background-color,transform] duration-150 ease-out disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {deleting === sec.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        )}
        <div className="px-5 py-2.5 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">
            {sections.length} section{sections.length !== 1 ? 's' : ''} for{' '}
            {schoolYear}
          </span>
        </div>
      </div>

      <BatchEnrollModal
        section={batchSection}
        open={!!batchSection}
        onClose={() => setBatchSection(null)}
        onEnrolled={() => loadSections(schoolYear, showArchived)}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SectionsPage() {
  return (
    <div className="p-4 md:p-6">
      <FormalSectionsPanel />
    </div>
  );
}
