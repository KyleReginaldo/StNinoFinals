'use client';

import { Pagination } from '@/components/ui/data-table/Pagination';
import { describeRecord, diffChanges, fieldLabel, formatValue, TABLE_LABELS } from '@/lib/activity-log';
import { formatDateTime } from '@/lib/format-date';
import { History, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LogRow {
  id: string;
  created_at: string;
  action: 'insert' | 'update' | 'delete';
  table_name: string;
  record_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  actor: { name: string; role: string } | null;
}

const ACTION_STYLE: Record<string, string> = {
  insert: 'bg-green-50 text-green-700 ring-green-200',
  update: 'bg-amber-50 text-amber-700 ring-amber-200',
  delete: 'bg-red-50 text-red-700 ring-red-200',
};
const ACTION_LABEL: Record<string, string> = { insert: 'Added', update: 'Changed', delete: 'Deleted' };
const SHOWN_CHANGES = 4;

function Changes({ row }: { row: LogRow }) {
  const [open, setOpen] = useState(false);
  const changes = diffChanges(row.old_values, row.new_values);
  if (!changes.length) return <span className="text-gray-400">—</span>;
  const shown = open ? changes : changes.slice(0, SHOWN_CHANGES);
  return (
    <div className="space-y-0.5">
      {shown.map((c) => (
        <div key={c.field} className="text-xs leading-snug break-words">
          <span className="font-medium text-gray-700">{fieldLabel(c.field)}:</span>{' '}
          {row.action === 'update' ? (
            <>
              <span className="text-gray-400 line-through">{formatValue(c.from)}</span>
              <span className="text-gray-400"> → </span>
              <span className="text-gray-900">{formatValue(c.to)}</span>
            </>
          ) : (
            <span className="text-gray-700">{formatValue(row.action === 'delete' ? c.from : c.to)}</span>
          )}
        </div>
      ))}
      {changes.length > SHOWN_CHANGES && (
        <button onClick={() => setOpen((v) => !v)} className="text-xs text-red-700 hover:underline">
          {open ? 'Show less' : `Show all ${changes.length} fields`}
        </button>
      )}
    </div>
  );
}

export default function ChangeLogPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [table, setTable] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState(''); // applied search (on Enter / after typing pause)

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setPage(1), [from, to, table, q, pageSize]);

  useEffect(() => {
    let stale = false; // a newer filter/page won: ignore this response
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (table) params.set('table', table);
    if (q) params.set('q', q);
    setLoading(true);
    setError('');
    fetch(`/api/admin/activity-logs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (stale) return;
        if (!d.success) throw new Error(d.error || 'Could not load the change log.');
        setRows(d.logs);
        setTotal(d.total);
      })
      .catch((e) => !stale && setError(e.message))
      .finally(() => !stale && setLoading(false));
    return () => {
      stale = true;
    };
  }, [page, pageSize, from, to, table, q]);

  const filtered = from || to || table || q;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          Change Log
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Every change made in the system: when, who, from which IP address, and what changed. {total} entries.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white"
            />
          </div>
          <select
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="">All records</option>
            {Object.entries(TABLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-xs text-gray-500">
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1" />
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-500">
            To
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1" />
          </label>
          {filtered && (
            <button
              onClick={() => { setFrom(''); setTo(''); setTable(''); setSearch(''); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Date &amp; Time</th>
                <th className="px-4 py-2.5 font-semibold">Name</th>
                <th className="px-4 py-2.5 font-semibold whitespace-nowrap">IP Address</th>
                <th className="px-4 py-2.5 font-semibold">Action</th>
                <th className="px-4 py-2.5 font-semibold">Record</th>
                <th className="px-4 py-2.5 font-semibold min-w-[280px]">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-400">Loading…</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-red-600">{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-400">
                  {filtered ? 'No changes match these filters.' : 'No changes recorded yet.'}
                </td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{formatDateTime(r.created_at)}</td>
                    <td className="px-4 py-3 text-xs">
                      {r.actor ? (
                        <>
                          <div className="font-medium text-gray-900">{r.actor.name || '—'}</div>
                          <div className="text-gray-400 capitalize">{r.actor.role}</div>
                        </>
                      ) : (
                        <span className="text-gray-400" title="Made by the system or before sign-in tracking">System / unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600 whitespace-nowrap" title={r.user_agent ?? undefined}>
                      {r.ip_address ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ${ACTION_STYLE[r.action] ?? ''}`}>
                        {ACTION_LABEL[r.action] ?? r.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-gray-900">{describeRecord(r.table_name, r.new_values ?? r.old_values)}</div>
                      <div className="text-gray-400">{TABLE_LABELS[r.table_name] ?? r.table_name}</div>
                    </td>
                    <td className="px-4 py-3"><Changes row={r} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 10 && (
          <Pagination
            page={page}
            pageCount={Math.ceil(total / pageSize)}
            totalCount={total}
            filteredCount={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </div>
  );
}
