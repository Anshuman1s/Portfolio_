import { ImageIcon } from "lucide-react";
import Image from "next/image";
import type { PublicProject } from "@/lib/content";
import { publicAssetExists } from "@/lib/publicAsset";

type ProjectPreviewProps = {
  project: PublicProject;
  sizes: string;
};

const imageAvailable = (src: string) =>
  src.startsWith("https://") || publicAssetExists(src);

export function ProjectPreview({ project, sizes }: ProjectPreviewProps) {
  const { imageUrl, imageAlt, title } = project;

  if (imageUrl && imageAvailable(imageUrl)) {
    return (
      <Image
        src={imageUrl}
        alt={imageAlt || `Screenshot of ${title}`}
        fill
        sizes={sizes}
        // Remote screenshots (admin-entered https URLs) skip the optimiser so
        // arbitrary hosts don't need allowlisting in next.config.ts.
        unoptimized={imageUrl.startsWith("https://")}
        className="object-cover object-top transition-transform duration-500 ease-out group-hover/card:scale-[1.03] motion-reduce:transition-none"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Screenshot placeholder for ${title}`}
      className="flex size-full flex-col items-center justify-center gap-3 bg-blush text-muted"
    >
      <ImageIcon size={28} strokeWidth={1.5} aria-hidden />
      <span className="text-xs">Screenshot coming soon</span>
    </div>
  );
}
