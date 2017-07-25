import { BitMask } from "../utils";

const SECTORS = Object.freeze([
	"SECT_INSIDE",
	"SECT_CITY",
	"SECT_FIELD",
	"SECT_FOREST",
	"SECT_HILLS",
	"SECT_MOUNTAIN",
	"SECT_WATER_SWIM",
	"SECT_WATER_NOSWIM",
	"SECT_UNDERWATER",
	"SECT_ROAD",
	"SECT_CRACK",
	"SECT_DENSE_FOREST",
	"SECT_SWAMP"
]);

const getFlags = BitMask([
	"DARK",
	"DEATH",
	"NO_MOB",
	"INDOORS",
	"NORIDE",
	"PERMAFFECT",
	"SHADOWY	",
	"NO_MAGIC",
	"TUNNEL",
	"PRIVATE",
	"GODROOM",
	"BFS_MARK",
	"DRINK_WATER",
	"DRINK_POISON",
	"SECURITYROOM",
	"PEACEROOM",
	"NO_TELEPORT"
]);

export default class Room {
	constructor() {
		this.number = 0;
		this.title = [];
		this.description = [];
		this.extraDescriptions = [];
		this.exits = [];

		// info
		this.flags = [];
		this.type = SECTORS[0];
		this.level = 0;
	}

	set info([, flags, type, level]) {
		this.flags = getFlags(flags);
		this.type = SECTORS[type];
		this.level = level;

		if (!this.type) {
			throw new SyntaxError(`Invalid sector type: ${type}`);
		}
	}

	toJSON() {
		return {
			number : this.number,
			type : this.type,
			level : this.level,
			flags : this.flags,
			extraDescriptions : this.extraDescriptions.map(ex => ex.toJSON()),
			exits : this.exits.map(exit => exit.toJSON()),
			title : this.title.join("\n").slice(0, -1),
			description : this.description.join("\n").slice(0, -1)
		};
	}
}
