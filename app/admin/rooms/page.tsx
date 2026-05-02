'use client';

import { useAlert } from '@/lib/use-alert';
import { useConfirm } from '@/lib/use-confirm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, DoorOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Room {
  id: string;
  name: string;
  capacity: number | null;
  description: string | null;
  is_active: boolean;
}

const EMPTY_FORM = { name: '', capacity: '', description: '' };

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rooms');
      const data = await res.json();
      if (data.success) setRooms(data.rooms);
    } catch {
      showAlert({ message: 'Failed to load rooms', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setForm({ name: room.name, capacity: room.capacity?.toString() ?? '', description: room.description ?? '' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showAlert({ message: 'Room name is required', type: 'error' }); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, capacity: form.capacity ? parseInt(form.capacity) : null, description: form.description };
      const res = await fetch('/api/admin/rooms', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { ...payload, id: editing.id } : payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showAlert({ message: editing ? 'Room updated' : 'Room added', type: 'success' });
      setShowDialog(false);
      fetchRooms();
    } catch (e: any) {
      showAlert({ message: e.message || 'Save failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (room: Room) => {
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: room.id, is_active: !room.is_active }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, is_active: !r.is_active } : r));
    } catch (e: any) {
      showAlert({ message: e.message || 'Update failed', type: 'error' });
    }
  };

  const handleDelete = async (room: Room) => {
    const confirmed = await showConfirm({
      title: 'Delete Room',
      message: `Delete "${room.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/rooms?id=${room.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showAlert({ message: 'Room deleted', type: 'success' });
      fetchRooms();
    } catch (e: any) {
      showAlert({ message: e.message || 'Delete failed', type: 'error' });
    }
  };

  const active = rooms.filter((r) => r.is_active);
  const inactive = rooms.filter((r) => !r.is_active);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin">
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DoorOpen className="w-5 h-5" />
              Room Management
            </h1>
            <p className="text-sm text-gray-500">{rooms.length} total rooms · {active.length} active</p>
          </div>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white" onClick={openAdd}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Room
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" />
          </div>
        ) : (
          <>
            <RoomTable title="Active Rooms" rooms={active} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggleActive} />
            {inactive.length > 0 && (
              <RoomTable title="Inactive Rooms" rooms={inactive} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggleActive} />
            )}
          </>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Room' : 'Add Room'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" required>Room Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Room 101" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 40" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-gray-800 text-white">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoomTable({
  title, rooms, onEdit, onDelete, onToggle,
}: {
  title: string;
  rooms: Room[];
  onEdit: (r: Room) => void;
  onDelete: (r: Room) => void;
  onToggle: (r: Room) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-400">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</p>
      </div>
      {rooms.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">No rooms here.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Capacity</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Description</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{room.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{room.capacity ?? <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{room.description || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Switch
                      checked={room.is_active}
                      onCheckedChange={() => onToggle(room)}
                      title={room.is_active ? 'Deactivate' : 'Activate'}
                    />
                    <button onClick={() => onEdit(room)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(room)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
