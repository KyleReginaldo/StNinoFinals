'use client';

import { useEffect, useState } from 'react';

export function ActivePeriodBadge() {
  const [period, setPeriod] = useState<{ schoolYear: string; quarter: number } | null>(null);

  useEffect(() => {
    fetch('/api/active-period')
      .then((r) => r.json())
      .then((d) => { if (d.success) setPeriod({ schoolYear: d.schoolYear, quarter: d.quarter }); })
      .catch(() => {});
  }, []);

  if (!period) return null;

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      A.Y. {period.schoolYear} &nbsp;·&nbsp; Quarter {period.quarter}
    </span>
  );
}
