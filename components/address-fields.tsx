'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AddressParts } from '@/lib/address';

const FIELDS: { key: keyof AddressParts; label: string; placeholder: string }[] = [
  { key: 'street', label: 'House No./Street', placeholder: 'e.g., Blk 23 Lt 20 Pacific Town' },
  { key: 'barangay', label: 'Barangay', placeholder: 'Barangay' },
  { key: 'city', label: 'City/Municipality', placeholder: 'e.g., Trece Martires City' },
  { key: 'province', label: 'Province', placeholder: 'e.g., Cavite' },
];

// ponytail: free-text fields. select-philippines-address fetches its data from a
// third-party site at runtime, too fragile for a required field on the public form.
export function AddressFields({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: AddressParts;
  onChange: (value: AddressParts) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {FIELDS.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <Label htmlFor={`${id}-${f.key}`} className="text-sm font-medium text-gray-700" required>
            {f.label}
          </Label>
          <Input
            id={`${id}-${f.key}`}
            value={value[f.key]}
            placeholder={f.placeholder}
            onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
            required
            disabled={disabled}
            className="h-11 bg-white border-gray-200"
          />
        </div>
      ))}
    </div>
  );
}
