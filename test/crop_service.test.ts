import assert from "node:assert/strict";
import { chooseRatios } from "../src/crop_service.ts";

const result = chooseRatios({ image: "demo", ratios: [1, 16 / 9, 1, 0, -2, Number.NaN] });
assert.deepEqual(result, [1, 16 / 9]);
console.log("crop decision test passed");
