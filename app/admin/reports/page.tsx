"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, Filter, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useAuth } from "../hooks/useAuth"

const COLORS = ['#7A0C0C', '#B91C1C', '#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#991B1B', '#450A0A', '#7F1D1D', '#A21C1C', '#C53030']

export default function ReportsPage() {
  const { admin, loading } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isFiltered, setIsFiltered] = useState(false)

  const fetchStats = async (start?: string, end?: string) => {
    setDataLoading(true)
    try {
      const params = new URLSearchParams()
      if (start) params.set('startDate', start)
      if (end) params.set('endDate', end)
      const res = await fetch(`/api/admin/stats?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleApplyFilter = () => {
    if (!startDate && !endDate) return
    fetchStats(startDate, endDate)
    setIsFiltered(true)
  }

  const handleClearFilter = () => {
    setStartDate('')
    setEndDate('')
    setIsFiltered(false)
    fetchStats()
  }

  if (loading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-800 border-t-transparent"></div>
          <p className="mt-4 text-red-800 font-medium">Loading Reports...</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const gradeData = stats?.gradeDistribution
    ? Object.entries(stats.gradeDistribution)
        .map(([grade, count]) => ({ name: grade, count: count as number }))
        .sort((a, b) => {
          const numA = parseInt(a.name.replace(/\D/g, '')) || 0
          const numB = parseInt(b.name.replace(/\D/g, '')) || 0
          return numA - numB
        })
    : []

  const sectionData: { name: string; count: number }[] = []
  if (stats?.sectionDistribution) {
    for (const [grade, sections] of Object.entries(stats.sectionDistribution)) {
      for (const [section, count] of Object.entries(sections as Record<string, number>)) {
        sectionData.push({ name: `${grade} - ${section}`, count })
      }
    }
    sectionData.sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-red-800 mb-1">Reports & Analytics</h2>
            <p className="text-gray-600">Student population distribution by grade level and section</p>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Date Range Filter
            </CardTitle>
            <CardDescription>
              Filter analytics by enrollment date and attendance period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="w-full sm:w-auto">
                <Label htmlFor="startDate" className="text-xs text-gray-500">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-44"
                />
              </div>
              <div className="w-full sm:w-auto">
                <Label htmlFor="endDate" className="text-xs text-gray-500">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-44"
                />
              </div>
              <Button
                onClick={handleApplyFilter}
                disabled={!startDate && !endDate}
                className="bg-red-800 hover:bg-red-700 w-full sm:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>
              {isFiltered && (
                <Button
                  onClick={handleClearFilter}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
            {isFiltered && (
              <p className="text-xs text-red-700 mt-2 bg-red-50 px-3 py-1.5 rounded-md inline-block">
                Showing data from {startDate || '...'} to {endDate || '...'} | {stats?.filteredStudents || 0} students enrolled in this period
              </p>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-800">{stats?.totalStudents || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-800">{stats?.totalTeachers || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Total Teachers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-800">{stats?.attendanceRate || 0}%</p>
                <p className="text-sm text-gray-500 mt-1">{isFiltered ? 'Attendance Rate' : "Today's Attendance"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-800">{stats?.attendanceCount || 0}</p>
                <p className="text-sm text-gray-500 mt-1">{isFiltered ? 'Students Attended' : 'Attended Today'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {dataLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-800 border-t-transparent"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Population per Grade Level */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Population per Grade Level
                </CardTitle>
                <CardDescription>
                  {isFiltered
                    ? `Students enrolled between ${startDate || '...'} and ${endDate || '...'}`
                    : 'Total number of students enrolled in each grade level'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gradeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={gradeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        formatter={(value: number) => [`${value} students`, 'Count']}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {gradeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>{isFiltered ? 'No students enrolled in this period' : 'No student data available yet'}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Population per Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Population per Section
                </CardTitle>
                <CardDescription>
                  {isFiltered
                    ? `Students per section enrolled between ${startDate || '...'} and ${endDate || '...'}`
                    : 'Number of students in each section across all grade levels'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sectionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(350, sectionData.length * 35)}>
                    <BarChart data={sectionData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        formatter={(value: number) => [`${value} students`, 'Count']}
                      />
                      <Bar dataKey="count" fill="#7A0C0C" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>{isFiltered ? 'No section data for this period' : 'No section data available yet'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
