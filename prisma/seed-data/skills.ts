// The original constellation layout, used to seed an empty Skill table.
export const initialSkills = [
  { slug: "javascript", name: "JavaScript", icon: "javascript", category: "Language", color: "#d4b400", x: 64, y: 34, size: "md" },
  { slug: "typescript", name: "TypeScript", icon: "typescript", category: "Language", color: "#3178c6", x: 83, y: 17, size: "lg" },
  { slug: "react", name: "React", icon: "react", category: "Frontend", color: "#0a9cc2", x: 24, y: 17, size: "lg" },
  { slug: "nextjs", name: "Next.js", icon: "nextjs", category: "Frontend", color: "#000000", x: 50, y: 9, size: "md" },
  { slug: "nodejs", name: "Node.js", icon: "nodejs", category: "Backend", color: "#5fa04e", x: 30, y: 46, size: "lg" },
  { slug: "express", name: "Express", icon: "express", category: "Backend", color: "#000000", x: 11, y: 63, size: "sm" },
  { slug: "html5", name: "HTML5", icon: "html5", category: "Frontend", color: "#e34f26", x: 89, y: 44, size: "md" },
  { slug: "css", name: "CSS3", icon: "css", category: "Frontend", color: "#663399", x: 73, y: 61, size: "sm" },
  { slug: "tailwind", name: "Tailwind CSS", icon: "tailwind", category: "Frontend", color: "#06b6d4", x: 50, y: 56, size: "lg" },
  { slug: "python", name: "Python", icon: "python", category: "Language", color: "#3776ab", x: 19, y: 86, size: "md" },
  { slug: "git", name: "Git", icon: "git", category: "Tooling", color: "#f05032", x: 41, y: 78, size: "sm" },
  { slug: "github", name: "GitHub", icon: "github", category: "Tooling", color: "#181717", x: 63, y: 88, size: "md" },
  { slug: "postgresql", name: "PostgreSQL", icon: "postgresql", category: "Database", color: "#4169e1", x: 87, y: 76, size: "md" },
  { slug: "mongodb", name: "MongoDB", icon: "mongodb", category: "Database", color: "#47a248", x: 8, y: 33, size: "sm" },
  { slug: "docker", name: "Docker", icon: "docker", category: "Tooling", color: "#2496ed", x: 42, y: 30, size: "md" },
] as const satisfies readonly {
  slug: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  x: number;
  y: number;
  size: "sm" | "md" | "lg";
}[];
