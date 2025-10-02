import { type } from 'arktype';
import { isRecord } from "./scalar.js";

export const MetadataResource = type({
    "author?": "string",
    "path?": "string",
}).onUndeclaredKey('ignore').narrow(isRecord);
export type MetadataResource = typeof MetadataResource.infer;

export const Metadata = type({
    "title?": "string",
    "music?": MetadataResource,
    "chart?": MetadataResource,
    "jacket?": MetadataResource,
}).onUndeclaredKey('ignore').narrow(isRecord);
export type Metadata = typeof Metadata.infer;
