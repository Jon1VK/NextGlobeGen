import Logo from "./Logo";

export default function Footer() {
  return (
    <div className="rounded-lg bg-vc-border-gradient p-px shadow-lg shadow-black/20">
      <div className="flex flex-col justify-between space-y-2 rounded-lg bg-black p-3.5 text-sm lg:px-5 lg:py-4">
        <a
          className="group flex w-full items-center gap-x-2"
          href="https://next-globe-gen.dev"
          target="_blank"
        >
          <div className="size-6 rounded-full">
            <Logo />
          </div>
          <span className="font-semibold tracking-wide text-gray-400 group-hover:text-gray-50">
            NextGlobeGen Docs
          </span>
        </a>

        <a
          className="text-gray-400 underline decoration-dotted underline-offset-4 transition-colors hover:text-gray-300"
          href="https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground"
          target="_blank"
        >
          View code
        </a>
      </div>
    </div>
  );
}
