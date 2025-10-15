import { type, type Traversal } from 'arktype';
import { exportType, type PublicType } from "./type-util.js";

function IntLike(min_value: number, max_value: number): PublicType<number> {
    return exportType(type(`${min_value} <= number.integer <= ${max_value}`).or(
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
    ));
}

export type U8 = number;
export const U8: PublicType<U8> = IntLike(0, 255);

export type U16 = number;
export const U16: PublicType<U16> = IntLike(0, 65535);

export type I32 = number;
export const I32: PublicType<I32> = IntLike(-2147483648, 2147483647);

export type U64 = bigint;
export const U64: PublicType<U64> = exportType(type("bigint | (number.safe & number.integer) >= 0 | string.numeric").pipe((v, ctx) => {
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
}));

export type F64 = number;
export const F64: PublicType<F64> = exportType(type("number | string.numeric.parse").narrow((v, ctx) => Number.isFinite(v) || ctx.mustBe("finite")));

export type Tick = U64;
export const Tick: PublicType<Tick> = U64;

/**
 * `Tick`, but disallows string representations of integers.
 */
export const NumberTick: PublicType<Tick> = exportType(type("bigint | (number.safe & number.integer >= 0)").pipe((v, ctx) => {
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
}));

export type Coord = F64;
export const Coord: PublicType<Coord> = F64;

function isRecord(v: unknown): v is Record<string, unknown> {
    return v != null && (typeof v === 'object') && !Array.isArray(v);
}

export function checkIsRecord(v: unknown, ctx: Traversal): v is Record<string, unknown> {
    return isRecord(v) || ctx.mustBe("a record");
}

export type Property = Record<string, unknown>;
export const Property: PublicType<Property> = exportType(type({"[string]": "unknown"}).narrow(checkIsRecord));