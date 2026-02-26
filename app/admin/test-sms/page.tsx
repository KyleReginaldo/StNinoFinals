'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  MessageSquare,
  RefreshCw,
  Send,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface LogEntry {
  id: number;
  timestamp: string;
  phone: string;
  message: string;
  status: 'success' | 'error';
  detail: string;
}

const DEFAULT_MESSAGE =
  '[Sto Niño Portal] This is a test SMS. If you received this, SMS notifications are working correctly.';

export default function TestSmsPage() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [nextId, setNextId] = useState(1);

  const charsLeft = 160 - message.length;

  const handleSend = async () => {
    if (!phone.trim() || !message.trim()) return;

    setSending(true);
    const timestamp = new Date().toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
    });

    try {
      const res = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), message: message.trim() }),
      });
      const data = await res.json();

      setLog((prev) => [
        {
          id: nextId,
          timestamp,
          phone: phone.trim(),
          message: message.trim(),
          status: data.success ? 'success' : 'error',
          detail: data.success
            ? `Sent successfully${data.messageId ? ` · ID: ${data.messageId}` : ''}`
            : data.error || 'Unknown error',
        },
        ...prev,
      ]);
      setNextId((n) => n + 1);
    } catch (err: any) {
      setLog((prev) => [
        {
          id: nextId,
          timestamp,
          phone: phone.trim(),
          message: message.trim(),
          status: 'error',
          detail: err?.message || 'Network error',
        },
        ...prev,
      ]);
      setNextId((n) => n + 1);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 mt-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <MessageSquare className="w-10 h-10 text-red-800" />
        <div>
          <h2 className="text-3xl font-bold text-red-800">SMS Tester</h2>
          <p className="text-gray-600 text-sm">
            Send test messages via TextBee without needing an RFID scan
          </p>
        </div>
      </div>

      {/* Compose Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-800">Compose Test SMS</CardTitle>
          <CardDescription>
            Sends via <span className="font-medium">TextBee</span> using the
            device and API key configured in your environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="phone">Recipient Phone Number</Label>
            <Input
              id="phone"
              placeholder="09XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-gray-400">
              PH numbers starting with 0 are auto-converted to +63.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <span
                className={`text-xs ${
                  charsLeft < 0
                    ? 'text-red-500 font-semibold'
                    : charsLeft < 20
                      ? 'text-yellow-600'
                      : 'text-gray-400'
                }`}
              >
                {charsLeft < 0
                  ? `${Math.abs(charsLeft)} over limit`
                  : `${charsLeft} chars left`}
              </span>
            </div>
            <Textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSend}
              disabled={sending || !phone.trim() || !message.trim()}
              className="bg-red-800 hover:bg-red-700"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test SMS
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setMessage(DEFAULT_MESSAGE)}
              disabled={sending}
            >
              Reset Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-red-800">Send Log</CardTitle>
              <CardDescription>Results from this session</CardDescription>
            </div>
            {log.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setLog([])}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {log.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No messages sent yet. Send a test above to see results here.
            </p>
          ) : (
            <div className="space-y-3">
              {log.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex gap-3 p-3 rounded-lg border text-sm ${
                    entry.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {entry.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold">{entry.phone}</span>
                      <Badge
                        variant="secondary"
                        className={
                          entry.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {entry.status === 'success' ? 'Sent' : 'Failed'}
                      </Badge>
                      <span className="text-xs text-gray-400 ml-auto">
                        {entry.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-600 truncate">{entry.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        entry.status === 'success'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {entry.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
