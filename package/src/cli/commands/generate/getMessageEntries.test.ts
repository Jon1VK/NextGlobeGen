import { describe, expect, test } from "vitest";
import { DEFAULT_CONFIG, mergeConfigs } from "~/config";
import { getMessageEntries } from "./getMessageEntries";

describe("getMessageEntries()", () => {
  test("works correctly", async () => {
    const messageEntries = await getMessageEntries(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        messages: { originDir: "./src/__mocks__/messages" },
      }),
    );
    expect(messageEntries).toStrictEqual({
      fi: [
        {
          key: "hello.world",
          message: "Hei maailma",
        },
        {
          key: "hello.name",
          message: "Hei {name}",
        },
        {
          key: "projects",
          message:
            "{count, plural, =0 {Ei projekteja} one {Yksi projekti} other {# projektia}}",
        },
        {
          key: "message",
          message: "Ei nimiavaruutta viesti",
        },
        {
          key: "namespace.message",
          message: "Nimiavaruus viesti",
        },
      ],
      en: [
        {
          key: "hello.world",
          description: "hello.world description",
          message: "Hello world",
        },
        {
          key: "hello.name",
          description: "hello.name description",
          message: "Hello {name}",
        },
        {
          key: "projects",
          description: "projects description",
          message:
            "{count, plural, =0 {No project} one {One project} other {# projects}}",
        },
        {
          key: "message",
          description: undefined,
          message: "No namespace message",
        },
        {
          key: "namespace.message",
          description: undefined,
          message: "Namespaced message",
        },
      ],
    });
  });
});
