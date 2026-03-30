'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
interface DateRangeValue {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value: DateRangeValue | undefined;
  onChange: (range: DateRangeValue | undefined) => void;
  placeholder?: string;
  disableFuture?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder,
  disableFuture = true,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const clickCount = React.useRef(0);

  // Reset click count when popover opens
  React.useEffect(() => {
    if (open) clickCount.current = 0;
  }, [open]);

  const label = React.useMemo(() => {
    if (value?.from && value?.to) {
      return `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`;
    }
    if (value?.from) {
      return `${format(value.from, 'MMM d, yyyy')} - ...`;
    }
    return placeholder || 'Select date range';
  }, [value, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={`justify-between text-left font-normal ${!value?.from ? 'text-muted-foreground' : ''}`}
        >
          <span className="truncate">{label}</span>
          <CalendarIcon className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value?.from ? { from: value.from, to: value.to } : undefined}
          onSelect={(range) => {
            clickCount.current++;
            onChange(range ? { from: range.from, to: range.to } : undefined);
            // Only close after second click (the end date)
            if (clickCount.current >= 2 && range?.from && range?.to) {
              setOpen(false);
            }
          }}
          numberOfMonths={2}
          disabled={disableFuture ? { after: new Date() } : undefined}
          defaultMonth={value?.from || new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
