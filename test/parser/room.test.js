import assert from "assert";

import Room from "../../src/parser/room";

const { describe, it } = global;

describe("World Parser - Room", () => {
	it("should parse info", () => {
		const room = new Room();

		room.info = [0, 9, 4, 2];

		assert.deepStrictEqual(room.flags, ["DARK", "INDOORS"]);
		assert.strictEqual(room.type, "SECT_HILLS");
		assert.strictEqual(room.level, 2);
	});

	it("should throw on invalid sector type", () => {
		const room = new Room();

		assert.throws(() => {
			room.info = [0, 9, 100, 2];
		}, SyntaxError);
	});
});
