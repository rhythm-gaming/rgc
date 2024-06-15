// @ts-check

import * as fs from 'node:fs/promises';
import { assert } from 'chai';
import { Chart } from "../dist/chart/chart.js";

/**
 * @param {string} file_path 
 * @returns {Promise<string>}
 */
async function readFile(file_path) {
    return fs.readFile(new URL(file_path, import.meta.url), 'utf-8');
}

describe("Chart", function() {
    describe(".parse", function() {
        it("should be able to read `chart/sdvx/calibration.rgc`", async function() {
            const chart_src = await readFile("chart/sdvx/calibration.rgc");
            const chart = Chart.parse(chart_src);

            assert.strictEqual(chart.lane_groups.size, 1);
            
            const [lane_group] = [...chart.lane_groups.values()];
            assert.strictEqual(lane_group.id, "bt");
            assert.strictEqual(lane_group.dim, 0);
            assert.strictEqual(lane_group.lanes.length, 4);

            for(const lane of lane_group.lanes) {
                assert.strictEqual(lane.dim, 0);
                assert.strictEqual(lane.notes.size, 16);
            }
        });
    });
});