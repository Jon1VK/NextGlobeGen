import { readFileSync, rmSync } from "fs";
import path from "path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { getExpectedOriginRoutes } from "~/__mocks__/getExpectedOriginRoutes";
import { DEFAULT_CONFIG, mergeConfigs } from "~/utils/config";
import { isDirectory, isFile, rmDirectory } from "~/utils/fs-utils";
import {
  generateMessagesFile,
  generateOutDirs,
  generateSchemaFile,
  OUT_DIR,
  TYPES_DECLARATION_FILE,
} from "./generateDistFiles";

const LOCALIZED_DIR = `.generate-dist-files-test`;

const typesDeclarationFileContent = `
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./.next-globe-gen/schema.ts" />
/// <reference path="./.next-globe-gen/messages.ts" />
`.trimStart();

function cleanOutDirs() {
  rmDirectory(OUT_DIR);
  rmDirectory(LOCALIZED_DIR);
  rmSync(TYPES_DECLARATION_FILE);
}

describe("generateOutDirs()", () => {
  afterEach(() => {
    cleanOutDirs();
  });

  test("works correctly", () => {
    generateOutDirs(LOCALIZED_DIR);
    expect(isDirectory(OUT_DIR)).toBe(true);
    expect(isFile(path.join(OUT_DIR, ".gitignore"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, ".gitignore")).toString()).toBe("*");
    expect(isDirectory(LOCALIZED_DIR)).toBe(true);
    expect(isFile(path.join(LOCALIZED_DIR, ".gitignore"))).toBe(true);
    expect(
      readFileSync(path.join(LOCALIZED_DIR, ".gitignore")).toString(),
    ).toBe("*");
    expect(isFile(TYPES_DECLARATION_FILE)).toBe(true);
    expect(readFileSync(TYPES_DECLARATION_FILE).toString()).toBe(
      typesDeclarationFileContent,
    );
  });
});

const expectedSchemaFileContents = (
  prefixDefaultLocale?: boolean,
  includeEnUS?: boolean,
) => {
  const locales = includeEnUS
    ? '[\n\t\t"en-US",\n\t\t"fi",\n\t\t"en"\n\t]'
    : '[\n\t\t"fi",\n\t\t"en"\n\t]';
  const defaultLocale = includeEnUS ? '""' : '"fi"';
  const prefix = prefixDefaultLocale ? "/fi" : "";
  const unPrefixedLocales = prefixDefaultLocale ? "[]" : '[\n\t\t"fi"\n\t]';
  const domains = includeEnUS
    ? `
	"domains": [
		{
			"domain": "fi.example.com",
			"locales": [
				"fi"
			],
			"defaultLocale": "fi"
		},
		{
			"domain": "en.example.com",
			"locales": [
				"en",
				"en-US"
			],
			"defaultLocale": "en",
			"prefixDefaultLocale": true
		}
	],`
    : "";
  return `
export const schema = {
	"locales": ${locales},
	"defaultLocale": ${defaultLocale},
	"unPrefixedLocales": ${unPrefixedLocales},${domains}
	"routes": {
		"/": {${
      includeEnUS
        ? `
			"en-US": "/en-US",`
        : ""
    }
			"en": "/en",
			"fi": "${prefix || "/"}"
		},
		"/about": {${
      includeEnUS
        ? `
			"en-US": "/en-US/about-the-site",`
        : ""
    }
			"en": "/en/about-the-site",
			"fi": "${prefix}/tietoa-sivustosta"
		},
		"/feed": {${
      includeEnUS
        ? `
			"en-US": "/en-US/feed",`
        : ""
    }
			"en": "/en/feed",
			"fi": "${prefix}/syote"
		},
		"/images": {${
      includeEnUS
        ? `
			"en-US": "/en-US/images",`
        : ""
    }
			"en": "/en/images",
			"fi": "${prefix}/kuvat"
		},
		"/privacy-policy": {${
      includeEnUS
        ? `
			"en-US": "/en-US/privacy-policy",`
        : ""
    }
			"en": "/en/privacy-policy",
			"fi": "${prefix}/tietosuojaseloste"
		},
		"/feed/images/[id]": {${
      includeEnUS
        ? `
			"en-US": "/en-US/feed/images/:id",`
        : ""
    }
			"en": "/en/feed/images/:id",
			"fi": "${prefix}/syote/kuvat/:id"
		},
		"/images/[id]": {${
      includeEnUS
        ? `
			"en-US": "/en-US/images/:id",`
        : ""
    }
			"en": "/en/images/:id",
			"fi": "${prefix}/kuvat/:id"
		},
		"/[...catchAll]": {${
      includeEnUS
        ? `
			"en-US": "/en-US/*catchAll",`
        : ""
    }
			"en": "/en/*catchAll",
			"fi": "${prefix}/*catchAll"
		}
	}
} as const;

declare module "next-globe-gen" {
	interface SchemaRegister {
		schema: typeof schema
	}
}
`.trimStart();
};

describe("generateSchemaFile()", () => {
  beforeEach(() => {
    generateOutDirs(LOCALIZED_DIR);
  });

  afterEach(() => {
    cleanOutDirs();
  });

  test("works correctly with prefixDefaultLocale: true", () => {
    const prefixDefaultLocale = true;
    generateSchemaFile(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
        prefixDefaultLocale,
      }),
      getExpectedOriginRoutes(prefixDefaultLocale),
    );
    expect(isFile(path.join(OUT_DIR, "schema.ts"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, "schema.ts")).toString()).toBe(
      expectedSchemaFileContents(prefixDefaultLocale),
    );
  });

  test("works correctly with prefixDefaultLocale: false", () => {
    const prefixDefaultLocale = false;
    generateSchemaFile(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
        prefixDefaultLocale,
      }),
      getExpectedOriginRoutes(prefixDefaultLocale),
    );
    expect(isFile(path.join(OUT_DIR, "schema.ts"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, "schema.ts")).toString()).toBe(
      expectedSchemaFileContents(prefixDefaultLocale),
    );
  });

  test("works correctly with domains config", () => {
    const prefixFinnishLocale = false;
    const includeEnUS = true;
    generateSchemaFile(
      mergeConfigs(DEFAULT_CONFIG, {
        domains: [
          {
            domain: "fi.example.com",
            locales: ["fi"],
            defaultLocale: "fi",
          },
          {
            domain: "en.example.com",
            locales: ["en", "en-US"],
            defaultLocale: "en",
            prefixDefaultLocale: true,
          },
        ],
      }),
      getExpectedOriginRoutes(prefixFinnishLocale, includeEnUS),
    );
    expect(isFile(path.join(OUT_DIR, "schema.ts"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, "schema.ts")).toString()).toBe(
      expectedSchemaFileContents(prefixFinnishLocale, includeEnUS),
    );
  });
});

const expectedMessagesFileContents = `
export const messages = {
	"fi": {
		"hello.world": "Hei maailma",
		"hello.name": "Hei {name}",
		"projects": "{count, plural, =0 {Ei projekteja} one {Yksi projekti} other {# projektia}}",
		"message": "Ei nimiavaruutta viesti",
		"namespace.message": "Nimiavaruus viesti"
	},
	"en": {
		"hello.world": "Hello world",
		"hello.name": "Hello {name}",
		"projects": "{count, plural, =0 {No project} one {One project} other {# projects}}",
		"message": "No namespace message",
		"namespace.message": "Namespaced message"
	}
} as const;

export const clientMessages = messages;

declare module "next-globe-gen" {
	interface MessagesRegister {
		messages: typeof messages
	}
}
`.trimStart();

const expectedClientFilteredMessagesFileContents = `
export const serverOnlyMessages = {
	"fi": {
		"hello.world": "Hei maailma",
		"hello.name": "Hei {name}",
		"projects": "{count, plural, =0 {Ei projekteja} one {Yksi projekti} other {# projektia}}",
		"message": "Ei nimiavaruutta viesti"
	},
	"en": {
		"hello.world": "Hello world",
		"hello.name": "Hello {name}",
		"projects": "{count, plural, =0 {No project} one {One project} other {# projects}}",
		"message": "No namespace message"
	}
} as const;

export const clientMessages = {
	"fi": {
		"namespace.message": "Nimiavaruus viesti"
	},
	"en": {
		"namespace.message": "Namespaced message"
	}
} as const;

export const messages = {
	"fi": { ...serverOnlyMessages["fi"], ...clientMessages["fi"] },
	"en": { ...serverOnlyMessages["en"], ...clientMessages["en"] }
} as const;

declare module "next-globe-gen" {
	interface MessagesRegister {
		messages: typeof messages
	}
}
`.trimStart();

const expectedEmptyClientKeysFilteredMessagesFileContents = `
export const serverOnlyMessages = {
	"fi": {
		"hello.world": "Hei maailma",
		"hello.name": "Hei {name}",
		"projects": "{count, plural, =0 {Ei projekteja} one {Yksi projekti} other {# projektia}}",
		"message": "Ei nimiavaruutta viesti",
		"namespace.message": "Nimiavaruus viesti"
	},
	"en": {
		"hello.world": "Hello world",
		"hello.name": "Hello {name}",
		"projects": "{count, plural, =0 {No project} one {One project} other {# projects}}",
		"message": "No namespace message",
		"namespace.message": "Namespaced message"
	}
} as const;

export const clientMessages = {
	"fi": {},
	"en": {}
} as const;

export const messages = {
	"fi": { ...serverOnlyMessages["fi"], ...clientMessages["fi"] },
	"en": { ...serverOnlyMessages["en"], ...clientMessages["en"] }
} as const;

declare module "next-globe-gen" {
	interface MessagesRegister {
		messages: typeof messages
	}
}
`.trimStart();

describe("generateMessagesFile()", () => {
  beforeEach(() => {
    generateOutDirs(LOCALIZED_DIR);
  });

  afterEach(() => {
    cleanOutDirs();
  });

  test("works correctly", async () => {
    await generateMessagesFile(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
        messages: {
          originDir: "./src/__mocks__/messages",
        },
      }),
    );
    expect(isFile(path.join(OUT_DIR, "messages.ts"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, "messages.ts")).toString()).toBe(
      expectedMessagesFileContents,
    );
  });

  test("filters client messages correctly", async () => {
    await generateMessagesFile(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
        messages: {
          originDir: "./src/__mocks__/messages",
          clientKeys: /namespace\./,
        },
      }),
    );
    expect(isFile(path.join(OUT_DIR, "messages.ts"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, "messages.ts")).toString()).toBe(
      expectedClientFilteredMessagesFileContents,
    );
  });

  test("empty clientKeys array works correctly", async () => {
    await generateMessagesFile(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
        messages: {
          originDir: "./src/__mocks__/messages",
          clientKeys: [],
        },
      }),
    );
    expect(isFile(path.join(OUT_DIR, "messages.ts"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, "messages.ts")).toString()).toBe(
      expectedEmptyClientKeysFilteredMessagesFileContents,
    );
  });
});
