import { assert } from 'chai';

import { parseChart } from "./index.js";
import { readTestData } from "./test-util.js";

describe("parseChart", async function() {
    it("should be able to read chart/sdvx/calibration.rgc", async function() {
        const chart_data = await readTestData("chart/sdvx/calibration.rgc");

        const chart = parseChart(chart_data);

        assert.strictEqual(chart.header.version, "0.2.0");
        assert.strictEqual(chart.header.game, "sdvx");

        assert.strictEqual(chart.meta.title, "Calibration");
        
        assert.strictEqual(chart.timing.offset, 1000);
        assert.strictEqual(chart.timing.res, 1n);

        for(const [k, v] of Object.entries(chart.chart)) {
            assert.strictEqual(k, "bt");
            assert.strictEqual(v.dim, 0);
            assert.strictEqual(v.lane.length, 4);

            assert.isTrue(v.lane.every((l) => l.length === 16));
        }
    });
});