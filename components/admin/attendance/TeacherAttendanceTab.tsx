'use client';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCircle2, Download, RefreshCw, UserCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Teacher {
  teacherId: string;
  teacherName: string;
  subject: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  dailyAttendance: Record<string, string>;
  records: any[];
}
interface TeacherAttendanceData {
  general: { totalTeachers: number; totalPresent: number; totalAbsent: number; totalDays: number; presentPercentage: number; absentPercentage: number };
  teachers: Teacher[];
  selectedTeacher: Teacher | null;
  dateRange: { start: string; end: string };
}

const CODE_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PR: { label: 'Present',  bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  AC: { label: 'Absent',   bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'     },
  LA: { label: 'Late',     bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  HO: { label: 'Holiday',  bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400'    },
  VA: { label: 'Vacation', bg: 'bg-sky-100',     text: 'text-sky-700',     dot: 'bg-sky-400'     },
  CR: { label: 'Credit',   bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-400'  },
  EA: { label: 'Early Abs',bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-500'  },
  SU: { label: 'Suspended',bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-700'    },
};
const getMeta = (code: string) => CODE_META[code] ?? { label: code, bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' };
const initials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

export function TeacherAttendanceTab() {
  const [data, setData] = useState<TeacherAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const end = new Date(); const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (startDate) p.append('startDate', startDate);
      if (endDate)   p.append('endDate', endDate);
      if (selectedTeacherId) p.append('teacherId', selectedTeacherId);
      const res = await fetch(`/api/admin/teacher-attendance?${p.toString()}`);
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
        if (!selectedTeacherId && result.data.teachers.length > 0)
          setSelectedTeacherId(result.data.teachers[0].teacherId);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (startDate && endDate) fetchData(); }, [startDate, endDate, selectedTeacherId]);

  const selectedTeacher = useMemo(() => {
    if (!data || !selectedTeacherId) return null;
    return data.teachers.find((t) => t.teacherId === selectedTeacherId) || data.selectedTeacher;
  }, [data, selectedTeacherId]);

  const dateColumns = useMemo(() => {
    if (!data) return [];
    const dates: string[] = [];
    const start = new Date(data.dateRange.start);
    const end   = new Date(data.dateRange.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1))
      dates.push(new Date(d).toISOString().split('T')[0]);
    return dates;
  }, [data]);

  const exportCSV = () => {
    if (!data?.teachers.length) return;
    const rows = [
      ['#','Name','Subject','Days','Present','Absent','Late','%',...dateColumns.map((d)=>format(new Date(d),'MM/dd'))],
      ...data.teachers.map((t,i)=>[String(i+1),t.teacherName,t.subject||'N/A',String(t.totalDays),String(t.present),String(t.absent),String(t.late),`${t.percentage}%`,...dateColumns.map((d)=>t.dailyAttendance[d]||'-')]),
    ];
    const csv=rows.map((r)=>r.map((c)=>`"${c.replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    a.download=`teacher-attendance-${startDate}-to-${endDate}.csv`;
    a.style.visibility='hidden'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-red-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Loading teacher attendance…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">From</label>
          <input
            type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="h-8 text-xs px-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-red-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">To</label>
          <input
            type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="h-8 text-xs px-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-red-700"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50">
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />Refresh
          </button>
          {data?.teachers.length ? (
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-800 hover:bg-red-900 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" />Export CSV
            </button>
          ) : null}
        </div>
      </div>

      {/* Empty */}
      {!data || data.teachers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-600">No teacher attendance data</p>
          <p className="text-xs text-gray-400 mt-1">Teachers appear here once they scan their RFID cards.</p>
        </div>
      ) : (
        <>
          {/* ── KPI + Detail ──────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Stats + Bar chart */}
            <div className="xl:col-span-2 space-y-5">
              {/* KPI */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label:'Teachers',    value: data.general.totalTeachers,             icon: UserCheck,    color:'text-blue-600',    iconBg:'bg-blue-50',    bar:null },
                  { label:'Present Rate',value:`${data.general.presentPercentage.toFixed(1)}%`, icon: CheckCircle2, color:'text-emerald-600', iconBg:'bg-emerald-50', bar:data.general.presentPercentage, barColor:'bg-emerald-500' },
                  { label:'Absent Rate', value:`${data.general.absentPercentage.toFixed(1)}%`,  icon: XCircle,      color:'text-red-600',     iconBg:'bg-red-50',     bar:data.general.absentPercentage,  barColor:'bg-red-500'     },
                  { label:'Total Days',  value: data.general.totalDays,                 icon: CheckCircle2, color:'text-gray-700',    iconBg:'bg-gray-100',   bar:null },
                ].map(({ label, value, icon: Icon, color, iconBg, bar, barColor }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
                      <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center', iconBg)}>
                        <Icon className={cn('w-3.5 h-3.5', color)} />
                      </div>
                    </div>
                    <p className={cn('text-3xl font-bold leading-none', color)}>{value}</p>
                    {bar !== null && bar !== undefined && (
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div className={cn('h-1.5 rounded-full', barColor)} style={{ width: `${bar}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">Attendance Rate by Teacher</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Top {Math.min(data.teachers.length, 10)} teachers</p>
                </div>
                <div className="p-5 space-y-3">
                  {data.teachers.slice().sort((a,b)=>b.percentage-a.percentage).slice(0,10).map((t)=>(
                    <div key={t.teacherId} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-800 flex-shrink-0">{initials(t.teacherName)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-gray-700 truncate">{t.teacherName}</p>
                          <span className={cn('text-xs font-bold ml-2 flex-shrink-0',t.percentage>=90?'text-emerald-600':t.percentage>=75?'text-amber-600':'text-red-600')}>{t.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={cn('h-2 rounded-full transition-all duration-700',t.percentage>=90?'bg-emerald-500':t.percentage>=75?'bg-amber-500':'bg-red-500')}
                            style={{ width: `${t.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Teacher Detail */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Teacher Detail</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Select a teacher to inspect</p>
              </div>
              <div className="p-5 space-y-4">
                {/* Teacher select */}
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-red-700 bg-white"
                >
                  {data.teachers.map((t) => (
                    <option key={t.teacherId} value={t.teacherId}>{t.teacherName}</option>
                  ))}
                </select>

                {selectedTeacher && (
                  <>
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-sm font-bold text-red-800 flex-shrink-0">{initials(selectedTeacher.teacherName)}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{selectedTeacher.teacherName}</p>
                        <p className="text-xs text-gray-400">{selectedTeacher.subject || 'No subject'}</p>
                      </div>
                    </div>

                    {/* Mini KPIs */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {l:'Days',    v:selectedTeacher.totalDays,  c:'text-gray-800'},
                        {l:'Present', v:selectedTeacher.present,    c:'text-emerald-600'},
                        {l:'Absent',  v:selectedTeacher.absent,     c:'text-red-600'},
                        {l:'Late',    v:selectedTeacher.late,       c:'text-amber-600'},
                      ].map(({l,v,c})=>(
                        <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-gray-400 mb-0.5">{l}</p>
                          <p className={cn('text-lg font-bold leading-none',c)}>{v}</p>
                        </div>
                      ))}
                    </div>

                    {/* Rate bar */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium">Attendance Rate</span>
                        <span className={cn('text-sm font-bold',selectedTeacher.percentage>=90?'text-emerald-600':selectedTeacher.percentage>=75?'text-amber-600':'text-red-600')}>{selectedTeacher.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={cn('h-2 rounded-full transition-all duration-700',selectedTeacher.percentage>=90?'bg-emerald-500':selectedTeacher.percentage>=75?'bg-amber-500':'bg-red-500')} style={{width:`${selectedTeacher.percentage}%`}} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Daily Table ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 flex-wrap">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Daily Attendance Records</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">{data.teachers.length} teacher{data.teachers.length!==1?'s':''} · {dateColumns.length} days</p>
              </div>
              <div className="ml-auto hidden lg:flex items-center gap-3">
                {(['PR','AC','LA','HO'] as const).map((code)=>{
                  const m=getMeta(code);
                  return (
                    <div key={code} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <div className={cn('w-2 h-2 rounded-full',m.dot)} />{m.label}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="text-left pl-6 pr-3 py-3 font-semibold text-gray-400 w-10 sticky left-0 bg-gray-50/70 z-10">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 min-w-[200px] sticky left-10 bg-gray-50/70 z-10 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]">Teacher</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-400">Days</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-400">Present</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-400">Rate</th>
                    {dateColumns.map((d)=>(
                      <th key={d} className="text-center px-1 py-3 font-semibold text-gray-400 min-w-[48px]">
                        <div className="text-[10px] font-bold">{format(new Date(d),'EEE')}</div>
                        <div className="text-[10px] text-gray-300 font-normal">{format(new Date(d),'M/d')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.teachers.map((t, i) => (
                    <tr key={t.teacherId}
                      className={cn('border-b border-gray-50 transition-colors cursor-pointer',
                        selectedTeacherId===t.teacherId?'bg-red-50/70 hover:bg-red-50':'hover:bg-gray-50/80'
                      )}
                      onClick={()=>setSelectedTeacherId(t.teacherId)}
                    >
                      <td className={cn('pl-6 pr-3 py-3 text-gray-300 font-medium sticky left-0 z-10',selectedTeacherId===t.teacherId?'bg-red-50/70':'bg-white')}>{i+1}</td>
                      <td className={cn('px-4 py-3 sticky left-10 z-10 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]',selectedTeacherId===t.teacherId?'bg-red-50/70':'bg-white')}>
                        <div className="flex items-center gap-2.5">
                          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',selectedTeacherId===t.teacherId?'bg-red-200 text-red-800':'bg-gray-100 text-gray-600')}>{initials(t.teacherName)}</div>
                          <div>
                            <p className="font-semibold text-gray-800 whitespace-nowrap">{t.teacherName}</p>
                            <p className="text-gray-400 text-[10px] leading-none mt-0.5">{t.subject||'—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">{t.totalDays}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{t.present}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',t.percentage>=90?'bg-emerald-100 text-emerald-700':t.percentage>=75?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700')}>{t.percentage}%</span>
                      </td>
                      {dateColumns.map((d)=>{
                        const code=t.dailyAttendance[d]||'-';
                        const m=getMeta(code);
                        return (
                          <td key={d} className="px-1 py-3 text-center">
                            {code!=='-'
                              ? <span title={m.label} className={cn('inline-flex items-center justify-center w-8 h-5 rounded text-[10px] font-bold',m.bg,m.text)}>{code}</span>
                              : <span className="text-gray-200">–</span>
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
