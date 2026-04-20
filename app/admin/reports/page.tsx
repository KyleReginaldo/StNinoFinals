"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Filter, X } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useAuth } from "../hooks/useAuth"

const GRADE_COLORS = [
  '#1d4ed8', '#7c3aed', '#059669', '#d97706',
  '#dc2626', '#0369a1', '#4f46e5', '#be185d',
  '#15803d', '#b45309', '#6d28d9', '#0e7490',
]

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
      if (data.success) setStats(data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" />
      </div>
    )
  }

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
        sectionData.push({ name: `${grade} — ${section}`, count })
      }
    }
    sectionData.sort((a, b) => a.name.localeCompare(b.name))
  }

  const summaryCards = [
    { label: 'Total Students',  value: stats?.totalStudents  ?? 0 },
    { label: 'Total Teachers',  value: stats?.totalTeachers  ?? 0 },
    { label: isFiltered ? 'Attendance Rate'     : "Today's Attendance", value: `${stats?.attendanceRate ?? 0}%` },
    { label: isFiltered ? 'Students Attended'   : 'Attended Today',     value: stats?.attendanceCount ?? 0 },
  ]

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Reports & Analytics
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Student population distribution by grade level and section
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="block px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="block px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
            />
          </div>
          <Button
            onClick={handleApplyFilter}
            disabled={!startDate && !endDate}
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            Apply
          </Button>
          {isFiltered && (
            <Button onClick={handleClearFilter} variant="outline" size="sm">
              <X className="w-3.5 h-3.5 mr-1.5" />
              Clear
            </Button>
          )}
        </div>
        {isFiltered && (
          <p className="text-xs text-gray-500 px-3 py-1.5 bg-gray-50 rounded-lg inline-block">
            Showing data from <span className="font-medium">{startDate || '...'}</span> to{' '}
            <span className="font-medium">{endDate || '...'}</span>
            {' · '}
            <span className="font-medium">{stats?.filteredStudents ?? 0}</span> students enrolled in this period
          </p>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {dataLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Population per Grade Level */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                Population per Grade Level
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isFiltered
                  ? `Students enrolled between ${startDate || '...'} and ${endDate || '...'}`
                  : 'Total number of students enrolled in each grade level'}
              </p>
            </div>
            <div className="p-5">
              {gradeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={gradeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                      formatter={(value: number) => [`${value} students`, 'Count']}
                      cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {gradeData.map((_, i) => (
                        <Cell key={i} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="w-10 h-10 mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    {isFiltered ? 'No students enrolled in this period' : 'No student data available yet'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Population per Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                Population per Section
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isFiltered
                  ? `Students per section enrolled between ${startDate || '...'} and ${endDate || '...'}`
                  : 'Number of students in each section across all grade levels'}
              </p>
            </div>
            <div className="p-5">
              {sectionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(320, sectionData.length * 36)}>
                  <BarChart
                    data={sectionData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, bottom: 5, left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      width={120}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                      formatter={(value: number) => [`${value} students`, 'Count']}
                      cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    />
                    <Bar dataKey="count" fill="#1d4ed8" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="w-10 h-10 mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    {isFiltered ? 'No section data for this period' : 'No section data available yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
