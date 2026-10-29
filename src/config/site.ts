export type NavLink = {
  label: string;
  href: string;
};

export type SocialPlatform = "github" | "linkedin" | "email";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
};

export const siteConfig = {
  name: "Anshuman Shukla",
  description: "Portfolio of Anshuman Shukla.",
  // TODO: Replace with your real email address.
  email: "anshuman981shukla@example.com",
  githubProfile: "https://github.com/anshuman1s",
} as const;

/** False while the email above is still the placeholder. */
export const isEmailConfigured = !siteConfig.email.startsWith("YOUR_EMAIL");

// Files live in /public. Drop them in at these paths and the hero picks them
// up automatically; until then it shows a placeholder / disabled button.
export const heroConfig = {
  firstName: "Anshuman",
  lastName: "Shukla",
  role: "Full Stack Developer",
  // company: "Open Gigantic",
  intro:
    "I build modern, responsive, and performant web applications with a focus on clean code, intuitive user experiences, and scalable solutions.",
  photo: {
    src: "/images/profile.jpg",
    alt: "Portrait of Anshuman Shukla",
  },
  resume: {
    href: "/resume.pdf",
    downloadName: "Anshuman-Shukla-Resume.pdf",
  },
} as const;

export const navLinks: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
];

// Email is set in siteConfig.
export const socialLinks: readonly SocialLink[] = [
  {
    platform: "github",
    label: "GitHub profile",
    href: siteConfig.githubProfile,
  },
  {
    platform: "linkedin",
    label: "LinkedIn profile",
    href: "https://www.linkedin.com/in/anshuman199/",
  },
  {
    platform: "email",
    label: "Send an email",
    href: `mailto:${siteConfig.email}`,
  },
];
