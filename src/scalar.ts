import { type } from 'arktype';

export const U8 = type("0 <= number.integer <= 255");
export type U8 = typeof U8.infer;

export const U16 = type("0 <= number.integer <= 65535");
export type U16 = typeof U16.infer;

export const I32 = type("-2147483648 <= number.integer <= 21483647");
export type I32 = typeof I32.infer;

export const U64 = type("bigint | number.safe >= 0 | string.numeric").pipe((v, ctx) => {
    if(typeof v === 'string') {
        v = BigInt(v);
    } else if(typeof v === 'number') {
        if(!Number.isSafeInteger(v)) {
            return ctx.error("Value out of range!");
        }
        v = BigInt(v);
    }
    
    if(v < 0) {
        return ctx.error("Value out of range!");
    }

    return v;
});

export type U64 = typeof U64.infer;
export type RawU64 = typeof U64.inferIn;

export const F64 = type("number | string.numeric.parse").narrow((v, ctx) => Number.isFinite(v) || ctx.mustBe("finite"));
export type F64 = typeof F64.infer;

export const Tick = U64;
export type Tick = typeof Tick.infer;

export const Property = type("object");
export type Property = typeof Property.infer;