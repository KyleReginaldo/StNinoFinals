'use client';

import { LegalContent } from '@/components/LegalContent';
import { LegalLinks } from '@/components/LegalLinks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLegalContent } from '@/hooks/use-legal-content';

interface TermsPrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
}

/**
 * "I have read and agree" pop-up. Shows the full Terms of Service and Privacy Policy
 * the admin maintains in Settings (the same text as /terms and /privacy).
 */
export function TermsPrivacyModal({ open, onOpenChange, onAgree }: TermsPrivacyModalProps) {
  const legal = useLegalContent(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Terms of Service &amp; Privacy Policy</DialogTitle>
          <DialogDescription className="sr-only">
            Read both documents, then choose I Agree to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-1 text-sm text-gray-600 leading-relaxed">
          {legal.status === 'ready' ? (
            <div className="space-y-6">
              <section>
                <p className="text-base font-bold text-red-900 mb-3">Terms of Service</p>
                <LegalContent text={legal.terms} />
              </section>
              <section className="pt-4 border-t border-gray-100">
                <p className="text-base font-bold text-red-900 mb-3">Privacy Policy</p>
                <LegalContent text={legal.privacy} />
              </section>
              <p className="text-xs text-gray-500">
                Also available as full pages: <LegalLinks newTab />.
              </p>
            </div>
          ) : legal.status === 'error' ? (
            <p>
              We could not load the Terms of Service and Privacy Policy. Check your connection and{' '}
              <button onClick={legal.reload} className="text-red-700 underline underline-offset-2">
                try again
              </button>
              .
            </p>
          ) : (
            <div className="animate-pulse space-y-3" aria-label="Loading">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAgree}
            disabled={legal.status !== 'ready'}
            className="flex-1 h-10 rounded-lg bg-red-900 hover:bg-red-800 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            I Agree
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
