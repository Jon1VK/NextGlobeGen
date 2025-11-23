import { describe, expect, test } from "vitest";
import { DEFAULT_CONFIG, mergeConfigs } from "~/utils/config";
import { getMessages } from "./getMessages";

describe("getMessages()", () => {
  test("works correctly", async () => {
    const messages = await getMessages(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        messages: { originDir: "./src/__mocks__/messages" },
      }),
    );
    expect(messages).toStrictEqual({
      fi: {
        message: "Ei nimiavaruutta viesti",
        namespace: {
          message: "Nimiavaruus viesti",
        },
        hello: {
          world: "Hei maailma",
          name: "Hei {name}",
        },
        projects:
          "{count, plural, =0 {Ei projekteja} one {Yksi projekti} other {# projektia}}",
      },
      en: {
        message: "No namespace message",
        namespace: {
          message: "Namespaced message",
        },
        hello: {
          world: "Hello world",
          name: "Hello {name}",
        },
        projects:
          "{count, plural, =0 {No project} one {One project} other {# projects}}",
      },
    });
  });
});
