import { HeaderShell } from "./HeaderShell";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { SocialLinks } from "./SocialLinks";

export function Navbar() {
  return (
    <HeaderShell>
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:grid md:h-16 md:grid-cols-[1fr_auto_1fr] md:gap-6 lg:px-10">
        <div className="min-w-0 justify-self-start">
          <Logo />
        </div>

        <nav aria-label="Primary" className="hidden md:block">
          <NavLinks variant="desktop" />
        </nav>

        <div className="flex items-center gap-1 justify-self-end">
          <SocialLinks />
          <MobileMenu />
        </div>
      </div>
    </HeaderShell>
  );
}
