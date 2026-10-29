import { Mail } from "lucide-react";
import type { ComponentType } from "react";
import { socialLinks, type SocialPlatform } from "@/config/site";
import { GithubIcon, LinkedinIcon } from "./icons";

type IconComponent = ComponentType<{
  size?: number;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}>;

const icons: Record<SocialPlatform, IconComponent> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  email: Mail,
};

export function SocialLinks() {
  return (
    <ul className="flex items-center gap-0.5 sm:gap-1">
      {socialLinks.map(({ platform, label, href }) => {
        const Icon = icons[platform];
        const isExternal = href.startsWith("http");

        return (
          <li key={platform}>
            <a
              href={href}
              aria-label={label}
              {...(isExternal && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
              className="focus-ring flex size-8 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:text-accent-hover motion-reduce:transition-none sm:size-9"
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
