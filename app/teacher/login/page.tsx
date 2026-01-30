'use client';

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
import { Home, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function TeacherLoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const response = await fetch('/api/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Network error occurred' }));
        setLoginError(
          errorData.error ||
            `Server error (${response.status}). Please try again.`
        );
        return;
      }

      const data = await response.json();

      if (data.success && data.teacher) {
        localStorage.setItem('teacher', JSON.stringify(data.teacher));
        setLoginEmail('');
        setLoginPassword('');
        setLoginError(null);
        router.push('/teacher');
      } else {
        setLoginError(
          data.error || 'Login failed. Please check your credentials.'
        );
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.message || String(error) || '';
      if (
        errorMessage &&
        (errorMessage.includes('fetch') || errorMessage.includes('network'))
      ) {
        setLoginError(
          'Network error. Please check your internet connection and try again.'
        );
      } else if (errorMessage && errorMessage.includes('Failed to fetch')) {
        setLoginError(
          'Cannot connect to the server. Please make sure the server is running.'
        );
      } else {
        setLoginError(
          `An error occurred: ${errorMessage || 'Please try again.'}`
        );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Sto Niño de Praga Academy Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Teacher Login
          </CardTitle>
          <CardDescription>Sto Niño de Praga Academy</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-red-800">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="border-red-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-red-800">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="border-red-200"
              />
            </div>
            {loginError && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {loginError}
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-red-800 hover:bg-red-700"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-center">
              <Link href="/">
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-800 text-red-800"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
