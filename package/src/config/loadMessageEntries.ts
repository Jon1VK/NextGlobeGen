import { readdirSync, readFileSync } from "fs";
import path from "path";
import { isMap, isScalar, parseDocument, YAMLMap, type ParsedNode } from "yaml";
import { isDirectory, isFile } from "~/utils/fs-utils";
import { flatten } from "~/utils/obj-utils";
import { FILE_EXTENSIONS } from "./config";
import type { MessageEntry, MessagesConfig } from "./types";

export function loadMessageEntries(
  this: MessagesConfig,
  locale: string,
): MessageEntry[] {
  const messagesMap = new Map<string, MessageEntry>();
  loadRootMessageEntries.bind(this)(locale, messagesMap);
  const dirPath = path.join(this.originDir, locale);
  loadDirMessageEntries(dirPath, messagesMap);
  return messagesMap.values().toArray();
}

function loadRootMessageEntries(
  this: MessagesConfig,
  locale: string,
  messagesMap: Map<string, MessageEntry>,
) {
  FILE_EXTENSIONS.forEach((extension) => {
    const filePath = path.join(this.originDir, `${locale}${extension}`);
    if (!isFile(filePath)) return;
    loadFileMessageEntries(filePath, messagesMap);
  });
}

function loadDirMessageEntries(
  dirPath: string,
  messagesMap: Map<string, MessageEntry>,
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
  messageFiles?.forEach((file) => {
    const filePath = path.join(dirPath, file.name);
    const extension = path.extname(file.name);
    const fileName = file.name.replace(extension, "");
    const namespace = (() => {
      if (fileName === "index") return ns;
      return ns ? `${ns}.${fileName}` : fileName;
    })();
    loadFileMessageEntries(filePath, messagesMap, namespace);
  });
  subDirs?.forEach((subDir) => {
    const nestedDirPath = path.join(dirPath, subDir.name);
    const namespace = ns ? `${ns}.${subDir.name}` : subDir.name;
    loadDirMessageEntries(nestedDirPath, messagesMap, namespace);
  });
}

function loadFileMessageEntries(
  filePath: string,
  messagesMap: Map<string, MessageEntry>,
  namespace?: string,
) {
  const content = readFileSync(filePath).toString();
  const extension = path.extname(filePath);
  if (extension === ".json") {
    loadJsonMessageEntries(content, messagesMap, namespace);
  } else {
    loadYamlMessageEntries(content, messagesMap, namespace);
  }
}

function loadJsonMessageEntries(
  content: string,
  messagesMap: Map<string, MessageEntry>,
  namespace?: string,
) {
  const parsed = JSON.parse(content);
  const flattened = flatten(parsed);
  Object.entries(flattened).forEach(([namespaceKey, message]) => {
    const key = namespace ? `${namespace}.${namespaceKey}` : namespaceKey;
    messagesMap.set(key, { key, message });
  });
}

function loadYamlMessageEntries(
  content: string,
  messagesMap: Map<string, MessageEntry>,
  namespace?: string,
) {
  const doc = parseDocument(content);
  if (!isMap(doc.contents)) return;
  getYamlMessageEntriesFromMap(doc.contents, messagesMap, namespace);
}

function getYamlMessageEntriesFromMap(
  map: YAMLMap.Parsed<ParsedNode, ParsedNode | null>,
  messagesMap: Map<string, MessageEntry>,
  namespace?: string,
) {
  map.items.forEach((item, i) => {
    if (!isScalar(item.key) || typeof item.key.value !== "string") return;
    if (isMap(item.value)) {
      const nestedNamespace = namespace
        ? `${namespace}.${item.key.value}`
        : item.key.value;
      getYamlMessageEntriesFromMap(item.value, messagesMap, nestedNamespace);
    }
    if (!isScalar(item.value) || typeof item.value.value !== "string") return;
    const key = namespace ? `${namespace}.${item.key.value}` : item.key.value;
    const message = item.value.value;
    const description =
      i === 0 ? map.commentBefore?.trim() : item.key.commentBefore?.trim();
    messagesMap.set(key, { key, message, description });
  });
}
