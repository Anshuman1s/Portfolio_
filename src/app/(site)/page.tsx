import { About } from "@/components/about/About";
import { Hero } from "@/components/hero/Hero";
import { Projects } from "@/components/projects/Projects";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-10">
      <Hero />
      <About />
      <Projects />
    </main>
  );
}
