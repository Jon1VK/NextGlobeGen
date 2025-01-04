import { demos } from "@/components/demos";
import { Link, useTranslations } from "next-globe-gen";

export default function Page() {
  const homeT = useTranslations("home");
  const demosT = useTranslations("demos");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-medium ">{homeT("title")}</h1>
        <p className="mt-4 text-sm text-gray-300">{homeT("description")}</p>
      </div>

      <div className="space-y-10 text-white">
        {demos.map((section) => {
          return (
            <div key={section.titleKey} className="space-y-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {demosT(`client.titles.${section.titleKey}`)}
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {section.items.map((item) => {
                  return (
                    <Link
                      href={item.route}
                      key={item.route}
                      className="group block space-y-1.5 rounded-lg bg-gray-900 px-5 py-3 hover:bg-gray-800"
                    >
                      <div className="font-medium text-gray-200 group-hover:text-gray-50">
                        {demosT(`client.titles.${item.titleKey}`)}
                      </div>
                      <div className="line-clamp-3 text-sm text-gray-400 group-hover:text-gray-300">
                        {demosT(`descriptions.${item.descriptionKey}`)}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
