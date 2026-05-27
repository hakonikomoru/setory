import Link from "next/link";
import { siteConfig } from "@/config/site";

const { credit } = siteConfig;

export default function Footer() {
  const creditText = `${credit.label}：${credit.name}`;

  return (
    <footer className="mt-auto border-t border-violet-200/60 bg-white/40 px-4 py-5 text-center text-xs leading-relaxed text-violet-700/80 sm:text-sm">
      <p className="mx-auto max-w-5xl break-words">
        {credit.href ? (
          <Link
            href={credit.href}
            className="transition hover:text-violet-900 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:ring-offset-2"
          >
            {creditText}
          </Link>
        ) : (
          <span>{creditText}</span>
        )}
      </p>
    </footer>
  );
}
