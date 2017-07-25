import highland from "highland";

import WorldParser from "./parser";

highland(["["])
	.concat(
		highland(process.stdin)
			.through(WorldParser())
			.map(JSON.stringify)
			.intersperse(",\n")
	)
	.concat(["]\n"])
	.pipe(process.stdout);
