import { Button, buttonStyles } from "@/components/ui/button";
import { berryFacebookPageUrl } from "@/lib/constants";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] bg-[#171212] p-8 text-white">
          <h1 className="font-display text-5xl">Contact Us</h1>
          <p className="mt-5 text-sm leading-7 text-white/70">
            Use this page as the future hub for direct customer contact, social media trust, and store support.
          </p>
          <div className="mt-6 space-y-3 text-sm text-white/70">
            <p>Phone: +94 77 123 4567</p>
            <p>Email: hello@berryclothing.lk</p>
            <p>Instagram: @berryclothing.lk</p>
            <a
              href={berryFacebookPageUrl}
              target="_blank"
              rel="noreferrer"
              className="block font-semibold text-berry-300 hover:text-berry-200"
            >
              Facebook: Berry Clothing
            </a>
          </div>
          <a
            href={berryFacebookPageUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonStyles("secondary", "mt-6")}
          >
            Follow on Facebook
          </a>
        </div>
        <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="Name" className="rounded-2xl border border-black/10 px-4 py-3" />
            <input placeholder="Phone" className="rounded-2xl border border-black/10 px-4 py-3" />
            <input placeholder="Email" className="rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2" />
            <textarea placeholder="Message" className="min-h-40 rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2" />
          </div>
          <Button className="mt-6">Send Message</Button>
        </div>
      </div>
    </div>
  );
}
