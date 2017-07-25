export default class Room {
	constructor() {
		this.keyword = [];
		this.description = [];
	}

	toJSON() {
		return {
			keyword : this.keyword.join("\n").slice(0, -1),
			description : this.description.join("\n").slice(0, -1)
		};
	}
}
