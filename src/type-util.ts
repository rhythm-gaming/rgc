import type { Type, Out } from 'arktype';

export type PublicType<T> = Type<(In: unknown) => Out<T>>;
export function exportType<T extends Type>(t: T): PublicType<T['inferOut']> { return t as never; }