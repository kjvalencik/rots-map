# Return of the Shadow Parser

Utilities for parsing and converting Return of the Shadow game files.

## Parsers

### World Files

Currently this is the only parser implemented. It has a very rudimentary CLI
utility.

#### Usage

```bash
cat thogs.wld | node -r babel-register src > thogs.json
```

### Development

#### Installation

Requires [node.js](https://nodejs.org).

```bash
npm install
```

#### Tests

NPM scripts are provided for linting and testing.

```bash
# Full test suite
npm test

# Just lint
npm run lint

# Just tests
npm run unit
```

Other scripts can be found in [`package.json`](package.json).
