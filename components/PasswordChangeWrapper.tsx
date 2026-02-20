'use client';

import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PasswordChangeWrapperProps {
  userId: string;
  children: React.ReactNode;
}

export function PasswordChangeWrapper({
  userId,
  children,
}: PasswordChangeWrapperProps) {
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkPasswordChangeRequired = async () => {
      if (!userId) {
        console.log('[PasswordChangeWrapper] No userId provided');
        setIsChecking(false);
        return;
      }

      console.log(
        '[PasswordChangeWrapper] Checking password change for userId:',
        userId
      );

      try {
        const response = await fetch(
          `/api/auth/change-password?userId=${userId}`
        );
        const result = await response.json();

        console.log('[PasswordChangeWrapper] Response:', result);

        if (result.success) {
          setPasswordChangeRequired(result.passwordChangeRequired);
          if (result.passwordChangeRequired) {
            setShowModal(true);
          }
          console.log(
            '[PasswordChangeWrapper] Password change required:',
            result.passwordChangeRequired
          );
        } else {
          console.error('[PasswordChangeWrapper] Error:', result.error);
        }
      } catch (error) {
        console.error(
          '[PasswordChangeWrapper] Error checking password change requirement:',
          error
        );
      } finally {
        setIsChecking(false);
      }
    };

    checkPasswordChangeRequired();
  }, [userId]);

  const handlePasswordChanged = () => {
    setPasswordChangeRequired(false);
    setShowModal(false);
    setShowBanner(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (passwordChangeRequired) {
      setShowBanner(true);
    }
  };

  const handleReopenModal = () => {
    setShowBanner(false);
    setShowModal(true);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
  };

  // While checking, show children normally
  if (isChecking) {
    return <>{children}</>;
  }

  return (
    <>
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm md:text-base">
                    Password Change Required
                  </p>
                  <p className="text-xs md:text-sm opacity-90">
                    For security purposes, you must change your password. This
                    is required for admin-created accounts.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleReopenModal}
                  size="sm"
                  className="bg-white text-amber-600 hover:bg-gray-100 font-semibold"
                >
                  Change Password
                </Button>
                <button
                  onClick={handleDismissBanner}
                  className="text-white hover:bg-amber-700 rounded p-1"
                  aria-label="Dismiss"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showBanner && <div className="h-[76px] md:h-[68px]" />}
      {children}
      <ChangePasswordModal
        isOpen={showModal}
        userId={userId}
        onPasswordChanged={handlePasswordChanged}
        onClose={handleCloseModal}
      />
    </>
  );
}
