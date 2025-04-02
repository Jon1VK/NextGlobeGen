import { existsSync, mkdirSync, rmSync, statSync } from "fs";
import path from "path";
import debugLog from "./debug-print";

/**
 * Indicates if a path points to a directory
 */
export function isDirectory(path: string) {
  debugLog(`Checking if path is directory: ${path}`);
  if (!existsSync(path)) {
    debugLog(`Path does not exist: ${path}`);
    return false;
  }
  const isDir = statSync(path).isDirectory();
  debugLog(`Path ${path} is ${isDir ? "a directory" : "not a directory"}`);
  return isDir;
}

/**
 * Indicates if a path points to a file
 */
export function isFile(path: string) {
  debugLog(`Checking if path is file: ${path}`);
  if (!existsSync(path)) {
    debugLog(`Path does not exist: ${path}`);
    return false;
  }
  const isFile = statSync(path).isFile();
  debugLog(`Path ${path} is ${isFile ? "a file" : "not a file"}`);
  return isFile;
}

/**
 * Creates a directory if it doesn't exist
 */
export function makeDirectory(dirPath: string) {
  debugLog(`Creating directory: ${dirPath}`);
  if (!existsSync(dirPath)) {
    debugLog(`Directory does not exist, creating: ${dirPath}`);
    mkdirSync(dirPath, { recursive: true });
  } else {
    debugLog(`Directory already exists: ${dirPath}`);
  }
}

/**
 * Removes a directory and its contents
 */
export function rmDirectory(dirPath: string) {
  debugLog(`Removing directory: ${dirPath}`);
  if (existsSync(dirPath)) {
    debugLog(`Directory exists, removing: ${dirPath}`);
    rmSync(dirPath, { recursive: true, force: true });
  } else {
    debugLog(`Directory does not exist: ${dirPath}`);
  }
}

/**
 * Guarantees that a path uses posix separator
 */
export function toPosixPath(s: string) {
  return s.replaceAll(path.sep, path.posix.sep);
}
