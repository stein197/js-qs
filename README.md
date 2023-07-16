# JavaScript query string params parser and reader
[![](https://img.shields.io/npm/v/@stein197/qs)](https://www.npmjs.com/package/@stein197/qs)
[![](https://img.shields.io/github/license/stein197/js-qs)](LICENSE)

URL Query string parser and stringifier. The package allows to customize parsing and stringifying process.

## Installation
```
npm install @stein197/qs
```

## Usage
Here is the example of simple usage:
```ts
import * as qs from "@stein197/qs";

qs.stringify({a: 1, b: 2}); // "a=1&b=2"
qs.parse("a=1&b=2");        // {a: 1, b: 2}
```

## Key features
- [Nesting structures support](#nesting-structures-support)
- [Omitting redundant indices](#omitting-redundant-indices)
- [Inferring arrays where possible](#inferring-arrays-where-possible)
- [Inferring primitive types where possible](#inferring-primitive-types-where-possible)
- [Inferring flags](#inferring-flags)
- [Encoding and decoding](#encoding-and-decoding)
- [Sparse arrays support](#sparse-arrays-support)
- [Custom encoders and decoders](#custom-encoders-and-decoders)

### Nesting structures support
You can pass to both functions complex structures, which includes objects and arrays:
```ts
qs.parse("a[b]=2");        // {a: {b: 2}}
qs.stringify({a: {b: 2}}); // "a[b]=2"
```
The complexity of structures is unlimited - you can parse/stringify structures of any depth and type (object or array)

### Omitting redundant indices
The indices of arrays of stringified result could be omitted where possible. You can disable this option by providing `indices` option with `true` value. You cannot do this properly with [qs](https://github.com/ljharb/qs), especially when it deals with deeply nested arrays.
```ts
qs.stringify({a: [1, 2, 3]}); // "a[]=1&a[]=2&a[]=3"
```
Indices could be ommited for more deep structures.

### Inferring arrays where possible
The arrays could be inferred from query string where possible:
```ts
qs.parse("a[]=1");  // {a: [1]}
qs.parse("a[0]=1"); // {a: [1]}
```
Arrays could be inferred from more deep structures.

### Inferring primitive types where possible
By default, `parse()` function will try to cast string values to corresponding types where possible (undefined, null, boolean or number).
```ts
qs.parse("a=undefined&b=null&c=false&d=-1"); // {a: undefined, b: null, c: false, d: -1}
```

### Inferring flags
When an item doesn't have both value and separator, then `true` is returned for this specific key:
```ts
qs.parse("a=1&b"); // {a: 1, b: true}
qs.stringify({a: 1, b: true}); "a=1&b"
```

### Encoding and decoding
When parsing and stringifying, special characters will be percent-encoded/decoded:
```ts
qs.parse("a=%20"); // {a: " "}
qs.stringify({a: "&"}); // "a=%26"
```

### Sparse arrays support
Since the package supports arrays, it supports sparse ones:
```ts
qs.parse("a[1]=1");       // {a: [, 1]}
qs.stringify({a: [, 1]}); // "a[1]=1"
```

### Custom encoders and decoders
If it's not enough, then you can provide an encoder and a decoder down to both functions like as follows:
```ts
qs.parse("a.b=1&a.c=2", {
	decode: (rawKey: string, rawValue: string, index: number) => {
		return [
			rawKey.toUpperCase().split("."),
			rawValue * index
		]
	}
}); // {A: {B: 0, C: 2}}
qs.stringify({a: {b: 1, c: 2}}, {
	encode: (keyPath: string[], value: any, index: number) => {
		return [
			keyPath.join(".").toUpperCase(),
			String(value * index)
		]
	}
}); // "A.B=0&A.C=2"
```
To get more information on how this works, please refer to the documentation in the source code.

## API
> For more information, please refer to the documentation in source code.

## NPM scripts
- `browserify`. Create `qs.min.js` file to include directly via `<script />` tags
- `build`. Run `clean`, `test`, `ts` and `browserify` scripts
- `clean`. Remove compiled files
- `test`. Run unit tests
- `ts`. Compile the project

