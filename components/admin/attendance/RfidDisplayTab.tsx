'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { useAlert } from '@/lib/use-alert';
import { LogIn, LogOut, Radio, RefreshCcw, User } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  gradeLevel: string;
  section: string;
  scanTime: string;
  status: string;
  rfidCard: string;
  studentPhoto?: string;
  scanType?: 'timein' | 'timeout' | null;
  timeIn?: string | null;
  timeOut?: string | null;
  isTeacher?: boolean;
  subject?: string;
  role?: string;
}

type FilterType = 'all' | 'timein' | 'timeout';

export function RfidDisplayTab() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [latestScan, setLatestScan] = useState<AttendanceRecord | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timeoutModeActive, setTimeoutModeActive] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(0);
  const { showAlert } = useAlert();

  const fetchLiveAttendance = useCallback(
    async (onlyNew = false) => {
      setLoadingAttendance(true);
      try {
        const url =
          onlyNew && lastScanTime
            ? `/api/admin/attendance-live?since=${encodeURIComponent(lastScanTime)}&limit=1`
            : `/api/admin/attendance-live?limit=1`;

        const response = await fetch(url);
        if (!response.ok) return;

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return;

        const result = await response.json();

        if (result.success && result.records && result.records.length > 0) {
          const latest = result.records[0];

          setLatestScan((prevLatest) => {
            const isNewScan =
              !prevLatest ||
              latest.id !== prevLatest.id ||
              latest.scanTime !== prevLatest.scanTime;
            return isNewScan ? latest : prevLatest;
          });

          setAttendanceRecords((prev) => {
            const exists = prev.some((p) => p.id === latest.id);
            if (exists) {
              return prev.map((p) => (p.id === latest.id ? latest : p));
            } else {
              return [latest, ...prev].slice(0, 50);
            }
          });

          setLastScanTime(latest.scanTime);
        }
      } catch (error) {
        console.error('Error fetching live attendance:', error);
      } finally {
        setLoadingAttendance(false);
      }
    },
    [lastScanTime]
  );

  useEffect(() => {
    fetchLiveAttendance(false);
  }, [fetchLiveAttendance]);

  useEffect(() => {
    if (latestScan) {
      const clearTimer = setTimeout(() => {
        setLatestScan(null);
      }, 10000);
      return () => clearTimeout(clearTimer);
    }
  }, [latestScan]);

  useEffect(() => {
    const channel = supabase
      .channel('rfid-attendance-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance_records' },
        () => {
          fetchLiveAttendance(false);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLiveAttendance]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveAttendance(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchLiveAttendance]);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const enableTimeoutMode = async () => {
    try {
      const response = await fetch('/api/admin/attendance-live', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable-timeout' }),
      });
      const result = await response.json();

      if (result.success) {
        setTimeoutModeActive(true);
        setTimeoutCountdown(5);
        const countdownInterval = setInterval(() => {
          setTimeoutCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setTimeoutModeActive(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        showAlert({
          message: 'Failed to enable timeout mode. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error enabling timeout mode:', error);
      showAlert({
        message: 'Error enabling timeout mode. Please try again.',
        type: 'error',
      });
    }
  };

  const filteredRecords = useMemo(() => {
    if (filterType === 'all') return attendanceRecords;
    return attendanceRecords.filter((record) => record.scanType === filterType);
  }, [attendanceRecords, filterType]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Radio className="w-8 h-8 text-red-500" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              RFID Scan Display
            </h2>
            <p className="text-sm md:text-base text-gray-400">
              Live attendance monitoring
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Filter Toggle */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
            <Button
              variant={filterType === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('all')}
              className={
                filterType === 'all'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }
            >
              All
            </Button>
            <Button
              variant={filterType === 'timein' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('timein')}
              className={
                filterType === 'timein'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }
            >
              <LogIn className="w-4 h-4 mr-1" />
              Time In
            </Button>
            <Button
              variant={filterType === 'timeout' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('timeout')}
              className={
                filterType === 'timeout'
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }
            >
              <LogOut className="w-4 h-4 mr-1" />
              Time Out
            </Button>
          </div>
          <div className="text-center md:text-right w-full md:w-auto">
            <div className="text-sm text-gray-400">Last Updated</div>
            <div
              className="text-lg md:text-xl font-semibold"
              suppressHydrationWarning
            >
              {currentTime || '--:--:--'}
            </div>
          </div>
          <Button
            onClick={enableTimeoutMode}
            disabled={timeoutModeActive}
            className={`${timeoutModeActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white font-bold px-4 py-2 shadow-lg w-full md:w-auto`}
          >
            <LogOut className="w-5 h-5 mr-2" />
            {timeoutModeActive
              ? `Time Out Mode: ${timeoutCountdown}s`
              : 'Record Time Out (5s)'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLiveAttendance(false)}
            disabled={loadingAttendance}
            className="border-gray-700 bg-gray-600 text-white hover:bg-gray-800 w-full md:w-auto"
          >
            <RefreshCcw
              className={`w-4 h-4 mr-2 ${loadingAttendance ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Latest Scan Display */}
      {latestScan ? (
        <Card className="mb-6 border-4 border-red-500 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl animate-pulse">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex-shrink-0">
                {latestScan.studentPhoto ? (
                  <Image
                    src={latestScan.studentPhoto}
                    alt={latestScan.studentName || 'Person'}
                    width={200}
                    height={200}
                    className="rounded-full border-4 border-red-500 shadow-2xl object-cover w-40 h-40 md:w-[200px] md:h-[200px]"
                  />
                ) : (
                  <div className="w-40 h-40 md:w-[200px] md:h-[200px] rounded-full border-4 border-red-500 bg-gray-700 flex items-center justify-center shadow-2xl">
                    <User className="w-16 h-16 md:w-24 md:h-24 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="mb-4 md:mb-6">
                  <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">
                    Name
                  </div>
                  <div className="text-3xl md:text-5xl font-bold text-white">
                    {latestScan.studentName || 'Unknown'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                  {!latestScan.isTeacher && (
                    <>
                      <div>
                        <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">
                          Grade Level
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white">
                          {latestScan.gradeLevel || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">
                          Section
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white">
                          {latestScan.section || 'N/A'}
                        </div>
                      </div>
                    </>
                  )}
                  {latestScan.isTeacher && (
                    <div className="col-span-1 sm:col-span-2">
                      <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">
                        Subject
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-white">
                        {latestScan.subject || 'N/A'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">
                      Date
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {formatDate(latestScan.scanTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">
                      Time
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {formatTime(latestScan.scanTime)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-6">
                  <Badge
                    className={
                      latestScan.scanType === 'timein'
                        ? 'bg-green-600 text-white text-lg md:text-xl px-4 py-2'
                        : latestScan.scanType === 'timeout'
                          ? 'bg-orange-600 text-white text-lg md:text-xl px-4 py-2'
                          : 'bg-gray-600 text-white text-lg md:text-xl px-4 py-2'
                    }
                  >
                    {latestScan.scanType === 'timein'
                      ? 'TIME IN'
                      : latestScan.scanType === 'timeout'
                        ? 'TIME OUT'
                        : 'SCAN RECORDED'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="py-20">
            <div className="text-center text-gray-400">
              <Radio className="w-24 h-24 mx-auto mb-6 opacity-50" />
              <p className="text-2xl">Waiting for RFID scan...</p>
              <p className="text-sm mt-2">
                Scan an RFID card to see the latest attendance record
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records count note */}
      {filteredRecords.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {filteredRecords.length} record
          {filteredRecords.length !== 1 ? 's' : ''} loaded • Real-time updates
          via Supabase
        </p>
      )}
    </div>
  );
}
