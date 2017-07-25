import highland from "highland";

const [
	INITIAL,
	NUMBER,
	TITLE,
	DESCRIPTION,
	EXTRA_DESCRIPTION,
	ROOM_FLAGS,
	EXIT_DIRECTION,
	EXIT_DESCRIPTION,
	EXIT_NAME,
	EXIT_FLAGS,
	FILE_END
] = {
	[Symbol.iterator]() {
		let value = -1;

		return {
			next() {
				value += 1;

				return { value };
			}
		};
	}
};

const DIRECTIONS = Object.freeze({
	D0 : "NORTH",
	D1 : "EAST",
	D2 : "SOUTH",
	D3 : "WEST",
	D4 : "UP",
	D5 : "DOWN"
});

class Room {
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

class Exit {
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

export default function WorldParser() {
	let state = INITIAL;
	let room = null;
	let exit = null;

	function consumeNextLine(err, x = {}, push, next) {
		const { line, text } = x;

		// Pass along errors
		if (err) {
			push(err);
			next();

			return;
		}

		// End of stream
		if (x === highland.nil) {
			if (state !== INITIAL && state !== FILE_END) {
				push(new SyntaxError("Unexpected end of stream"));
			}

			push(null, x);

			return;
		}

		if (text === "$~") {
			if (state <= TITLE) {
				state = FILE_END;
			} else {
				push(new SyntaxError(`Invalid end of file marker on line ${line}`));
				next();

				return;
			}
		}

		switch (state) {
			case INITIAL:
				if (text) {
					state = NUMBER;
					consumeNextLine(err, x, push, next);
				} else {
					next();
				}

				break;

			case NUMBER:
				room = new Room();

				if (/^#[0-9]+\s*$/.test(text)) {
					room.number = parseInt(text.slice(1), 10);
					state = TITLE;
				} else {
					push(new SyntaxError(`Invalid room number on line ${line}`));
				}

				next();

				break;
			case TITLE:
				room.title.push(text);

				if (text.slice(-1) === "~") {
					state = DESCRIPTION;
				}

				next();

				break;

			case DESCRIPTION:
				room.description.push(text);

				if (text.slice(-1) === "~") {
					state = EXTRA_DESCRIPTION;
				}

				next();

				break;

			// TODO: Implement extra description parsing
			case EXTRA_DESCRIPTION:
				if (text[0] === "E") {
					push(new SyntaxError(
						`Extra description not implemented, see line ${line}`
					));
					next();
				} else {
					state = ROOM_FLAGS;
					consumeNextLine(err, x, push, next);
				}

				break;

			// TODO: Parse room flags
			case ROOM_FLAGS:
				if (/^\d+(?: \d+)*$/.test(text)) {
					room.flags = text.split(" ").map(Number);
					state = EXIT_DIRECTION;
				} else {
					push(new SyntaxError(`Invalid room flags on line ${line}`));
				}

				next();

				break;

			case EXIT_DIRECTION:
				if (text === "S") {
					state = INITIAL;
					push(null, room.toJSON());
					next();
				} else {
					exit = new Exit();

					if (DIRECTIONS[text]) {
						exit.direction = DIRECTIONS[text];
						state = EXIT_DESCRIPTION;
					} else {
						push(new SyntaxError(`Invalid direction on line ${line}`));
					}
				}

				next();

				break;

			case EXIT_DESCRIPTION:
				exit.description.push(text);

				if (text.slice(-1) === "~") {
					state = EXIT_NAME;
				}

				next();

				break;

			case EXIT_NAME:
				exit.name.push(text);

				if (text.slice(-1) === "~") {
					state = EXIT_FLAGS;
				}

				next();

				break;

			// TODO: parse exit flags
			case EXIT_FLAGS:
				if (/^\d+(?: \d+)*$/.test(text)) {
					exit.flags = text.split(" ").map(Number);
					room.exits.push(exit.toJSON());
					state = EXIT_DIRECTION;
				} else {
					push(new SyntaxError(`Invalid exit flags on line ${line}`));
				}

				next();

				break;

			case FILE_END:
				next();
				break;

			// Unreachable
			// istanbul ignore next
			default:
				push(new SyntaxError(`Invalid state (${state}) on line ${line}`));
				next();
		}
	}

	return stream => stream
		.map(line => line.toString())
		.map(line => line.replace(/\n\r/g, "\n"))
		.split()
		.map((() => {
			let line = 0;

			return (text) => {
				line += 1;

				return { line, text };
			};
		})())
		.consume(consumeNextLine);
}
