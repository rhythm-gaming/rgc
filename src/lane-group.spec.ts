import { assert } from 'chai';
import { ArkErrors } from 'arktype';

import { Pos, FullNote, Note } from "./lane-group.js";

describe("Pos", function() {
    it("should accept a number", function() {
        assert.deepStrictEqual(Pos(-5), [-5]);
        assert.deepStrictEqual(Pos(0), [0]);
        assert.deepStrictEqual(Pos(3.14), [3.14]);
        assert.deepStrictEqual(Pos("42"), [42]);
        assert.deepStrictEqual(Pos(123), [123]);
    });

    it("should accept an empty array", function() {
        assert.deepStrictEqual(Pos([]), [])
    });

    it("should not accept invalid values", function() {
        for(const v of [
            null, undefined, true, false, "", "foo",
            Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN,
            {}, () => {}, Symbol('123'),
        ]) {
            for(const w of [v, [v], [0, v]]) {
                assert.instanceOf(Pos(w), ArkErrors);
                assert.throws(() => Pos.assert(w));
            }
        }
    });
});

describe("FullNote", function() {
    it("should accept simple values", function() {
        for(const v of [
            {t: 123n},
            {t: 123n, id: "foo", k: "bar", l: 456n, v: [], w: [], p: {x: true, y: false, z: [1, 2, 3]}}
        ]) {
            assert.deepStrictEqual(FullNote(v), v);
        }
    });

    it("should not accept invalid values", function() {
        for(const v of [
            null, undefined, true, false, "", "foo", 123,
            [], {}, () => {}, Symbol('foo'),
        ]) {
            assert.instanceOf(FullNote(v), ArkErrors);
            assert.throws(() => FullNote.assert(v));
        }
    });
});

describe("Note", function() {
    it("should accept scalar time values", function() {
        assert.deepStrictEqual(Note(123), {t: 123n});
        assert.deepStrictEqual(Note("4567"), {t: 4567n});
    });

    it("should accept a tuple of time and length", function() {
        assert.deepStrictEqual(Note([123, 456]), {t: 123n, l: 456n});
    });

    it("should accept a tuple of time, length, and positions", function() {});

    it("should accept a tuple of note values", function() {});

    it("should accept a note object", function() {});

    it("should not accept invalid values", function() {
        for(const v of [
            "", "hello",
            ["123"], ["123, 456"],
            {},
        ]) {
            assert.instanceOf(Note(v), ArkErrors);
            assert.throws(() => Note.assert(v));
        }
    });
});