import Heading from "@theme/Heading";
import ArrowPathLogo from "../../images/arrow-path.svg";
import CookiesLogo from "../../images/cookies.svg";
import LinkLogo from "../../images/link.svg";
import MessagesLogo from "../../images/messages.svg";
import SwitchLogo from "../../images/switch.svg";
import TSLogo from "../../images/typescript.svg";

const features = [
  {
    name: "TypeScript support",
    description:
      "All hooks and functions are strictly typed. Even the available routes and message interpolation patterns are type-safe",
    icon: TSLogo,
  },
  {
    name: "No cookies or custom headers",
    description:
      "Static rendering and export output mode are supported since no cookies or custom headers are used.",
    icon: CookiesLogo,
  },
  {
    name: "ICU message format",
    description:
      "The package supports ICU formatted interpolation patterns in messages. Write for example different pluralization patterns to messages.",
    icon: MessagesLogo,
  },
  {
    name: "Localized pathnames",
    description:
      "Improve the application SEO by localizing the route pathnames in addition to localizing the content.",
    icon: LinkLogo,
  },
  {
    name: "Context aware APIs",
    description:
      "Package APIs can be used interchangeably in Server and Client Components. The current locale is inferred through the rendering context.",
    icon: SwitchLogo,
  },
  {
    name: "Pre-configured middleware",
    description:
      "The package middleware handles locale detection, redirection and adding alternate link header to responses for improved SEO",
    icon: ArrowPathLogo,
  },
];

export default function FeaturesSection() {
  return (
    <section>
      <div className="mx-auto max-w-2xl lg:text-center">
        <Heading
          as="h2"
          className="text-lg font-semibold text-sky-700 sm:text-xl dark:text-sky-300"
        >
          Effortless internationalization
        </Heading>
        <p className="mt-2 text-pretty text-2xl font-semibold tracking-tight sm:text-5xl/tight lg:text-balance">
          The smoothest DX for Next.js internationalization
        </p>
        <p className="mt-6 sm:text-lg">
          When using NextGlobeGen for localizing your app, you barely even
          notice it's existence. Everything Next.js App Router supports is
          supported out of the box.
        </p>
      </div>
      <dl className="mx-auto mt-16 grid grid-cols-1 gap-10 md:max-w-4xl md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.name} className="relative pl-14 sm:pl-16">
            <dt className="text-base font-semibold">
              <feature.icon
                aria-hidden="true"
                className="absolute left-0 top-2 size-8 sm:size-9"
              />
              {feature.name}
            </dt>
            <dd className="mt-2 text-base/7">{feature.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
