import { readdirSync, rmSync, writeFileSync } from "fs";
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
  writeMessageEntriesToDir(dirPath, messagesMap);
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
    writeMessageEntriesToFile(filePath, messagesMap);
    return;
  }
  const defaultFilePath = path.join(this.originDir, `${locale}.json`);
  writeMessageEntriesToFile(defaultFilePath, messagesMap);
}

function writeMessageEntriesToDir(
  dirPath: string,
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
    writeMessageEntriesToDir(nestedDirPath, messages, namespace);
  });
  messageFiles?.forEach((file) => {
    const filePath = path.join(dirPath, file.name);
    const extension = path.extname(file.name);
    const fileName = file.name.replace(extension, "");
    const namespace = (() => {
      if (fileName === "index") return ns;
      return ns ? `${ns}.${fileName}` : fileName;
    })();
    writeMessageEntriesToFile(filePath, messages, namespace);
  });
}

function writeMessageEntriesToFile(
  filePath: string,
  messages: Map<string, MessageEntry>,
  namespace?: string,
) {
  const namespaceMessages = namespace
    ? messages
        .values()
        .filter((msg) => msg.key.startsWith(`${namespace}.`))
        .toArray()
    : messages.values().toArray();
  if (namespaceMessages.length === 0) {
    try {
      rmSync(filePath);
    } catch (_) {
      /* empty */
    }
    return;
  }
  namespaceMessages.forEach((msg) => {
    messages.delete(msg.key);
  });
  const extension = path.extname(filePath);
  const content =
    extension === ".json"
      ? getJsonContent(namespaceMessages)
      : getYamlContent(namespaceMessages);
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
