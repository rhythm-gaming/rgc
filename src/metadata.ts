import { type } from 'arktype';

export const MetadataResource = type({
    "author?": "string",
    "path?": "string",
}).onUndeclaredKey('ignore');
export type MetadataResource = typeof MetadataResource.infer;

export const Metadata = type({
    "title?": "string",
    "music?": MetadataResource,
    "chart?": MetadataResource,
    "jacket?": MetadataResource,
}).onUndeclaredKey('ignore');
export type Metadata = typeof Metadata.infer;
