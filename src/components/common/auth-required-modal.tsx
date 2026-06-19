import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export function AuthRequiredModal({
  open,
  onClose,
  redirectTo
}: {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
}) {
  if (!open) return null;

  const authQuery = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="font-display text-3xl text-ink">Login Required</h2>
        <p className="mt-4 text-sm leading-7 text-black/65">
          Please create an account or login before placing an order.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/login${authQuery}`} className={buttonStyles()}>
            Login
          </Link>
          <Link href={`/register${authQuery}`} className={buttonStyles("secondary")}>
            Create Account
          </Link>
        </div>
        <button onClick={onClose} className="mt-5 text-sm text-black/55">
          Maybe later
        </button>
      </div>
    </div>
  );
}
