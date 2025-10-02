import { type } from 'arktype';

export const Header = type({
    "version?": "string",
    "editor?": "string",
    "game?": "string",
}).onUndeclaredKey('ignore');

export type Header = typeof Header.infer;
