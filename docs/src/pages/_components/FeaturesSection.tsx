import Heading from "@theme/Heading";
import ArrowPathLogo from "../../images/arrow-path.svg";
import CDNLogo from "../../images/cdn.svg";
import LinkLogo from "../../images/link.svg";
import MessagesLogo from "../../images/messages.svg";
import SwitchLogo from "../../images/switch.svg";
import TSLogo from "../../images/typescript.svg";

const features = [
  {
    name: "TypeScript support",
    description:
      "Routes, locales, and message arguments are automatically typed. Get full autocomplete without manual configuration.",
    icon: TSLogo,
  },
  {
    name: "Static rendering",
    description:
      "Static rendering and export mode supported out-of-the-box. Perfect for deployment on any CDN or static hosting.",
    icon: CDNLogo,
  },
  {
    name: "Rich text messages",
    description:
      "ICU MessageFormat with extensive interpolation patterns. Create dynamic, context-aware translations effortlessly.",
    icon: MessagesLogo,
  },
  {
    name: "Localized pathnames",
    description:
      "Translate URL segments for better SEO. Each route segment can have its own translations right next to the route code.",
    icon: LinkLogo,
  },
  {
    name: "Universal APIs",
    description:
      "Same hooks and components work seamlessly in both Server and Client Components.",
    icon: SwitchLogo,
  },
  {
    name: "Smart locale detection",
    description:
      "Built-in proxy handles locale detection. Automatic redirects and SEO-friendly alternate links.",
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
        <p className="mt-2 text-2xl font-semibold tracking-tight text-pretty sm:text-5xl/tight lg:text-balance">
          The smoothest DX for Next.js internationalization
        </p>
      </div>
      <dl className="mx-auto mt-16 grid grid-cols-1 gap-10 md:max-w-4xl md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.name} className="relative pl-14 sm:pl-16">
            <dt className="text-base font-semibold">
              <feature.icon
                aria-hidden="true"
                className="top-2 left-0 size-8 sm:size-9"
                style={{ position: "absolute" }}
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
