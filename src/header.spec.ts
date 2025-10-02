import { assert } from 'chai';
import { ArkErrors } from 'arktype';

import { Header } from './header.js';

describe('Header', () => {
    it("should accept correct header, perhaps with extra fields", () => {
        const data = {
            version: "0.2.0",
            game: "sdvx",
            foo: 'foo',
            bar: 1234,
            x: {y: true, z: ["Hello", "world"]},
        };
        
        assert.deepStrictEqual(Header(data), data);
    });

    it("should accept an empty header", () => {
        assert.deepStrictEqual(Header({}), {});
    });
    
    it("should reject fields with incorrect types", () => {
        for(const key of ['version', 'editor', 'game']) {
            for(const value of [true, false, null, (void 0), 1234, 5678n, {}, [], () => {}, Symbol('foo')]) {
                const data = { [key]: value };
                assert.instanceOf(Header(data), ArkErrors);
                assert.throws(() => Header.assert(data));
            }
        }
    });
});
