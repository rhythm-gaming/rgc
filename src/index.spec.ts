import { assert } from 'chai';

import { parseChart } from "./index.js";
import { readTestData } from "./test-util.js";

describe("parseChart", async function() {
    it("should be able to read chart/sdvx/calibration.rgc", async function() {
        const chart_data = await readTestData("chart/sdvx/calibration.rgc");

        const chart = parseChart(chart_data);
        assert.strictEqual(chart.header.version, "0.2.0");
        assert.strictEqual(chart.header.game, "sdvx");
    });
});