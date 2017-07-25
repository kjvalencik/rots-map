import assert, { AssertionError } from "assert";
import fs from "fs";
import path from "path";

import Bluebird from "bluebird";
import highland from "highland";

import WorldParser from "../../src/parser";

const { describe, it } = global;

function read(file) {
	return highland(fs.createReadStream(path.join(__dirname, file)));
}

describe("World Parser", () => {
	it("should parse a world file", () => (
		read("../fixtures/entrance.wld")
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(({ number, title, description, flags, exits }) => {
				const descriptionStart = "   This is the entrance";
				const descriptionEnd = ". \n";

				assert.strictEqual(number, 3800);
				assert.strictEqual(title, "The Courtyard Entrance");

				assert.strictEqual(
					description.slice(0, descriptionStart.length),
					descriptionStart
				);

				assert.strictEqual(
					description.slice(-descriptionEnd.length),
					descriptionEnd
				);

				assert.deepStrictEqual(flags, [0, 4, 1, 0]);

				assert.deepStrictEqual(exits, [{
					direction : "NORTH",
					flags : [321, 7522, 3819, 0],
					description : "A large gate lies to the north\n",
					name : "gate"
				}, {
					direction : "EAST",
					flags : [0, 0, 3868, 0],
					description : "",
					name : ""
				}, {
					direction : "SOUTH",
					flags : [0, 0, 3867, 0],
					description : "",
					name : ""
				}, {
					direction : "WEST",
					flags : [0, 0, 3869, 0],
					description : "",
					name : ""
				}]);
			})
	));

	it("should pass along read errors", () => (
		highland(push => push(new AssertionError({})))
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(() => Bluebird.reject(new Error("did not throw")))
			.catch(AssertionError, assert.ok)
	));

	it("should error on incomplete file", () => (
		highland(["#1234"])
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(() => Bluebird.reject(new Error("did not throw")))
			.catch(SyntaxError, assert.ok)
	));

	it("should error on misplaced end of file marker", () => (
		highland(["#1234\n", "Name~\n", "$~\n"])
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(() => Bluebird.reject(new Error("did not throw")))
			.catch(SyntaxError, assert.ok)
	));

	it("should ignore anything after file end marker", () => (
		highland(["#1234\n", "$~\n", "#invalid\n"])
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(empty => assert.strictEqual(empty))
	));

	it("should error on invalid room number", () => (
		highland(["#invalid"])
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(() => Bluebird.reject(new Error("did not throw")))
			.catch(SyntaxError, assert.ok)
	));

	it("should allow multi-line titles", () => (
		read("../fixtures/multiline.wld")
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(({ title, exits : [{ name }] }) => {
				assert.strictEqual(title, "Multi\nLine\nTitle");
				assert.strictEqual(name, "big\ngate");
			})
	));

	it("should error if world file includes extra description", () => (
		highland(["#123\n~\n~\nE Not Implemented"])
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(() => Bluebird.reject(new Error("did not throw")))
			.catch(SyntaxError, assert.ok)
	));

	it("should error on invalid room flags", () => (
		highland(["#123\n", "~\n", "~\n", "invalid flags"])
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(() => Bluebird.reject(new Error("did not throw")))
			.catch(SyntaxError, assert.ok)
	));

	it("should error on invalid exit direction", () => (
		highland(["#123\n~\n~\n0\nD6"])
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(() => Bluebird.reject(new Error("did not throw")))
			.catch(SyntaxError, assert.ok)
	));

	it("should error on invalid exit flags", () => (
		highland(["#123\n~\n~\n0\nD0\n~\n~\ninvalid"])
			.through(WorldParser())
			.toPromise(Bluebird)
			.then(() => Bluebird.reject(new Error("did not throw")))
			.catch(SyntaxError, assert.ok)
	));
});
