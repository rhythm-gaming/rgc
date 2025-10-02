import { type } from 'arktype';

function IntLike(min_value: number, max_value: number) {
    return type(`${min_value} <= number.integer <= ${max_value}`).or(
        // Gracefully accept strings and bigints.
        type("string.integer.parse|bigint").pipe((v, ctx) => {
            if(typeof v === 'bigint') {
                v = Number(v);
            }

            if(!Number.isSafeInteger(v) || !(min_value <= v && v <= max_value)) {
                return ctx.error(`value out of range (${min_value} .. ${max_value})`);
            }

            return v;
        })
    );
}

export const U8 = IntLike(0, 255);
export type U8 = typeof U8.infer;

export const U16 = IntLike(0, 65535);
export type U16 = typeof U16.infer;

export const I32 = IntLike(-2147483648, 2147483647);
export type I32 = typeof I32.infer;

export const U64 = type("bigint | (number.safe & number.integer) >= 0 | string.numeric").pipe((v, ctx) => {
    if(typeof v === 'string') {
        try {
            v = BigInt(v);
        } catch(e) {
            return ctx.error(e as Error);
        }
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

/**
 * `Tick`, but disallows string representations of integers.
 */
export const NumberTick = type("bigint | (number.safe & number.integer >= 0)").pipe((v, ctx) => {
    if(typeof v === 'number') {
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

export const Coord = F64;
export type Coord = typeof Coord.infer;

export function isRecord(v: unknown): v is Record<string, unknown> {
    return v != null && (typeof v === 'object') && !Array.isArray(v);
}

export const Property = type({"[string]": "unknown"}).narrow(isRecord);
export type Property = typeof Property.infer;