import highland from "highland";

import { Enumerator } from "../utils";
import Room from "./room";
import ExtraDescription from "./extra-description";
import Exit from "./exit";

const [
	INITIAL,
	NUMBER,
	TITLE,
	DESCRIPTION,
	EXTRA_DESCRIPTION,
	EXTRA_DESCRIPTION_KEYWORD,
	EXTRA_DESCRIPTION_DESCRIPTION,
	ROOM_INFO,
	EXIT_DIRECTION,
	EXIT_DESCRIPTION,
	EXIT_NAME,
	EXIT_INFO,
	FILE_END
] = Enumerator;

export default function WorldParser() {
	let state = INITIAL;
	let room = null;
	let description = null;
	let exit = null;

	function consumeNextLine(text) {
		if (text === "$~") {
			if (state > TITLE) {
				throw new SyntaxError("Invalid end of file marker");
			}

			state = FILE_END;
		}

		switch (state) {
			case INITIAL:
				if (text) {
					state = NUMBER;
					consumeNextLine(text);
				}

				break;

			case NUMBER:
				if (!/^#[0-9]+\s*$/.test(text)) {
					throw new SyntaxError("Invalid room number");
				}

				room = new Room();
				room.number = parseInt(text.slice(1), 10);
				state = TITLE;

				break;
			case TITLE:
				room.title.push(text);

				if (text.slice(-1) === "~") {
					state = DESCRIPTION;
				}

				break;

			case DESCRIPTION:
				room.description.push(text);

				if (text.slice(-1) === "~") {
					state = EXTRA_DESCRIPTION;
				}

				break;

			case EXTRA_DESCRIPTION:
				if (text === "E") {
					description = new ExtraDescription();
					state = EXTRA_DESCRIPTION_KEYWORD;
				} else {
					state = ROOM_INFO;
					consumeNextLine(text);
				}

				break;

			case EXTRA_DESCRIPTION_KEYWORD:
				description.keyword.push(text);

				if (text.slice(-1) === "~") {
					state = EXTRA_DESCRIPTION_DESCRIPTION;
				}

				break;

			case EXTRA_DESCRIPTION_DESCRIPTION:
				description.description.push(text);

				if (text.slice(-1) === "~") {
					state = EXTRA_DESCRIPTION;
					room.extraDescriptions.push(description);
				}

				break;

			case ROOM_INFO:
				if (!/^\d+(?: \d+)*$/.test(text)) {
					throw new SyntaxError("Invalid room info");
				}

				room.info = text.split(" ").map(Number);
				state = EXIT_DIRECTION;

				break;

			case EXIT_DIRECTION:
				if (text === "S") {
					state = INITIAL;
				} else {
					exit = new Exit(text);
					state = EXIT_DESCRIPTION;
				}

				break;

			case EXIT_DESCRIPTION:
				exit.description.push(text);

				if (text.slice(-1) === "~") {
					state = EXIT_NAME;
				}

				break;

			case EXIT_NAME:
				exit.name.push(text);

				if (text.slice(-1) === "~") {
					state = EXIT_INFO;
				}

				break;

			case EXIT_INFO:
				if (!/^\d+(?: \d+)*$/.test(text)) {
					throw new SyntaxError("Invalid exit info");
				}

				exit.info = text.split(" ").map(Number);
				room.exits.push(exit);
				state = EXIT_DIRECTION;

				break;

			case FILE_END:
				break;

			// Unreachable
			// istanbul ignore next
			default:
				throw new SyntaxError(`Invalid state (${state})`);
		}
	}

	function consumeNextLineWrapper(err, x = {}, push, next) {
		const { text, line } = x;

		// Pass along errors
		if (err) {
			push(err);
			next();

			return;
		}

		// End of stream
		if (x === highland.nil) {
			if (state !== INITIAL && state !== FILE_END) {
				push(Object.assign(
					new SyntaxError("Unexpected end of stream"),
					{ line }
				));
			}

			push(null, x);

			return;
		}

		if (state === EXIT_DIRECTION && text === "S") {
			push(null, room.toJSON());
		}

		try {
			consumeNextLine(text);
		} catch (e) {
			push(Object.assign(e, { line }));
		} finally {
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
		.consume(consumeNextLineWrapper);
}
