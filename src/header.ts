import { type, type Type } from 'arktype';
import { checkIsRecord } from "./scalar.js";

export interface Header {
    version?: string;
    editor?: string;
    game?: string;
}

export const Header: Type<Header> = type({
    "version?": "string",
    "editor?": "string",
    "game?": "string",
}).onUndeclaredKey('ignore').narrow(checkIsRecord);
