import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h1 className="font-display text-4xl text-ink">Forgot Password</h1>
        <p className="mt-3 text-sm text-black/60">
          Password reset is handled through the configured Supabase Auth project.
        </p>
        <input placeholder="Enter your email" className="mt-6 w-full rounded-2xl border border-black/10 px-4 py-3" />
        <Button className="mt-5 w-full">Send Reset Link</Button>
      </div>
    </div>
  );
}
