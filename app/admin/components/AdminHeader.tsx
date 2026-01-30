'use client';

import { MobileSidebar } from '@/components/admin/mobile-sidebar';
import { AdminSidebarContent } from '@/components/admin/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useAlert } from '@/lib/use-alert';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Admin } from '../types';

interface AdminHeaderProps {
  admin: Admin;
  canPop?: boolean;
}

export function AdminHeader({ admin, canPop }: AdminHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();
  const adminName =
    admin.first_name && admin.last_name
      ? `${admin.first_name} ${admin.last_name}`
      : admin.name || admin.email.split('@')[0];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        showAlert({
          message: 'Error signing out. Please try again.',
          type: 'error',
        });
        setIsLoggingOut(false);
        return;
      }
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      showAlert({
        message: 'Error signing out. Please try again.',
        type: 'error',
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-red-800 to-red-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu */}
            <MobileSidebar>
              <AdminSidebarContent />
            </MobileSidebar>

            <Image
              src="/logo.png"
              alt="Sto. Niño Logo"
              width={50}
              height={50}
              className="rounded-full bg-white p-1"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Admin Portal</h1>
              <p className="text-red-100 text-xs md:text-sm">
                Sto. Niño de Praga Academy
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{adminName}</p>
              <Badge
                variant="secondary"
                className="bg-red-900 text-white hover:bg-red-900"
              >
                Administrator
              </Badge>
            </div>
            {canPop ? (
              <Button
                className="bg-white text-red-800"
                onClick={() => {
                  router.back();
                }}
              >
                <ArrowLeft className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Back</span>
              </Button>
            ) : (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-2 md:px-4 py-2 bg-white text-red-800 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
