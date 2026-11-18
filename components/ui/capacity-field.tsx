'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Number field that shows its problem right under the input as soon as the value is
 * wrong (red border + message), instead of waiting for Save. The caller decides what
 * "wrong" means (`error`) and should keep its Save button off while there is one.
 */
export function CapacityField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  hint?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const describedBy = `${id}-message`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} required={required}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={error ? 'border-red-500 focus-visible:ring-red-500' : undefined}
      />
      <p id={describedBy} role={error ? 'alert' : undefined} className={`text-xs ${error ? 'text-red-600' : 'text-gray-400'}`}>
        {error ?? hint}
      </p>
    </div>
  );
}
