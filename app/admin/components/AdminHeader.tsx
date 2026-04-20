'use client';

import { MobileSidebar } from '@/components/admin/mobile-sidebar';
import { AdminSidebarContent } from '@/components/admin/sidebar';
import Image from 'next/image';

export function AdminHeader() {
  return (
    <header className="bg-gradient-to-r from-red-800 to-red-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
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
      </div>
    </header>
  );
}
