import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import LogoDark from "../../../static/img/logo.dark.svg";
import Logo from "../../../static/img/logo.svg";
import CodeExample from "./CodeExample";

export default function HeroSection() {
  return (
    <section className="space-y-24 xl:grid xl:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] xl:items-center xl:space-y-0 xl:gap-x-8">
      <div className="mx-auto max-w-lg text-balance">
        <Heading
          as="h1"
          className="text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          <Logo className="w-9 align-bottom sm:w-14 dark:hidden" />
          <LogoDark className="hidden w-9 align-bottom sm:w-14 dark:inline" />
          <span> NextGlobeGen</span>
        </Heading>
        <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
          Localize your Next.js App Router routes and content to serve your
          application for all users around the world.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6 font-semibold">
          <Link
            href="./docs/getting-started"
            className="rounded-xl bg-sky-700/90 px-6 py-3 text-white hover:text-white"
          >
            Get Started <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="https://next-globe-gen-playground.vercel.app"
            className="rounded-xl bg-sky-300/20 px-6 py-3 whitespace-nowrap text-gray-900 hover:text-gray-900 dark:text-white dark:hover:text-white"
          >
            Playground Example <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <CodeExample />
    </section>
  );
}
