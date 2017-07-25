import { BitMask } from "../utils";

const DIRECTIONS = Object.freeze({
	D0 : "NORTH",
	D1 : "EAST",
	D2 : "SOUTH",
	D3 : "WEST",
	D4 : "UP",
	D5 : "DOWN"
});

const getFlags = BitMask([
	"EX_ISDOOR",
	"EX_CLOSED",
	"EX_LOCKED",
	"EX_NOFLEE",
	"EX_RSLOCKED",
	"EX_PICKPROOF",
	"EX_DOORISHEAVY",
	"EX_NOBREAK",
	"EX_NO_LOOK",
	"EX_ISHIDDEN",
	"EX_ISBROKEN",
	"EX_NORIDE",
	"EX_NOBLINK",
	"EX_LEVER",
	"EX_NOWALK"
]);

export default class Exit {
	constructor(direction) {
		if (!DIRECTIONS[direction]) {
			throw new SyntaxError("Invalid direction");
		}

		this.direction = DIRECTIONS[direction];
		this.description = [];
		this.name = [];

		// info
		this.flags = [];
		this.key = 0;
		this.toRoom = 0;
		this.width = 0;
	}

	set info([flags, key, toRoom, width]) {
		this.flags = getFlags(flags);
		this.key = key;
		this.toRoom = toRoom;
		this.width = width;
	}

	toJSON() {
		return {
			direction : this.direction,
			flags : this.flags,
			key : this.key,
			toRoom : this.toRoom,
			width : this.width,
			description : this.description.join("\n").slice(0, -1),
			name : this.name.join("\n").slice(0, -1)
		};
	}
}
