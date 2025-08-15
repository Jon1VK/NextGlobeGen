import Layout from "@theme/Layout";
import FeaturesSection from "./_components/FeaturesSection";
import HeroSection from "./_components/HeroSection";

export default function Home() {
  return (
    <Layout>
      <main className="relative isolate flex-1 overflow-hidden bg-linear-to-b from-sky-500/90 dark:to-sky-950">
        <div
          className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-sky-600/50 md:-mr-20 lg:-mr-36 dark:bg-gray-900"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-7xl space-y-24 px-8 py-24 sm:space-y-48">
          <HeroSection />
          <FeaturesSection />
        </div>
      </main>
    </Layout>
  );
}
