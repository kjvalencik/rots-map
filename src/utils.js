// Disable eslint because it is expected to have more utilities. Remove after
// they are added.
// eslint-disable-next-line import/prefer-default-export
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
