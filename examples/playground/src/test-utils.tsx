import { render, type RenderOptions } from "@testing-library/react";
import { IntlProvider } from "next-globe-gen/client";
import type { ReactNode } from "react";
import { messages } from "../.next-globe-gen/messages";
import { schema } from "../.next-globe-gen/schema";

const wrapper = ({ children }: { children: ReactNode }) => (
  <IntlProvider
    schema={schema}
    messages={messages[schema.defaultLocale]}
    locale={schema.defaultLocale}
  >
    {children}
  </IntlProvider>
);

const customRender = ((ui: ReactNode, options?: RenderOptions) => {
  return render(ui, { wrapper, ...options });
}) as typeof render;

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
