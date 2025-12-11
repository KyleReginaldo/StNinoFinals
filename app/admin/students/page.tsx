"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Filter, Search, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"

interface Student {
  id: string
  first_name: string
  last_name: string
  student_number: string
  grade_level: string
  section: string
  email: string
  status: string
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    student_number: "",
    grade_level: "",
    section: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
  })
  const [addingStudent, setAddingStudent] = useState(false)
  const [addError, setAddError] = useState("")

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/students")
      const result = await response.json()
      if (result.success && result.students) {
        setStudents(result.students)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filteredStudents = students.filter((student) =>
    `${student.first_name} ${student.last_name} ${student.student_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingStudent(true)
    setAddError("")

    try {
      // Generate temporary password
      const tempPassword = `Student${Math.random().toString(36).slice(-8)}${Math.floor(Math.random() * 100)}`

      // Call API to create student
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: newStudent.first_name,
          last_name: newStudent.last_name,
          middle_name: newStudent.middle_name,
          student_number: newStudent.student_number,
          grade_level: newStudent.grade_level,
          section: newStudent.section,
          email: newStudent.email,
          phone_number: newStudent.phone_number,
          date_of_birth: newStudent.date_of_birth,
          address: newStudent.address,
          password: tempPassword,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to add student")
      }

      // Refresh student list
      await fetchStudents()

      // Save credentials for display
      const credentials = {
        email: newStudent.email,
        password: tempPassword,
      }

      // Reset form and close dialog
      setNewStudent({
        first_name: "",
        last_name: "",
        middle_name: "",
        student_number: "",
        grade_level: "",
        section: "",
        email: "",
        phone_number: "",
        date_of_birth: "",
        address: "",
      })
      setShowAddDialog(false)

      // Show success message with credentials
      alert(
        `Student added successfully!\n\n` +
        `Login Credentials:\n` +
        `Email: ${credentials.email}\n` +
        `Password: ${credentials.password}\n\n` +
        `Please save these credentials and provide them to the student!`
      )
    } catch (error: any) {
      console.error("Error adding student:", error)
      setAddError(error?.message || "Failed to add student. Please try again.")
    } finally {
      setAddingStudent(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-red-800">Student Management</h2>
          <p className="text-gray-600">Manage student records and information</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-800 hover:bg-red-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-red-800">Add New Student</DialogTitle>
              <DialogDescription>Enter student information to create a new account</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    value={newStudent.middle_name}
                    onChange={(e) => setNewStudent({ ...newStudent, middle_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="student_number">Student Number *</Label>
                  <Input
                    id="student_number"
                    value={newStudent.student_number}
                    onChange={(e) => setNewStudent({ ...newStudent, student_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grade_level">Grade Level *</Label>
                  <Select
                    value={newStudent.grade_level}
                    onValueChange={(value) => setNewStudent({ ...newStudent, grade_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grade 1">Grade 1</SelectItem>
                      <SelectItem value="Grade 2">Grade 2</SelectItem>
                      <SelectItem value="Grade 3">Grade 3</SelectItem>
                      <SelectItem value="Grade 4">Grade 4</SelectItem>
                      <SelectItem value="Grade 5">Grade 5</SelectItem>
                      <SelectItem value="Grade 6">Grade 6</SelectItem>
                      <SelectItem value="Grade 7">Grade 7</SelectItem>
                      <SelectItem value="Grade 8">Grade 8</SelectItem>
                      <SelectItem value="Grade 9">Grade 9</SelectItem>
                      <SelectItem value="Grade 10">Grade 10</SelectItem>
                      <SelectItem value="Grade 11">Grade 11</SelectItem>
                      <SelectItem value="Grade 12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={newStudent.phone_number}
                    onChange={(e) => setNewStudent({ ...newStudent, phone_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  />
                </div>
              </div>

              {addError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{addError}</div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={addingStudent}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-800 hover:bg-red-700" disabled={addingStudent}>
                  {addingStudent ? "Adding..." : "Add Student"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-800">All Students</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading students...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_number}</TableCell>
                      <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                      <TableCell>{student.grade_level || "N/A"}</TableCell>
                      <TableCell>{student.section || "N/A"}</TableCell>
                      <TableCell>{student.email || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {student.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
