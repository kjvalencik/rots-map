import highland from 'highland';

const [
	INITIAL,
	NUMBER,
	TITLE,
	DESCRIPTION,
	ROOM_FLAGS,
	EXIT_INITIAL,
	EXIT_DIRECTION,
	EXIT_DESCRIPTION,
	EXIT_NAME,
	EXIT_FLAGS,
	FILE_END
] = {
	[Symbol.iterator]() {
		let i = 0;

		return { next : () => ({ value : i++ })	};
	}
};

const DIRECTIONS = Object.freeze({
	D0 : 'NORTH',
	D1 : 'EAST',
	D2 : 'SOUTH',
	D3 : 'WEST',
	D4 : 'UP',
	D5 : 'DOWN'
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
			title : this.title.join('\n').slice(0, -1),
			description : this.description.join('\n').slice(0, -1)
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
			description : this.description.join('\n').slice(0, -1),
			name : this.name.join('\n').slice(0, -1)
		};
	}
}

export default function parseFile(input) {
	let state = INITIAL;
	let room = null;
	let exit = null;

	function consumeNextLine(err, x, push, next) {
		const { line, text } = x;

		// Pass along errors
		if (err) {
			push(err);
			next();

			return;
		}

		// End of stream
		if (x === highland.nil) {
			if (state === NUMBER) {
				push(null, room);
			} else if (state !== INITIAL && state !== FILE_END) {
				push(new SyntaxError('Unexpected end of stream'));
			}

			push(null, x);

			return;
		}

		if (text === '$~') {
			if (state <= TITLE) {
				state = FILE_END;
			} else {
				push(new SyntaxError(`Invalid end of file marker on line ${line}`));
				next();

				return;
			}
		}

		switch (state) {
			case FILE_END:
				next();
				break;
			case INITIAL:
				room = new Room();
			case NUMBER:
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

				if (text.slice(-1) === '~') {
					state = DESCRIPTION;
				}

				next();

				break;

			case DESCRIPTION:
				room.description.push(text);

				if (text.slice(-1) === '~') {
					state = ROOM_FLAGS;
				}

				next();

				break;

			case ROOM_FLAGS:
				if (/^[0-9]+ [0-9]+ [0-9]+(?: [0-9]+)?$/.test(text)) {
					room.flags = text.split(' ').map(Number);
					state = EXIT_INITIAL;
				} else {
					push(new SyntaxError(`Invalid room flags on line ${line}`));
				}

				next();

				break;

			case EXIT_INITIAL:
				if (text === 'S') {
					state = INITIAL;

					push(null, room.toJSON());
					next();

					break;
				} else {
					exit = new Exit();
				}
			case EXIT_DIRECTION:
				if (DIRECTIONS[text]) {
					exit.direction = DIRECTIONS[text];
					state = EXIT_DESCRIPTION;
				} else {
					push(new SyntaxError(`Invalid direction on line ${line}`));
				}

				next();

				break;

			case EXIT_DESCRIPTION:
				exit.description.push(text);

				if (text.slice(-1) === '~') {
					state = EXIT_NAME;
				}

				next();

				break;

			case EXIT_NAME:
				exit.name.push(text);

				if (text.slice(-1) === '~') {
					state = EXIT_FLAGS;
				}

				next();

				break;

			case EXIT_FLAGS:
				if (/^[0-9]+ [0-9]+ [0-9]+ [0-9]+$/.test(text)) {
					exit.flags = text.split(' ').map(Number);
					room.exits.push(exit.toJSON());
					state = EXIT_INITIAL;
				} else {
					push(new SyntaxError(`Invalid exit flags on line ${line}`));
				}

				next();

				break;

			// Unreachable
			default:
				push(new SyntaxError(`Invalid state (${state}) on line ${line}`));
				next();
		}
	}

	return highland(input)
		.map(line => line.toString())
		.map(line => line.replace(/\n\r/g, '\n'))
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

parseFile(process.stdin)
	.collect()
	.map(JSON.stringify)
	.each(console.log);
