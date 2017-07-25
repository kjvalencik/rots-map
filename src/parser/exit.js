export const DIRECTIONS = Object.freeze({
	D0 : "NORTH",
	D1 : "EAST",
	D2 : "SOUTH",
	D3 : "WEST",
	D4 : "UP",
	D5 : "DOWN"
});

export default class Exit {
	constructor() {
		this.direction = DIRECTIONS.D0;
		this.description = [];
		this.name = [];
		this.flags = [];
	}

	toJSON() {
		return {
			direction : this.direction,
			flags : this.flags,
			description : this.description.join("\n").slice(0, -1),
			name : this.name.join("\n").slice(0, -1)
		};
	}
}
