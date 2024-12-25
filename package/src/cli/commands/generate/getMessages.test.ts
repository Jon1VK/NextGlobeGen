import { describe, expect, test } from "vitest";
import { DEFAULT_CONFIG } from ".";
import { getMessages } from "./getMessages";

const exampleDir = "./src/__mocks__/messages";

describe("getMessages()", () => {
  test("works correctly", async () => {
    const messages = await getMessages({
      ...DEFAULT_CONFIG,
      locales: ["fi", "en"],
      getMessages: async (locale) => {
        return (await import(`${exampleDir}/${locale}.json`)).default;
      },
    });
    expect(messages).toStrictEqual({
      fi: {
        "hello.world": "Hei maailma",
        "hello.name": "Hei {name}",
        projects:
          "{count, plural, =0 {Ei projekteja} one {Yksi projekti} other {# projektia}",
      },
      en: {
        "hello.world": "Hello world",
        "hello.name": "Hello {name}",
        projects:
          "{count, plural, =0 {No project} one {One project} other {# projects}",
      },
    });
  });
});
