import { type, type Type } from 'arktype';
import { isRecord } from "./scalar.js";

export interface MetadataResource {
    author?: string;
    path?: string;
}

export const MetadataResource: Type<MetadataResource> = type({
    "author?": "string",
    "path?": "string",
}).onUndeclaredKey('ignore').narrow(isRecord);

export interface Metadata {
    title?: string;
    music?: MetadataResource;
    chart?: MetadataResource;
    jacket?: MetadataResource;
}

export const Metadata: Type<Metadata> = type({
    "title?": "string",
    "music?": MetadataResource,
    "chart?": MetadataResource,
    "jacket?": MetadataResource,
}).onUndeclaredKey('ignore').narrow(isRecord);
