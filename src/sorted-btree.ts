export type * from 'sorted-btree';

// https://github.com/qwertie/btree-typescript/issues/36
import { default as BTree_ } from 'sorted-btree';
export const BTree = (BTree_ as unknown as {default: typeof BTree_}).default;