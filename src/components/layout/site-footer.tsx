import Image from "next/image";
import Link from "next/link";
import { berryFacebookPageUrl, paymentOptionsMessage } from "@/lib/constants";

const links = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/return-policy", label: "Returns & Exchanges" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-[#fff8f7]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Image
            src="/berry-logo.jpeg"
            alt="Berry logo"
            width={500}
            height={500}
            className="h-20 w-auto"
          />
          <p className="mt-3 max-w-md text-sm leading-6 text-black/65">
            A modern Sri Lankan women&apos;s fashion label bringing social-selling energy into a
            polished online shopping experience.
          </p>
          <p className="mt-4 text-sm font-semibold text-berry-700">{paymentOptionsMessage}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-berry-700">Explore</p>
          <div className="mt-4 space-y-3 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block text-black/65 hover:text-berry-600">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-berry-700">Contact</p>
          <div className="mt-4 space-y-3 text-sm text-black/65">
            <p>Instagram & Facebook orders available daily</p>
            <p>+94 77 123 4567</p>
            <p>hello@berryclothing.lk</p>
            <p>Colombo, Sri Lanka</p>
            <a
              href={berryFacebookPageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-berry-700 hover:text-berry-600"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-berry-100 text-sm">
                f
              </span>
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
