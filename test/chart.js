// @ts-check

import * as fs from 'node:fs/promises';
import { assert } from 'chai';
import { parseChart } from "../dist/index.js";

/**
 * @param {string} file_path 
 * @returns {Promise<string>}
 */
async function readFile(file_path) {
    return fs.readFile(new URL(file_path, import.meta.url), 'utf-8');
}

describe("parseChart", function() {
    it("should be able to read `chart/sdvx/calibration.rgc`", async function() {
        const chart_src = await readFile("chart/sdvx/calibration.rgc");
        const chart = parseChart(chart_src);

        assert.deepStrictEqual(Object.keys(chart.chart), ['bt']);

        const [lane_group] = Object.values(chart.chart);
        assert.strictEqual(lane_group.dim, 0);
        assert.strictEqual(lane_group.lane.length, 4);

        for(const lane of lane_group.lane) {
            assert.strictEqual(lane.length, 16);
        }
    });
});