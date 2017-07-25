export default class Room {
	constructor() {
		this.number = 0;
		this.title = [];
		this.description = [];
		this.flags = [];
		this.exits = [];
	}

	toJSON() {
		return {
			number : this.number,
			flags : this.flags,
			exits : this.exits,
			title : this.title.join("\n").slice(0, -1),
			description : this.description.join("\n").slice(0, -1)
		};
	}
}
