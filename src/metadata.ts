import { type } from 'arktype';

import { exportType } from "./type-util.js";
import { checkIsRecord } from "./scalar.js";

export const MetadataResource = exportType(type({
    "author?": "string",
    "path?": "string",
}).onUndeclaredKey('ignore').narrow(checkIsRecord));
export type MetadataResource = typeof MetadataResource.infer;

export const Metadata = exportType(type({
    "title?": "string",
    "music?": MetadataResource,
    "chart?": MetadataResource,
    "jacket?": MetadataResource,
}).onUndeclaredKey('ignore').narrow(checkIsRecord));
export type Metadata = typeof Metadata.infer;