import { readFileSync } from "fs";
import path from "path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { getExpectedOriginRoutes } from "~/__mocks__/getExpectedOriginRoutes";
import { DEFAULT_CONFIG } from "~/config";
import { mergeConfigs } from "~/config/utils";
import { isDirectory, isFile, rmDirectory } from "~/utils/fs-utils";
import {
  generateLocalizedDir,
  generateMessagesFiles,
  generateOutDir,
  generateSchemaFiles,
  OUT_DIR,
} from "./generateDistFiles";

const LOCALIZED_DIR = `.generate-dist-files-test`;

function cleanOutDirs() {
  rmDirectory(OUT_DIR);
  rmDirectory(LOCALIZED_DIR);
}

describe("generateOutDir()", () => {
  afterEach(() => {
    cleanOutDirs();
  });

  test("works correctly", () => {
    generateOutDir();
    expect(isDirectory(OUT_DIR)).toBe(true);
    expect(isFile(path.join(OUT_DIR, ".gitignore"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, ".gitignore")).toString()).toBe("*");
  });
});

describe("generateLocalizedDir()", () => {
  afterEach(() => {
    cleanOutDirs();
  });

  test("works correctly", () => {
    generateLocalizedDir(LOCALIZED_DIR);
    expect(isDirectory(LOCALIZED_DIR)).toBe(true);
    expect(isFile(path.join(LOCALIZED_DIR, ".gitignore"))).toBe(true);
    expect(
      readFileSync(path.join(LOCALIZED_DIR, ".gitignore")).toString(),
    ).toBe("*");
  });
});

const expectedSchemaFileContents = ({
  prefixDefaultLocale,
  includeEnUS,
  includeFormats,
}: {
  prefixDefaultLocale?: boolean;
  includeEnUS?: boolean;
  includeFormats?: boolean;
} = {}) => {
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
  const formats = includeFormats
    ? `
	"formats": {
		"number": {
			"rounded_two": {
				"maximumFractionDigits": 2,
				"minimumFractionDigits": 2
			}
		}
	},`
    : "";
  return `
export const schema = {
	"locales": ${locales},
	"defaultLocale": ${defaultLocale},
	"unPrefixedLocales": ${unPrefixedLocales},${domains}${formats}
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
`.trimStart();
};

const expectedSchemaAugmentationFileContents = `
import type { schema } from "./schema";

declare module "next-globe-gen" {
	interface SchemaRegister {
		schema: typeof schema;
	}
}
`.trimStart();

describe("generateSchemaFile()", () => {
  beforeEach(() => {
    generateOutDir();
  });

  afterEach(() => {
    cleanOutDirs();
  });

  test("works correctly with prefixDefaultLocale: true", () => {
    const prefixDefaultLocale = true;
    generateSchemaFiles(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
        prefixDefaultLocale,
      }),
      getExpectedOriginRoutes(prefixDefaultLocale),
    );
    expect(isFile(path.join(OUT_DIR, "schema.ts"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, "schema.ts")).toString()).toBe(
      expectedSchemaFileContents({ prefixDefaultLocale }),
    );
    expect(isFile(path.join(OUT_DIR, "schema.augmentation.ts"))).toBe(true);
    expect(
      readFileSync(path.join(OUT_DIR, "schema.augmentation.ts")).toString(),
    ).toBe(expectedSchemaAugmentationFileContents);
  });

  test("works correctly with prefixDefaultLocale: false", () => {
    const prefixDefaultLocale = false;
    generateSchemaFiles(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
        prefixDefaultLocale,
      }),
      getExpectedOriginRoutes(prefixDefaultLocale),
    );
    expect(isFile(path.join(OUT_DIR, "schema.ts"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, "schema.ts")).toString()).toBe(
      expectedSchemaFileContents({ prefixDefaultLocale }),
    );
  });

  test("works correctly with domains config", () => {
    const prefixDefaultLocale = false;
    const includeEnUS = true;
    generateSchemaFiles(
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
      getExpectedOriginRoutes(prefixDefaultLocale, includeEnUS),
    );
    expect(isFile(path.join(OUT_DIR, "schema.ts"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, "schema.ts")).toString()).toBe(
      expectedSchemaFileContents({ prefixDefaultLocale, includeEnUS }),
    );
  });

  test("includes custom format options correctly", () => {
    const prefixDefaultLocale = true;
    generateSchemaFiles(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
        prefixDefaultLocale,
        messages: {
          formats: {
            number: {
              rounded_two: {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              },
            },
          },
        },
      }),
      getExpectedOriginRoutes(prefixDefaultLocale),
    );
    expect(isFile(path.join(OUT_DIR, "schema.ts"))).toBe(true);
    expect(readFileSync(path.join(OUT_DIR, "schema.ts")).toString()).toBe(
      expectedSchemaFileContents({ prefixDefaultLocale, includeFormats: true }),
    );
  });
});

const expectedMessagesFileContents = `
export const messages = {
	"fi": {
		"hello": {
			"world": "Hei maailma",
			"name": "Hei {name}"
		},
		"projects": "{count, plural, =0 {Ei projekteja} one {Yksi projekti} other {# projektia}}",
		"message": "Ei nimiavaruutta viesti",
		"namespace": {
			"message": "Nimiavaruus viesti"
		}
	},
	"en": {
		"hello": {
			"world": "Hello world",
			"name": "Hello {name}"
		},
		"projects": "{count, plural, =0 {No project} one {One project} other {# projects}}",
		"message": "No namespace message",
		"namespace": {
			"message": "Namespaced message"
		}
	}
} as const;

export const clientMessages = {
	"fi": {
		"hello": {
			"world": "Hei maailma",
			"name": "Hei {name}"
		},
		"projects": "{count, plural, =0 {Ei projekteja} one {Yksi projekti} other {# projektia}}",
		"message": "Ei nimiavaruutta viesti",
		"namespace": {
			"message": "Nimiavaruus viesti"
		}
	},
	"en": {
		"hello": {
			"world": "Hello world",
			"name": "Hello {name}"
		},
		"projects": "{count, plural, =0 {No project} one {One project} other {# projects}}",
		"message": "No namespace message",
		"namespace": {
			"message": "Namespaced message"
		}
	}
} as const;
`.trimStart();

const expectedMessagesAugmentationFileContents = `
import type { messages } from "./messages";

type MessagesParams = {
	"hello": {
		"name": {
			"name": string
		}
	},
	"projects": {
		"count": number
	}
};

declare module "next-globe-gen" {
	interface MessagesRegister {
		messages: typeof messages;
		messagesParams: MessagesParams;
	}
}
`.trimStart();

const expectedClientFilteredMessagesFileContents = `
export const messages = {
	"fi": {
		"hello": {
			"world": "Hei maailma",
			"name": "Hei {name}"
		},
		"projects": "{count, plural, =0 {Ei projekteja} one {Yksi projekti} other {# projektia}}",
		"message": "Ei nimiavaruutta viesti",
		"namespace": {
			"message": "Nimiavaruus viesti"
		}
	},
	"en": {
		"hello": {
			"world": "Hello world",
			"name": "Hello {name}"
		},
		"projects": "{count, plural, =0 {No project} one {One project} other {# projects}}",
		"message": "No namespace message",
		"namespace": {
			"message": "Namespaced message"
		}
	}
} as const;

export const clientMessages = {
	"fi": {
		"namespace": {
			"message": "Nimiavaruus viesti"
		}
	},
	"en": {
		"namespace": {
			"message": "Namespaced message"
		}
	}
} as const;
`.trimStart();

const expectedEmptyClientKeysFilteredMessagesFileContents = `
export const messages = {
	"fi": {
		"hello": {
			"world": "Hei maailma",
			"name": "Hei {name}"
		},
		"projects": "{count, plural, =0 {Ei projekteja} one {Yksi projekti} other {# projektia}}",
		"message": "Ei nimiavaruutta viesti",
		"namespace": {
			"message": "Nimiavaruus viesti"
		}
	},
	"en": {
		"hello": {
			"world": "Hello world",
			"name": "Hello {name}"
		},
		"projects": "{count, plural, =0 {No project} one {One project} other {# projects}}",
		"message": "No namespace message",
		"namespace": {
			"message": "Namespaced message"
		}
	}
} as const;

export const clientMessages = {
	"fi": {},
	"en": {}
} as const;
`.trimStart();

describe("generateMessagesFile()", () => {
  beforeEach(() => {
    generateOutDir();
  });

  afterEach(() => {
    cleanOutDirs();
  });

  test("works correctly", async () => {
    await generateMessagesFiles(
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
    expect(isFile(path.join(OUT_DIR, "messages.augmentation.ts"))).toBe(true);
    expect(
      readFileSync(path.join(OUT_DIR, "messages.augmentation.ts")).toString(),
    ).toBe(expectedMessagesAugmentationFileContents);
  });

  test("filters client messages correctly", async () => {
    await generateMessagesFiles(
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
    await generateMessagesFiles(
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
