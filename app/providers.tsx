"use client";

import { AlertProvider } from "@/lib/use-alert";
import { ConfirmProvider } from "@/lib/use-confirm";
import { DeletePromptProvider } from "@/lib/use-delete-prompt";
import { AuthTokenFetch } from "@/components/auth-token-fetch";
import { UserProvider } from "./context/user-context";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AlertProvider>
        <ConfirmProvider>
          <DeletePromptProvider>
            <AuthTokenFetch />
            {children}
          </DeletePromptProvider>
        </ConfirmProvider>
      </AlertProvider>
    </UserProvider>
  );
}
