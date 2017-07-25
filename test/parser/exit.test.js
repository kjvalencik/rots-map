import assert from "assert";

import Exit from "../../src/parser/exit";

const { describe, it } = global;

describe("World Parser - Room", () => {
	it("should parse info", () => {
		const exit = new Exit("D1");

		exit.info = [321, 9, 4, 2];

		assert.strictEqual(exit.direction, "EAST");
		assert.strictEqual(exit.key, 9);
		assert.strictEqual(exit.toRoom, 4);
		assert.strictEqual(exit.width, 2);
		assert.deepStrictEqual(exit.flags, [
			"EX_ISDOOR",
			"EX_DOORISHEAVY",
			"EX_NO_LOOK"
		]);
	});

	it("should throw on invalid direction", () => {
		assert.throws(() => (new Exit("D6")), SyntaxError);
	});
});
