'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAlert } from '@/lib/use-alert';
import { BookOpen, ChevronDownIcon, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

interface Teacher {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

export default function TeacherJournal() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState({
    date: '',
    subject: '',
    topic: '',
    activities: '',
    notes: '',
  });
  const { showAlert } = useAlert();

  // Check if teacher is logged in
  useEffect(() => {
    const storedTeacher = localStorage.getItem('teacher');
    if (!storedTeacher) {
      router.push('/teacher/login');
      return;
    }

    try {
      const teacherData = JSON.parse(storedTeacher);
      setTeacher(teacherData);
    } catch (error) {
      console.error('Error parsing stored teacher data:', error);
      localStorage.removeItem('teacher');
      router.push('/teacher/login');
    }
  }, [router]);

  // Fetch journal entries
  useEffect(() => {
    if (teacher && teacher.id) {
      fetchJournalEntries();
    }
  }, [teacher]);

  const fetchJournalEntries = async () => {
    if (!teacher || !teacher.id) return;

    try {
      const response = await fetch(
        `/api/teacher/journal?teacherId=${teacher.id}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setJournalEntries(data.data);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacher || !teacher.id) {
      showAlert({ message: 'Teacher information not found', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/teacher/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...journalEntry,
          teacherId: teacher.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert({
          message: 'Journal entry saved successfully!',
          type: 'success',
        });
        setShowAddJournal(false);
        setJournalEntry({
          date: '',
          subject: '',
          topic: '',
          activities: '',
          notes: '',
        });
        // Refresh journal entries
        fetchJournalEntries();
      } else {
        showAlert({
          message:
            data.error || 'Failed to save journal entry. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Journal submission error:', error);
      showAlert({
        message: 'Error saving journal entry. Please try again.',
        type: 'error',
      });
    }
  };

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-red-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-red-800">Teaching Journal</CardTitle>
            <CardDescription>
              Record your daily teaching activities and observations
            </CardDescription>
          </div>
          <Dialog open={showAddJournal} onOpenChange={setShowAddJournal}>
            <DialogTrigger asChild>
              <Button className="bg-red-800 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Journal Entry</DialogTitle>
                <DialogDescription>
                  Record your teaching activities for today
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleJournalSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="journal-date">Date</Label>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="journal-date"
                          className="justify-between font-normal"
                          type="button"
                        >
                          {journalEntry.date
                            ? new Date(journalEntry.date).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )
                            : 'Select date'}
                          <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0 z-[9999]"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={
                            journalEntry.date
                              ? new Date(journalEntry.date)
                              : undefined
                          }
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(
                                date.getMonth() + 1
                              ).padStart(2, '0');
                              const day = String(date.getDate()).padStart(
                                2,
                                '0'
                              );
                              setJournalEntry({
                                ...journalEntry,
                                date: `${year}-${month}-${day}`,
                              });
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      onValueChange={(value) =>
                        setJournalEntry({
                          ...journalEntry,
                          subject: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="filipino">Filipino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="topic">Topic/Lesson</Label>
                  <Input
                    id="topic"
                    value={journalEntry.topic}
                    onChange={(e) =>
                      setJournalEntry({
                        ...journalEntry,
                        topic: e.target.value,
                      })
                    }
                    placeholder="Enter the lesson topic"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="activities">Activities Conducted</Label>
                  <Textarea
                    id="activities"
                    value={journalEntry.activities}
                    onChange={(e) =>
                      setJournalEntry({
                        ...journalEntry,
                        activities: e.target.value,
                      })
                    }
                    placeholder="Describe the activities and methods used"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes & Observations</Label>
                  <Textarea
                    id="notes"
                    value={journalEntry.notes}
                    onChange={(e) =>
                      setJournalEntry({
                        ...journalEntry,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Student responses, challenges, improvements needed, etc."
                    rows={3}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-800 hover:bg-red-700"
                >
                  Save Entry
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journalEntries.length > 0 ? (
              <div className="space-y-4">
                {journalEntries.map((entry: any) => (
                  <Card key={entry.id} className="border-l-4 border-l-red-800">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-red-800">
                            {entry.topic}
                          </CardTitle>
                          <CardDescription>
                            {entry.subject} •{' '}
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          Activities Conducted:
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {entry.activities}
                        </p>
                      </div>
                      {entry.notes && (
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">
                            Notes & Observations:
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {entry.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No journal entries yet.</p>
                <p className="text-sm text-gray-500">
                  Click "Add Entry" to create your first journal entry.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
