import { type } from 'arktype';
import { isRecord } from "./scalar.js";

export const Header = type({
    "version?": "string",
    "editor?": "string",
    "game?": "string",
}).onUndeclaredKey('ignore').narrow(isRecord);

export type Header = typeof Header.infer;
