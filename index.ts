import * as utilArray from "@stein197/util/array";
import * as utilJson from "@stein197/util/json";
import type * as type from "@stein197/type";

const DEFAULT_OPTIONS: Options = {
	itemDelimiter: "&",
	valueDelimiter: "="
};

const DEFAULT_OPTIONS_STRINGIFY: StringifyOptions = {
	...DEFAULT_OPTIONS,
	indices: false,
	encode
};

const DEFAULT_OPTIONS_PARSE: ParseOptions = {
	...DEFAULT_OPTIONS,
	decode
};

const CHARS_RESERVED: string[] = [
	"%", "=", "&", "[", "]", "."
];

/**
 * Stringifies an object or array to a query string.
 * @param data Object to stringify.
 * @param options Options to use.
 * @return Query string from the object. Returns empty string if the object is empty.
 * @throws {@link ReferenceError} When data contains circular references.
 */
export function stringify(data: any, options: Partial<StringifyOptions> = DEFAULT_OPTIONS_STRINGIFY): string {
	const result: string[] = [];
	internalStringify(data, mergeObject(options, DEFAULT_OPTIONS_STRINGIFY), [], result);
	return result.join(options.itemDelimiter);
}

/**
 * Parses the given string into an object. If the string contains multiple keys with different values then only the last
 * one is preserved. Keys without values and equal sign (i.e. "flags") are always preserved and being parsed as `true`.
 * For example:
 * @example Parsing flags
 * ```ts
 * parse("a&b"); // {a: true, b: true}
 * ```
 * Values and keys are automatically decoded.
 * @example Autodecoding
 * ```ts
 * parse("%3Aa=1"); // {":a": 1}
 * ```
 * @param data String to parse.
 * @param options Options to use.
 * @return Object parsed from given string. Returns empty object if the string is empty.
 */
export function parse<T>(data: string, options: Partial<ParseOptions> = DEFAULT_OPTIONS_PARSE): type.DeepPartial<T> {
	options = mergeObject(options, DEFAULT_OPTIONS_PARSE);
	const result: any = {};
	const entries = data.split(options.itemDelimiter!).filter(item => item);
	for (let i = 0, item = entries[i]; i < entries.length; i++, item = entries[i]) {
		const [rawKey, ...valueArray] = item.split(options.valueDelimiter!);
		if (!rawKey)
			continue;
		const rawValue = valueArray.length ? valueArray.join(options.valueDelimiter) : null;
		const keyvalue = options.decode!(rawKey, rawValue, i);
		if (!keyvalue)
			continue;
		const [keyArray, value] = keyvalue;
		let curObj = result;
		let lastKey = keyArray.pop()!;
		for (let k of keyArray) {
			k = k || getNextIndex(curObj).toString();
			if (!curObj[k] || typeof curObj[k] !== "object")
				curObj[k] = {};
			curObj = curObj[k];
		}
		lastKey = lastKey || getNextIndex(curObj).toString();
		curObj[lastKey] = value;
	}
	return normalize(result);
}

// TODO
export function encode(key: string[], value: any): [key: string, value: string] | null {
	if (value == null)
		return null;
	return [
		encodeKey(key),
		encodeValue(value)
	];
}

// TODO
export function decode(key: string, value: string | null): [key: string[], value: any] | null {
	if (value == null)
		return null;
	return [
		decodeKey(key),
		decodeValue(value)
	];
}

function encodeKey(key: string[]): string {
	const firstItem = encodeSpecialChars(key[0]);
	return key.length === 1 ? firstItem : firstItem + `[${key.slice(1).map(item => encodeSpecialChars(item)).join("][")}]`;
}

function encodeValue(value: any): string {
	return value == null ? "" : encodeSpecialChars(value.toString());
}

function decodeKey(key: string): string[] {
	const result: string[] = [];
	let curKey: string | null = "";
	let inBrace = false;
	for (const char of key) {
		if (char === "[" && !inBrace)
			inBrace = true;
		if (char === "]" && inBrace)
			inBrace = false;
		if (char !== "[" && char !== "]") {
			curKey += char;
			continue;
		}
		if (!inBrace && char === "]" || inBrace && char === "[") {
			curKey += char;
			continue;
		}
		if (curKey != null)
			result.push(curKey);
		curKey = char === "[" ? "" : null;
	}
	if (inBrace)
		result[result.length - 1] = result[result.length - 1] + "[" + (curKey ?? "");
	else if (curKey != null)
		result.push(curKey);
	return result;
}

function decodeValue(value: string | null): any {
	switch (value) {
		case "":
			return "";
		case "undefined":
			return undefined;
		case "null":
			return null;
		case "true":
			return true;
		case "false":
			return false;
		case null:
			return true;
		default:
			const numValue = parseNumber(value);
			return isNaN(numValue) ? value : numValue;
	}
}

function getNextIndex(object: any): number {
	const indices = Object.keys(object).map(k => +k).filter(k => !isNaN(k));
	return indices.length ? Math.max(...indices) + 1 : 0;
}

function parseNumber(number: string): number {
	let sign = 0;
	let i = 0;
	for (const char of number) {
		if (char === "+" && sign > 0 || char === "-" && sign < 0)
			return NaN;
		if (char === "+")
			sign = 1;
		else if (char === "-")
			sign = -1;
		else
			break;
		i++;
	}
	return (sign || 1) * +number.substring(i);
}

function internalStringify(data: any, options: StringifyOptions, keyPath: string[], result: string[]): void {
	const needIndex = !keyPath.length || shouldUseIndex(data, false);
	for (const [key, value] of Object.entries(data)) {
		const keyPathCopy = [...keyPath];
		keyPathCopy.push(options.indices || needIndex ? key : "");
		if (value != null && typeof value === "object") {
			internalStringify(value, options, keyPathCopy, result);
			continue;
		}
		const keyvalue = options.encode(keyPathCopy, value, result.length);
		if (!keyvalue)
			return;
		const [encodedKey, encodedValue] = keyvalue;
		result.push(encodedKey + options.valueDelimiter + encodedValue);
	}
}

function encodeSpecialChars(data: string): string {
	let result: string = "";
	for (const char of data)
		result += CHARS_RESERVED.includes(char) ? encodeURIComponent(char) : char;
	return result;
}

function shouldUseIndex(data: any, deep: boolean): boolean {
	const isObject = utilJson.isObject(data);
	const isArray = utilJson.isArray(data);
	if (!isObject && !isArray)
		return false;
	const keys = Object.keys(data);
	const isSparse = isArray && utilArray.sparse(data);
	const isComplex = deep ? isObject && keys.length > 1 || isArray && data.length > 1 && (!isSparse || isSparse && keys.length > 1) : isObject || isArray && isSparse;
	if (isComplex)
		return true;
	for (const k in data)
		if (shouldUseIndex(data[k], true))
			return true;
	return false;
}

function normalize(data: any): any {
	const origKeys = Object.keys(data);
	const numKeys = origKeys.map(key => +key).filter(key => !isNaN(key));
	const isArray = numKeys.length && numKeys.length === origKeys.length;
	const result = isArray ? new Array(numKeys.length ? Math.max(...numKeys) + 1 : 0) : data;
	for (const i in data)
		result[i] = typeof data[i] === "object" && data[i] != null ? normalize(data[i]) : data[i];
	return result;
}

function mergeObject<T extends Options>(userObject: Partial<T>, defaultObject: T): T {
	return userObject === defaultObject ? defaultObject : {
		...defaultObject,
		...userObject
	};
}

type Options = {

	/**
	 * Which char to use as a delimiter between query items.
	 * @defaultValue `"&"`
	 * @example
	 * ```ts
	 * stringify({a: 1, b: 2}, {itemDelimiter: ";"}); // "a=1;b=2"
	 * parse("a=1&b=2");                              // {a: 1, b: 2}
	 * ```
	 */
	itemDelimiter: string; // TODO: tests

	/**
	 * Which char to use as a delimiter between keys and values.
	 * @defaultValue `"="`
	 * @example
	 * ```ts
	 * stringify({a: 1, b: 2}, {valueDelimiter: ":"}); // "a:1&b:2"
	 * parse("a=1&b=2");                               // {a: 1, b: 2}
	 * ```
	 */
	valueDelimiter: string; // TODO: tests
}

type StringifyOptions = Options & {

	/**
	 * Always outputs indices for arrays when `true`. Omits them where possible when `false`.
	 * @defaultValue `false`
	 * @example
	 * ```ts
	 * stringify({a: [1]}, {indices: true});  // "a[0]=1"
	 * stringify({a: [1]}, {indices: false}); // "a[]=1"
	 * ```
	 */
	indices: boolean; // TODO: tests

	/**
	 * Key-value encoding function that should return both stringified key and value that will be used in the resulting
	 * query string. The function is called at every key-value item occurence. The default behavior description can be
	 * found in {@link encode} function docstrings.
	 * @param key Key path array. The array represents a nesting structure of the query string.
	 * @param value Value associated with the key.
	 * @param index Zero-based position index.
	 * @returns A key-value pair that will be used as a final key and value for the query string or null to skip.
	 * @example
	 * ```ts
	 * // The following code has two calls of the functions and accepted the next arguments:
	 * // | k               | v | i |
	 * // |-----------------|---|---|
	 * // | ["a", "b", "c"] | 3 | 0 |
	 * // | ["a", "b", "d"] | 4 | 1 |
	 * stringify({a: {b: {c: 3, d: 4}}}, {
	 * 	encode: (k, v, i) => [
	 * 		k.map(k => k.toUpperCase()).join("."),
	 * 		v * i
	 * 	]
	 * }); // "a.b.c=0&a.b.d=4"
	 * ```
	 */
	encode(key: string[], value: any, index: number): [key: string, value: string] | null; // TODO: tests
}

type ParseOptions = Options & {

	/**
	 * Key-value decoding function that should return both parsed key path array and value that will be used in the
	 * resulting object. The function is called at every key-value item occurence. The default behavior description can
	 * be found in {@link decode} function docstrings.
	 * @param key Raw key that should be splitted into an array.
	 * @param value Raw value retrieved from the query string. Null value represents that an item doesn't even have a
	 *              key-value delimiter to separate the item into a key and value (for example a string like
	 *              `"a=1&b=&c"`. The first item's value is `"1"`, the second one's is `""` and the third one's is
	 *              `null`).
	 * @param index Zero-based position index.
	 * @return A key-value pair that will be used as a final key path for the query object or null to skip.
	 * @example
	 * ```ts
	 * // The following code has only one call of the function and accepted the next arguments:
	 * // | k       | v       | i |
	 * // |---------|---------|---|
	 * // | "a.b.c" | "1,2,3" | 0 |
	 * parse("a.b.c=1,2,3", {
	 * 	decode: (k, v, i) => [
	 * 		k.toUpperCase().split("."),
	 * 		v.split(",").map(n => +n)
	 * 	]
	 * }); // {A: {B: {C: [1, 2, 3]}}}
	 * ```
	 */
	decode(key: string, value: string | null, index: number): [key: string[], value: any] | null; // TODO: tests
}
