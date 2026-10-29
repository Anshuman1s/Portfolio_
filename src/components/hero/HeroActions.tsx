import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { heroConfig } from "@/config/site";
import { publicAssetExists } from "@/lib/publicAsset";

const buttonBase =
  "focus-ring inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-sm font-medium tracking-tight transition-colors duration-200 motion-reduce:transition-none";

export function HeroActions() {
  const { href, downloadName } = heroConfig.resume;
  const hasResume = publicAssetExists(href);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {hasResume ? (
          <a
            href={href}
            download={downloadName}
            className={`${buttonBase} bg-ink text-cream hover:bg-ink-hover`}
          >
            <Download size={16} strokeWidth={2} aria-hidden />
            Download Resume
          </a>
        ) : (
          <span
            role="link"
            aria-disabled="true"
            title={`Add your resume at public${href}`}
            className={`${buttonBase} cursor-not-allowed bg-ink/40 text-cream`}
          >
            <Download size={16} strokeWidth={2} aria-hidden />
            Download Resume
          </span>
        )}

        <Link
          href="/#projects"
          className="focus-ring group inline-flex h-12 items-center gap-2 rounded-full px-1 text-sm font-medium tracking-tight text-ink"
        >
          <span className="relative after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 group-hover:after:scale-x-100 motion-reduce:after:transition-none">
            View Projects
          </span>
          <ArrowRight
            size={16}
            strokeWidth={2}
            aria-hidden
            className="text-accent-hover transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </Link>
      </div>

      {!hasResume && process.env.NODE_ENV === "development" && (
        <p className="text-xs text-muted">
          Dev note: add your PDF at{" "}
          <code className="text-ink">public{href}</code> to enable the
          download.
        </p>
      )}
    </div>
  );
}
