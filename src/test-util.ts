import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function readTestData(file_path: string) {
    return fs.readFile(new URL(path.join("..", "test", file_path), import.meta.url), 'utf-8');
}