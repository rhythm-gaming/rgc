import { assert } from 'chai';
import { ArkErrors } from 'arktype';

import { U8, U16, I32, U64, F64, Tick } from "./scalar.js";

function testPlainIntType(IntType: (typeof U8|typeof U16|typeof I32), accept_values: number[], reject_values: number[]) {
    it("should accept valid int values", function() {
        for(const v of accept_values) {
            for(const w of [v, `${v}`, BigInt(v)]) {
                const x = IntType(w);
                if(x instanceof ArkErrors) {
                    assert.fail(x.summary);
                }
                assert.strictEqual(x, v, `testing ${typeof w} type of ${v}`);
                assert.doesNotThrow(() => IntType.assert(w));
            }
        }
    });
    it("should reject int values out of range", function() {
        for(const v of reject_values) {
            for(const w of [v, `${v}`, BigInt(v)]) {
                assert.instanceOf(IntType(w), ArkErrors);
                assert.throws(() => IntType.assert(w));
            }
        }
    });
    it("should reject non-integer or non-finite values", function() {
        for(const v of [-0.01, 0.5, 42.1, 255.99, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN]) {
            for(const w of [v, `${v}`]) {
                assert.instanceOf(IntType(w), ArkErrors);
                assert.throws(() => IntType.assert(w));
            }
        }
    });
    it("should reject non-number values", function() {
        for(const v of ["hello", {}, [], true, false, null, undefined]) {
            assert.instanceOf(IntType(v), ArkErrors);
            assert.throws(() => IntType.assert(v));
        }
    });
}

function testUint64Type(Uint64: typeof U64) {
    it("should accept valid uint64 values", function() {
        for(const v of [
            0,
            42,
            Number.MAX_SAFE_INTEGER,
            0n,
            42n,
            BigInt(Number.MAX_SAFE_INTEGER),
            BigInt(Number.MAX_SAFE_INTEGER) + 1n,
            "0",
            "42",
            `${Number.MAX_SAFE_INTEGER}`,
            `${BigInt(Number.MAX_SAFE_INTEGER) + 1n}`,
        ]) {
            const x = Uint64(v);
            if(x instanceof ArkErrors) {
                assert.fail(x.summary);
            }

            assert.strictEqual(x, BigInt(v), `testing ${typeof v} type of ${v}`);
            assert.doesNotThrow(() => Uint64.assert(v));
        }
    });
    
    it("should reject negative values", function() {
        for(const v of [-1, -42, -1n, "-1", "-42"]) {
            assert.instanceOf(Uint64(v), ArkErrors);
            assert.throws(() => Uint64.assert(v));
        }
    });
    
    it("should reject non-integer or non-finite values", function() {
        for(const v of [
            0.5,
            42.1,
            Number.MAX_SAFE_INTEGER + 1,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.NaN,
            "0.5",
            "42.1",
        ]) {
            assert.instanceOf(Uint64(v), ArkErrors);
            assert.throws(() => Uint64.assert(v));
        }
    });

    it("should reject non-number-like values", function() {
        for(const v of ["hello", {}, [], true, false, null, undefined]) {
            assert.instanceOf(Uint64(v), ArkErrors);
            assert.throws(() => Uint64.assert(v));
        }
    });
}

describe("U8", function() {
    const arr = [];
    for(let v=0; v<256; ++v) arr.push(v);

    testPlainIntType(U8, arr, [-42, -1, 256, 1000]);
});

describe("U16", function() {
    testPlainIntType(U16, [0, 42, 1000, 65535], [-42, -1, 65536, 100000]);
});

describe("I32", function() {
    testPlainIntType(I32, [-(2**31), -100, 0, 100, 65536, 2**31-1], [-(2**31)-1, 2**31]);
});

describe("U64", function() {
    testUint64Type(U64);
});

describe("F64", function() {
    it("should accept valid float values", function() {
        for(const v of [
            0,
            -0,
            42,
            -42.5,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            Number.MAX_VALUE,
            Number.MIN_VALUE,
        ]) {
            for(const w of [v, `${v}`]) {
                if(typeof w === 'string' && w.includes("e")) continue;

                const x = F64(w);
                if(x instanceof ArkErrors) {
                    assert.fail(x.summary);
                }

                assert.strictEqual(x, v, `testing ${typeof w} type of ${v}`);
                assert.doesNotThrow(() => F64.assert(w));
            }
        }
    });

    it("should reject non-finite values", function() {
        for(const v of [
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.NaN
        ]) {
            for(const w of [v, `${v}`]) {
                assert.instanceOf(F64(w), ArkErrors);
                assert.throws(() => F64.assert(w));
            }
        }
    });
    
    it("should reject non-number values", function() {
        for(const v of ["hello", {}, [], true, false, null, undefined, 123n]) {
            assert.instanceOf(F64(v), ArkErrors);
            assert.throws(() => F64.assert(v));
        }
    });
});

describe("Tick", function() {
    testUint64Type(Tick);
});