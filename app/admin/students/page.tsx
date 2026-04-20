'use client';

import { AddressData, AddressSelector } from '@/components/ui/address-selector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Pagination } from '@/components/ui/data-table/Pagination';
import { SortHeader } from '@/components/ui/data-table/SortHeader';
import { useTableControls } from '@/hooks/use-table-controls';
import { useAlert } from '@/lib/use-alert';
import { useConfirm } from '@/lib/use-confirm';
import { Edit, Search, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  student_number: string;
  grade_level: string;
  section: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  barangay?: string;
  barangay_name?: string;
  street_details?: string;
  rfid?: string;
  status: string;
}

export default function StudentManagementPage() {
  const { admin, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    student_number: '',
    grade_level: '',
    section: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
    rfid: '',
  });
  const [newStudentAddress, setNewStudentAddress] = useState<AddressData>({
    barangay: '',
    barangayName: '',
    streetDetails: '',
  });
  const [editStudent, setEditStudent] = useState({
    id: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    student_number: '',
    grade_level: '',
    section: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
    rfid: '',
  });
  const [editStudentAddress, setEditStudentAddress] = useState<AddressData>({
    barangay: '',
    barangayName: '',
    streetDetails: '',
  });
  const [addingStudent, setAddingStudent] = useState(false);
  const [updatingStudent, setUpdatingStudent] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');
  const [sectionsByGrade, setSectionsByGrade] = useState<
    Record<string, string[]>
  >({});

  // Fetch sections defined in admin settings
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch('/api/admin/settings/sections');
        const data = await res.json();
        if (data.success && data.sections) {
          setSectionsByGrade(data.sections);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };
    fetchSections();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/students');
      const result = await response.json();
      if (result.success && result.students) {
        setStudents(result.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const tc = useTableControls(students, {
    searchFields: ['first_name', 'last_name', 'student_number', 'email'],
    defaultSort: { key: 'last_name', dir: 'asc' },
    pageSize: 25,
  });
  const gradeOptions = [...new Set(students.map((s) => s.grade_level).filter(Boolean))].sort();
  const statusOptions = [...new Set(students.map((s) => s.status).filter(Boolean))].sort();

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingStudent(true);
    setAddError('');

    try {
      const tempPassword = `SN${Math.random().toString(36).slice(-6)}`;

      // Combine address data into a single string
      const fullAddress = [
        newStudentAddress.streetDetails,
        newStudentAddress.barangayName,
        'Trece Martires City',
        'Cavite',
      ]
        .filter(Boolean)
        .join(', ');

      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStudent,
          password: tempPassword,
          address: fullAddress,
          barangay: newStudentAddress.barangay,
          barangay_name: newStudentAddress.barangayName,
          street_details: newStudentAddress.streetDetails,
        }),
      });

      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || 'Failed to add student');

      await fetchStudents();
      setNewStudent({
        first_name: '',
        last_name: '',
        middle_name: '',
        student_number: '',
        grade_level: '',
        section: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        address: '',
        rfid: '',
      });
      setNewStudentAddress({
        barangay: '',
        barangayName: '',
        streetDetails: '',
      });
      setShowAddDialog(false);

      showAlert({
        message: `Student added successfully!\n\nLogin Credentials:\nEmail: ${newStudent.email}\nPassword: ${tempPassword}\n\nPlease save these credentials!`,
        type: 'success',
      });
    } catch (error: any) {
      setAddError(error?.message || 'Failed to add student.');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStudent(true);
    setEditError('');

    try {
      // Combine address data into a single string
      const fullAddress = [
        editStudentAddress.streetDetails,
        editStudentAddress.barangayName,
        'Trece Martires City',
        'Cavite',
      ]
        .filter(Boolean)
        .join(', ');

      const response = await fetch(`/api/admin/students/${editStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editStudent,
          address: fullAddress,
          barangay: editStudentAddress.barangay,
          barangay_name: editStudentAddress.barangayName,
          street_details: editStudentAddress.streetDetails,
        }),
      });

      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || 'Failed to update student');

      await fetchStudents();
      setShowEditDialog(false);
      showAlert({ message: 'Student updated successfully!', type: 'success' });
    } catch (error: any) {
      setEditError(error?.message || 'Failed to update student.');
    } finally {
      setUpdatingStudent(false);
    }
  };

  const handleDeleteStudent = async (
    studentId: string,
    studentName: string
  ) => {
    const confirmed = await showConfirm({
      message: `Are you sure you want to delete ${studentName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) return;

    setDeletingStudent(true);
    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || 'Failed to delete student');

      await fetchStudents();
      showAlert({ message: 'Student deleted successfully!', type: 'success' });
    } catch (error: any) {
      showAlert({
        message: error?.message || 'Failed to delete student.',
        type: 'error',
      });
    } finally {
      setDeletingStudent(false);
    }
  };

  const openEditDialog = (student: Student) => {
    setEditStudent({
      id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      middle_name: student.middle_name || '',
      student_number: student.student_number,
      grade_level: student.grade_level,
      section: student.section || '',
      email: student.email,
      phone_number: student.phone_number || '',
      date_of_birth: student.date_of_birth || '',
      address: student.address || '',
      rfid: student.rfid || '',
    });
    setEditStudentAddress({
      barangay: student.barangay || '',
      barangayName: student.barangay_name || '',
      streetDetails: student.street_details || '',
    });
    setShowEditDialog(true);
  };

  const openViewSheet = (student: Student) => {
    setSelectedStudent(student);
    setShowViewSheet(true);
  };

  if (authLoading || !admin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-red-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Students</h1>
          <p className="text-xs text-gray-400 mt-0.5">{tc.filteredCount} of {tc.totalCount} records</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <UserPlus className="w-3.5 h-3.5" />
              Add Student
            </button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-red-800">
                  Add New Student
                </DialogTitle>
                <DialogDescription>
                  Enter student information to create a new account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={newStudent.first_name}
                      placeholder="Enter first name"
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          first_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={newStudent.last_name}
                      placeholder="Enter last name"
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          last_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Middle Name</Label>
                    <Input
                      value={newStudent.middle_name}
                      placeholder="Enter middle name"
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          middle_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Student Number *</Label>
                    <Input
                      value={newStudent.student_number}
                      placeholder="Enter student number"
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          student_number: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Grade Level *</Label>
                    <Select
                      value={newStudent.grade_level}
                      onValueChange={(value) =>
                        setNewStudent({
                          ...newStudent,
                          grade_level: value,
                          section: '',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kinder">Kinder</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                            Grade {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Section</Label>
                    <Select
                      value={newStudent.section}
                      onValueChange={(value) =>
                        setNewStudent({ ...newStudent, section: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {(sectionsByGrade[newStudent.grade_level] || []).map(
                          (sec) => (
                            <SelectItem key={sec} value={sec}>
                              {sec}
                            </SelectItem>
                          )
                        )}
                        {(!sectionsByGrade[newStudent.grade_level] ||
                          sectionsByGrade[newStudent.grade_level].length ===
                            0) && (
                          <SelectItem value="__none" disabled>
                            No sections for this grade level
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newStudent.email}
                      placeholder="Enter email"
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={newStudent.phone_number}
                      placeholder="09XXXXXXXXX"
                      inputMode="numeric"
                      maxLength={11}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          phone_number: e.target.value.replace(/\D/g, ''),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={newStudent.date_of_birth}
                      placeholder="Select date of birth"
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          date_of_birth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>RFID Card Number</Label>
                    <Input
                      value={newStudent.rfid}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, rfid: e.target.value })
                      }
                      placeholder="Enter RFID card number"
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <AddressSelector
                    value={newStudentAddress}
                    onChange={setNewStudentAddress}
                  />
                </div>
                {addError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                    {addError}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    disabled={addingStudent}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-red-800 hover:bg-red-700"
                    disabled={addingStudent}
                  >
                    {addingStudent ? 'Adding...' : 'Add Student'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-red-800">Edit Student</DialogTitle>
              <DialogDescription>Update student information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={editStudent.first_name}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        first_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={editStudent.last_name}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        last_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Middle Name</Label>
                  <Input
                    value={editStudent.middle_name}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        middle_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Student Number *</Label>
                  <Input
                    value={editStudent.student_number}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        student_number: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Grade Level *</Label>
                  <Select
                    value={editStudent.grade_level}
                    onValueChange={(value) =>
                      setEditStudent({
                        ...editStudent,
                        grade_level: value,
                        section: '',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kinder">Kinder</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                          Grade {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Section</Label>
                  <Select
                    value={editStudent.section}
                    onValueChange={(value) =>
                      setEditStudent({ ...editStudent, section: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {(sectionsByGrade[editStudent.grade_level] || []).map(
                        (sec) => (
                          <SelectItem key={sec} value={sec}>
                            {sec}
                          </SelectItem>
                        )
                      )}
                      {(!sectionsByGrade[editStudent.grade_level] ||
                        sectionsByGrade[editStudent.grade_level].length ===
                          0) && (
                        <SelectItem value="__none" disabled>
                          No sections for this grade level
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={editStudent.email}
                    onChange={(e) =>
                      setEditStudent({ ...editStudent, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={editStudent.phone_number}
                    placeholder="09XXXXXXXXX"
                    inputMode="numeric"
                    maxLength={11}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        phone_number: e.target.value.replace(/\D/g, ''),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={editStudent.date_of_birth}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        date_of_birth: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>RFID Card Number</Label>
                  <Input
                    value={editStudent.rfid}
                    onChange={(e) =>
                      setEditStudent({ ...editStudent, rfid: e.target.value })
                    }
                    placeholder="Enter RFID card number"
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <AddressSelector
                  value={editStudentAddress}
                  onChange={setEditStudentAddress}
                />
              </div>
              {editError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                  {editError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={updatingStudent}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-800 hover:bg-red-700"
                  disabled={updatingStudent}
                >
                  {updatingStudent ? 'Updating...' : 'Update Student'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Sheet */}
        <Sheet open={showViewSheet} onOpenChange={setShowViewSheet}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-lg overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle className="text-red-800">Student Details</SheetTitle>
              <SheetDescription>
                View complete student information
              </SheetDescription>
            </SheetHeader>
            {selectedStudent && (
              <div className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="pb-3 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Full Name
                    </h3>
                    <p className="text-base font-semibold">
                      {`${selectedStudent.first_name} ${selectedStudent.middle_name || ''} ${selectedStudent.last_name}`.trim()}
                    </p>
                  </div>
                  <div className="pb-3 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Student Number
                    </h3>
                    <p className="text-base font-mono">
                      {selectedStudent.student_number}
                    </p>
                  </div>
                  <div className="pb-3 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Grade Level
                    </h3>
                    <p className="text-base">{selectedStudent.grade_level}</p>
                  </div>
                  <div className="pb-3 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Section
                    </h3>
                    <p className="text-base">
                      {selectedStudent.section || 'N/A'}
                    </p>
                  </div>
                  <div className="pb-3 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Email
                    </h3>
                    <p className="text-base">{selectedStudent.email}</p>
                  </div>
                  <div className="pb-3 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Phone Number
                    </h3>
                    <p className="text-base">
                      {selectedStudent.phone_number || 'N/A'}
                    </p>
                  </div>
                  <div className="pb-3 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Date of Birth
                    </h3>
                    <p className="text-base">
                      {selectedStudent.date_of_birth || 'N/A'}
                    </p>
                  </div>
                  <div className="pb-3 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      RFID Card
                    </h3>
                    {selectedStudent.rfid ? (
                      <div className="space-y-1">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Assigned
                        </Badge>
                        <p className="text-sm text-gray-600 font-mono">
                          {selectedStudent.rfid}
                        </p>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-600"
                      >
                        Not Assigned
                      </Badge>
                    )}
                  </div>
                  <div className="pb-3 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Status
                    </h3>
                    <Badge className="bg-green-100 text-green-800">
                      {selectedStudent.status}
                    </Badge>
                  </div>
                  <div className="pb-3 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Address
                    </h3>
                    <p className="text-base">
                      {selectedStudent.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

        {/* Table toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students…"
              value={tc.search}
              onChange={(e) => tc.setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-colors placeholder:text-gray-400"
            />
          </div>
          <select
            value={tc.filters['grade_level'] ?? ''}
            onChange={(e) => tc.setFilter('grade_level', e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
          >
            <option value="">All Grades</option>
            {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={tc.filters['status'] ?? ''}
            onChange={(e) => tc.setFilter('status', e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(tc.search || tc.filters['grade_level'] || tc.filters['status']) && (
            <button
              onClick={tc.clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Student No.</th>
                  <SortHeader label="Name"   sortKey="last_name"     currentSort={tc.sort} onSort={tc.toggleSort} />
                  <SortHeader label="Grade"  sortKey="grade_level"   currentSort={tc.sort} onSort={tc.toggleSort} />
                  <SortHeader label="Section" sortKey="section"      currentSort={tc.sort} onSort={tc.toggleSort} />
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">RFID</th>
                  <SortHeader label="Email"  sortKey="email"         currentSort={tc.sort} onSort={tc.toggleSort} />
                  <SortHeader label="Status" sortKey="status"        currentSort={tc.sort} onSort={tc.toggleSort} />
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tc.rows.length > 0 ? tc.rows.map((student) => {
                  return (
                    <tr
                      key={student.id}
                      onClick={() => openViewSheet(student)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono text-[12px] text-gray-500 whitespace-nowrap">
                        {student.student_number}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[13px] font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">
                        {student.grade_level || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">
                        {student.section || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {student.rfid ? (
                          <span className="font-mono text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded">
                            {student.rfid}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-500 whitespace-nowrap">
                        {student.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          {student.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditDialog(student)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id, `${student.first_name} ${student.last_name}`)}
                            disabled={deletingStudent}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          page={tc.page}
          pageCount={tc.pageCount}
          totalCount={tc.totalCount}
          filteredCount={tc.filteredCount}
          pageSize={tc.pageSize}
          onPageChange={tc.setPage}
          onPageSizeChange={tc.setPageSize}
        />
      </div>
    </div>
  );
}
