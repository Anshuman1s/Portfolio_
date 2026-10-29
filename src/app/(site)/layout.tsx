import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { Footer } from "@/components/footer/Footer";
import { Navbar } from "@/components/navbar/Navbar";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <PageViewTracker />
    </>
  );
}
