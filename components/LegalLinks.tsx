import Link from 'next/link';

/**
 * "Terms of Service and Privacy Policy" as two links with a red "and".
 * `current` highlights the page you are already on (it is not a link there).
 */
export function LegalLinks({
  current,
  className = 'text-red-700 hover:underline',
  newTab = false,
}: {
  current?: 'terms' | 'privacy';
  className?: string;
  newTab?: boolean;
}) {
  const target = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <>
      {current === 'terms' ? (
        <span className="font-medium text-red-700">Terms of Service</span>
      ) : (
        <Link href="/terms" className={className} {...target}>Terms of Service</Link>
      )}{' '}
      <span className="text-red-700">and</span>{' '}
      {current === 'privacy' ? (
        <span className="font-medium text-red-700">Privacy Policy</span>
      ) : (
        <Link href="/privacy" className={className} {...target}>Privacy Policy</Link>
      )}
    </>
  );
}
