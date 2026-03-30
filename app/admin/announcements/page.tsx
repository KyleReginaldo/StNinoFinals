'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAlert } from '@/lib/use-alert';
import { useConfirm } from '@/lib/use-confirm';
import { Bell, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string | null;
  target_audience: string | null;
  is_active: boolean | null;
  published_at: string | null;
  expires_at: string | null;
  author_id: string;
  created_at: string | null;
  updated_at: string | null;
}

type TabValue = 'all' | 'active' | 'expired';

const PRIORITY_OPTIONS = [
  { label: 'High', value: 'high' },
  { label: 'Normal', value: 'normal' },
  { label: 'Low', value: 'low' },
];

const AUDIENCE_OPTIONS = [
  { label: 'All Users', value: 'all' },
  { label: 'Students', value: 'students' },
  { label: 'Teachers', value: 'teachers' },
  { label: 'Parents/Guardians', value: 'parents' },
];

const getPriorityBadge = (priority: string | null) => {
  switch (priority) {
    case 'high':
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-300"
        >
          High
        </Badge>
      );
    case 'normal':
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-300"
        >
          Normal
        </Badge>
      );
    case 'low':
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-300"
        >
          Low
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const getStatusBadge = (announcement: Announcement) => {
  const now = new Date();
  const isExpired =
    announcement.expires_at && new Date(announcement.expires_at) < now;
  if (!announcement.is_active || isExpired) {
    return (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-700 border-gray-300"
      >
        {isExpired ? 'Expired' : 'Inactive'}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-green-100 text-green-800 border-green-300"
    >
      Active
    </Badge>
  );
};

const defaultForm = {
  title: '',
  content: '',
  priority: 'normal',
  target_audience: 'all',
  is_active: true,
  published_at: new Date().toISOString().slice(0, 10),
  expires_at: '',
};

export default function AdminAnnouncementsPage() {
  const { admin } = useAuth();
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements');
      const result = await res.json();
      if (result.success) {
        setAnnouncements(result.data || []);
      }
    } catch {
      showAlert({ message: 'Failed to load announcements', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const filtered = useMemo(() => {
    const now = new Date();
    return announcements.filter((a) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        a.title.toLowerCase().includes(search) ||
        a.content.toLowerCase().includes(search);

      const isExpired = a.expires_at && new Date(a.expires_at) < now;
      const isActive = a.is_active && !isExpired;

      if (activeTab === 'active') return matchesSearch && isActive;
      if (activeTab === 'expired')
        return matchesSearch && (!a.is_active || isExpired);
      return matchesSearch;
    });
  }, [announcements, searchTerm, activeTab]);

  const counts = useMemo(() => {
    const now = new Date();
    let active = 0;
    let expired = 0;
    for (const a of announcements) {
      const isExpired = a.expires_at && new Date(a.expires_at) < now;
      if (a.is_active && !isExpired) active++;
      else expired++;
    }
    return { all: announcements.length, active, expired };
  }, [announcements]);

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setDialogOpen(true);
  };

  const openEditDialog = (a: Announcement) => {
    setEditingId(a.id);
    setFormData({
      title: a.title,
      content: a.content,
      priority: a.priority === 'medium' ? 'normal' : (a.priority || 'normal'),
      target_audience: a.target_audience || 'all',
      is_active: a.is_active ?? true,
      published_at: a.published_at
        ? new Date(a.published_at).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      expires_at: a.expires_at
        ? new Date(a.expires_at).toISOString().slice(0, 10)
        : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showAlert({ message: 'Title and content are required', type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId
        ? {
            id: editingId,
            ...formData,
            expires_at: formData.expires_at || null,
          }
        : {
            ...formData,
            expires_at: formData.expires_at || null,
            author_id: admin?.id,
          };

      const res = await fetch('/api/admin/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        showAlert({
          message: result.error || 'Failed to save announcement',
          type: 'error',
        });
        return;
      }

      showAlert({
        message: editingId ? 'Announcement updated!' : 'Announcement created!',
        type: 'success',
      });
      setDialogOpen(false);
      fetchAnnouncements();
    } catch {
      showAlert({ message: 'Something went wrong', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Announcement',
      message:
        'Are you sure you want to delete this announcement? This cannot be undone.',
    });
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        showAlert({ message: 'Announcement deleted', type: 'success' });
        fetchAnnouncements();
      } else {
        showAlert({
          message: result.error || 'Failed to delete',
          type: 'error',
        });
      }
    } catch {
      showAlert({ message: 'Error deleting announcement', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Bell className="w-10 h-10 text-red-800" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Announcements</h2>
          <p className="text-gray-600">
            Create and manage announcements visible to all users
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="ml-auto bg-red-800 hover:bg-red-700 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', count: counts.all, tab: 'all' as TabValue },
          { label: 'Active', count: counts.active, tab: 'active' as TabValue },
          {
            label: 'Expired/Inactive',
            count: counts.expired,
            tab: 'expired' as TabValue,
          },
        ].map((s) => (
          <button
            key={s.tab}
            onClick={() => setActiveTab(s.tab)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              activeTab === s.tab
                ? 'bg-red-50 border-red-300'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.count}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-800">
            {activeTab === 'all'
              ? 'All Announcements'
              : activeTab === 'active'
                ? 'Active Announcements'
                : 'Expired/Inactive Announcements'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-800 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No announcements found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {a.title}
                    </TableCell>
                    <TableCell>{getPriorityBadge(a.priority)}</TableCell>
                    <TableCell className="capitalize text-sm text-gray-600">
                      {a.target_audience || 'all'}
                    </TableCell>
                    <TableCell>{getStatusBadge(a)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {a.published_at
                        ? new Date(a.published_at).toLocaleDateString('en-PH')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {a.expires_at
                        ? new Date(a.expires_at).toLocaleDateString('en-PH')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(a)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(a.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-800">
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Announcement title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write your announcement..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) =>
                    setFormData({ ...formData, priority: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Target Audience</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(v) =>
                    setFormData({ ...formData, target_audience: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_OPTIONS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label>Publish &amp; Expiry Date</Label>
              <DateRangePicker
                value={{
                  from: formData.published_at
                    ? new Date(formData.published_at + 'T00:00:00')
                    : undefined,
                  to: formData.expires_at
                    ? new Date(formData.expires_at + 'T00:00:00')
                    : undefined,
                }}
                onChange={(range) =>
                  setFormData({
                    ...formData,
                    published_at: range?.from
                      ? range.from.toISOString().slice(0, 10)
                      : new Date().toISOString().slice(0, 10),
                    expires_at: range?.to
                      ? range.to.toISOString().slice(0, 10)
                      : '',
                  })
                }
                placeholder="Select publish and expiry dates"
                disableFuture={false}
              />
              <p className="text-xs text-gray-500">
                First date = publish, second date = expiry (optional)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={submitting}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
