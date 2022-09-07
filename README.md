# JavaScript query string params parser and reader
[![](https://img.shields.io/npm/v/@stein197/qs)](https://www.npmjs.com/package/@stein197/qs)
[![](https://img.shields.io/github/license/stein197/js-qs)](LICENSE)

This module is useful for parsing URL query string into JS objects and stringifying them back to a query string. The package is much simpler than [qs](https://github.com/ljharb/qs) one, does not support different encodings, but has the most needed features and a few that that package does not. The package primarily aims to be as most close to PHP's query string representation as possible.

## Installation
```
npm install @stein197/qs
```
```ts
import * as qs from "@stein197/qs";
```

## Usage
The module exports only two functions - `stringify()` and `parse()` and both of them accept two arguments - object to parse/stringify and options. Example:
```ts
qs.stringify({key: "value", object: {a: 1, b: null}}, {nulls: false}); // "key=value&object[a]=1"
qs.parse("key=value&object[a]=1", {scalars: true}); // {key: "value", object: {a: 1}}
```

## Key features
- [Nesting structures support](#nesting-structures-support)
- [Omitting redundant indices](#omitting-redundant-indices)
- [Inferring arrays where possible](#inferring-arrays-where-possible)
- [Inferring primitive types where possible](#inferring-primitive-types-where-possible)
- [Discarding empty values](#discarding-empty-values)
- [Inferring flags](#inferring-flags)
- [Encoding special chars in keys and values](#encoding-special-chars-in-keys-and-values)
- [Decoding of percent-encoded characters](#decoding-of-percent-encoded-characters)
- [Sparse arrays support](#sparse-arrays-support)
- [Custom value decoder](#custom-value-decoder)

### Nesting structures support
You can pass to both functions complex structures, which includes objects and arrays:
```ts
qs.stringify({a: {b: 2}}); // "a[b]=2"
qs.parse("a[b]=2");        // {a: {b: 2}}
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
Values could be casted to a corresponding type (undefined, null, boolean or number) where possible. You can disable this option by providing `scalars` option with `false` value. You can do this with [qs](https://github.com/ljharb/qs) but here it's embedded.
```ts
qs.parse("a=undefined&b=null&c=false&d=-1"); // {a: undefined, b: null, c: false, d: -1}
```

### Discarding empty values
By default, both functions discard empty values:
```ts
qs.parse("a=");        // {}
qs.stringify({a: ""}); // ""
```
To disable the option, pass `preserveEmpty` option with `true` value.

### Inferring flags
It's rather specific option. If the key does not have both value and equal sign, then the entry will have `true` value. Otherwise is correct too:
```ts
qs.parse("a=1&b"); // {a: 1, b: true}
qs.stringify({a: 1, b: true}); "a=1&b"
```
To disable the option, pass `flags` option with `false` value

### Encoding special chars in keys and values
When stringifying, special characters in keys and values will be percent-encoded:
```ts
qs.stringify({a: "&"}); // "a=%26"
```
One of the difference is that this package does not encode square braces while [qs](https://github.com/ljharb/qs) does.

### Decoding of percent-encoded characters
When parsing, percent-encoded characters will be automatically decoded when possible:
```ts
qs.parse("a=%20"); // {a: " "}
```

### Sparse arrays support
Since the package supports arrays, it supports sparse ones:
```ts
qs.parse("a[1]=1");       // {a: [, 1]}
qs.stringify({a: [, 1]}); // "a[1]=1"
```
The [qs](https://github.com/ljharb/qs) package supports this only for stringifying function.

### Custom value decoder
If you want to provice custom value decoder, pass `decodeValue` function to `parse()` function:
```ts
parse("a=1&b=2", {decodeValue: (key, value, index) => value * 2}); // {a: 2, b: 4}
```
The function accepts three arguments: raw key of a query entry, parsed value of a query entry and the index of a query entry.

## API
| Function | Description |
|----------|-------------|
| `stringify(data: Stringifyable, options: Partial<StringifyOptions>): string` | Stringifies an object or array to a query string |
| `parse(data: string, options: Partial<ParseOptions>): Stringifyable` | Parses the given string into an object |

> For more information, please refer the documentation in source code.

## Options
| Option | Type | Description |
|--------|------|-------------|
| `preserveEmpty` | boolean | Preserves entries with empty values if `true` |
| `indices` | boolean | Outputs indices for arrays if `true` |
| `flags` | boolean | Converts entries with `true` values as a query flag |
| `nulls` | boolean | Stringifies `null` and `undefined` values if `true` |
| `encodeKeys` | boolean | Encodes keys in percent notation |
| `encodeValues` | boolean | Encodes values in percent notation |
| `decodeValue` | (key: string, value: undefined | null | boolean | number | string, index: number): any | Function that should return custom value for each entry |

> For more information, please refer the documentation in source code.

## NPM scripts
- `build` - builds the project
- `test` - runs unit tests
