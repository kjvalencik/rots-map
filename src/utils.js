export class Enumerator {
	static [Symbol.iterator]() {
		let value = -1;

		return {
			next() {
				value += 1;

				return { value };
			}
		};
	}
}

export function BitMask(items) {
	const flags = items.reduce((acc, k, i) => Object.assign({}, acc, {
		[k] : 2 ** i
	}), {});

	return function getFlags(bitmask) {
		return Object
			.keys(flags)
			// Bit masks require bitwise operators, ignore the lint error
			// eslint-disable-next-line no-bitwise
			.filter(k => (flags[k] & bitmask));
	};
}
