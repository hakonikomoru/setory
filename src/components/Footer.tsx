import { siteConfig } from "@/config/site";

const { credit } = siteConfig;

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-violet-200/60 bg-white/40 px-4 py-5 text-center text-xs leading-relaxed text-violet-700/80 sm:text-sm">
      <p className="mx-auto max-w-5xl break-words">
        {credit.label}：
        {credit.href ? (
          <a
            href={credit.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-violet-800 underline decoration-violet-200 underline-offset-2 transition hover:text-violet-950 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:ring-offset-2"
          >
            {credit.name}
          </a>
        ) : (
          <span>{credit.name}</span>
        )}
      </p>
    </footer>
  );
}
