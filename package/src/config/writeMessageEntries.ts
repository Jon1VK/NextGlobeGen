import { readdirSync, rmSync, writeFileSync } from "fs";
import {
  po,
  type GetTextTranslationRecord,
  type GetTextTranslations,
} from "gettext-parser";
import path from "path";
import { Document, isMap, isScalar } from "yaml";
import { isDirectory, isFile } from "~/utils/fs-utils";
import { unflatten } from "~/utils/obj-utils";
import { FILE_EXTENSIONS } from "./config";
import type { MessageEntry, MessagesConfig } from "./types";

export function writeMessageEntries(
  this: MessagesConfig,
  locale: string,
  messages: MessageEntry[],
) {
  const messagesMap = new Map(messages.map((msg) => [msg.key, msg]));
  const dirPath = path.join(this.originDir, locale);
  writeMessageEntriesToDir(dirPath, locale, messagesMap);
  writeMessageEntriesToRoot.bind(this)(locale, messagesMap);
}

function writeMessageEntriesToRoot(
  this: MessagesConfig,
  locale: string,
  messagesMap: Map<string, MessageEntry>,
) {
  for (const extension of FILE_EXTENSIONS) {
    const filePath = path.join(this.originDir, `${locale}${extension}`);
    if (!isFile(filePath)) continue;
    writeMessageEntriesToFile(filePath, locale, messagesMap);
    return;
  }
  const defaultFilePath = path.join(this.originDir, `${locale}.json`);
  writeMessageEntriesToFile(defaultFilePath, locale, messagesMap);
}

function writeMessageEntriesToDir(
  dirPath: string,
  locale: string,
  messages: Map<string, MessageEntry>,
  ns?: string,
) {
  if (!isDirectory(dirPath)) return;
  const files = readdirSync(dirPath, { withFileTypes: true });
  const { subDirs, messageFiles } = Object.groupBy(files, (file) => {
    if (file.isDirectory()) return "subDirs";
    if (!file.isFile()) return "skip";
    const extension = path.extname(file.name);
    if (!FILE_EXTENSIONS.includes(extension)) return "skip";
    return "messageFiles";
  });
  subDirs?.forEach((subDir) => {
    const nestedDirPath = path.join(dirPath, subDir.name);
    const namespace = ns ? `${ns}.${subDir.name}` : subDir.name;
    writeMessageEntriesToDir(nestedDirPath, locale, messages, namespace);
  });
  messageFiles?.forEach((file) => {
    const filePath = path.join(dirPath, file.name);
    const extension = path.extname(file.name);
    const fileName = file.name.replace(extension, "");
    const namespace = (() => {
      if (fileName === "index") return ns;
      return ns ? `${ns}.${fileName}` : fileName;
    })();
    writeMessageEntriesToFile(filePath, locale, messages, namespace);
  });
}

function writeMessageEntriesToFile(
  filePath: string,
  locale: string,
  messages: Map<string, MessageEntry>,
  namespace?: string,
) {
  const namespaceMessages = messages
    .values()
    .filter((msg) => (namespace ? msg.key.startsWith(`${namespace}.`) : true))
    .map((msg) => {
      messages.delete(msg.key);
      return namespace
        ? { ...msg, key: msg.key.replace(`${namespace}.`, "") }
        : msg;
    })
    .toArray();
  if (namespaceMessages.length === 0) {
    try {
      rmSync(filePath);
    } catch (_) {
      /* empty */
    }
    return;
  }
  const extension = path.extname(filePath);
  const content = (() => {
    switch (extension) {
      case ".json":
        return getJsonContent(namespaceMessages);
      case ".yml":
      case ".yaml":
        return getYamlContent(namespaceMessages);
      case ".po":
        return getPoContent(namespaceMessages, locale);
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
  })();
  writeFileSync(filePath, content);
}

function getJsonContent(messages: MessageEntry[]) {
  const jsonMessages = unflatten(
    Object.fromEntries(messages.map((msg) => [msg.key, msg.message])),
  );
  return JSON.stringify(jsonMessages, null, 2);
}

function getYamlContent(messages: MessageEntry[]) {
  const yamlMessages = unflatten(
    Object.fromEntries(messages.map((msg) => [msg.key, msg.message])),
  );
  const doc = new Document(yamlMessages);
  messages.forEach((msg) => {
    if (!msg.description) return;
    const keyPath = msg.key.split(".");
    const parentPath = keyPath.slice(0, -1);
    const lastKey = keyPath.at(-1)!;
    const parent = parentPath.length
      ? doc.getIn(parentPath, true)
      : doc.contents;
    if (!isMap(parent)) return;
    const pair = parent.items.find(
      (item) => isScalar(item.key) && item.key.value === lastKey,
    );
    if (isScalar(pair?.key)) pair.key.commentBefore = ` ${msg.description}`;
  });
  return doc.toString({ lineWidth: 0 });
}

function getPoContent(messages: MessageEntry[], locale: string) {
  const headersMessage = messages.find((msg) => msg.key === "")?.message;
  const existingHeaders = headersMessage
    ? po.parse(`msgid ""\nmsgstr "${headersMessage}"`).headers
    : {};
  const headers: GetTextTranslations["headers"] = {
    Language: locale,
    "POT-Creation-Date": new Date().toISOString(),
    "X-Generator": "NextGlobeGen (https://next-globe-gen.dev)",
    "MIME-Version": "1.0",
    "Content-Type": "text/plain; charset=UTF-8",
    "Content-Transfer-Encoding": "8bit",
    ...existingHeaders,
  };
  const translations: GetTextTranslationRecord = {
    "": Object.fromEntries(
      messages.map((msg) => [
        msg.key,
        {
          msgid: msg.key,
          msgstr: [msg.message],
          comments: { extracted: msg.description },
        },
      ]),
    ),
  };
  return po
    .compile({ charset: "UTF-8", headers, translations }, { foldLength: 0 })
    .toString();
}
