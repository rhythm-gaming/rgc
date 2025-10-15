import { type } from 'arktype';

import { exportType } from "./type-util.js";
import { checkIsRecord } from "./scalar.js";

export const Header = exportType(type({
    "version?": "string",
    "editor?": "string",
    "game?": "string",
}).onUndeclaredKey('ignore').narrow(checkIsRecord));
export type Header = typeof Header.infer;