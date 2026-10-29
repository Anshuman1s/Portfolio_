import Image from "next/image";
import { heroConfig } from "@/config/site";
import { publicAssetExists } from "@/lib/publicAsset";

// Arch top, softly rounded base — echoes the round accent dot.
const frameShape = "rounded-t-[999px] rounded-b-[2rem]";

export function HeroPortrait() {
  const { src, alt } = heroConfig.photo;
  const hasPhoto = publicAssetExists(src);
  const initials = `${heroConfig.firstName[0]}${heroConfig.lastName[0]}`;

  return (
    <figure className="relative mx-auto w-full max-w-[22rem] md:max-w-none">
      {/* Offset blush backdrop */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 translate-x-3 translate-y-3 bg-blush sm:translate-x-4 sm:translate-y-4 ${frameShape}`}
      />

      <div
        className={`relative aspect-[4/5] overflow-hidden border border-ink/10 bg-blush-deep ${frameShape}`}
      >
        {hasPhoto ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1152px) 420px, (min-width: 768px) 40vw, 90vw"
            loading="eager"
            fetchPriority="high"
            // Portrait photos: anchor near the top so hair stays inside the arch.
            className="object-cover object-[50%_20%] transition-transform duration-700 ease-out hover:scale-[1.02] motion-reduce:transition-none"
          />
        ) : (
          <div
            role="img"
            aria-label="Profile photo placeholder"
            className="flex h-full flex-col items-center justify-center gap-4 text-ink"
          >
            <span className="font-logo text-7xl font-bold tracking-[-0.06em] sm:text-8xl">
              {initials}
            </span>
            {process.env.NODE_ENV === "development" && (
              <span className="px-6 text-center text-xs text-muted">
                Add your photo at public{src}
              </span>
            )}
          </div>
        )}
      </div>

      <span
        aria-hidden="true"
        className="absolute -top-1 right-6 size-4 rounded-full bg-accent sm:right-8"
      />
    </figure>
  );
}
