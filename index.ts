import * as array from "@stein197/util/array";
import * as json from "@stein197/util/json";
import * as string from "@stein197/util/string";
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

/**
 * Stringifies an object or array to a query string.
 * @param data Object to stringify.
 * @param options Options to use.
 * @return Query string from the object. Returns empty string if the object is empty.
 * @throws {@link ReferenceError} When data contains circular references.
 */
export function stringify(data: any, options: Partial<StringifyOptions> = DEFAULT_OPTIONS_STRINGIFY): string {
	options = mergeObject(options, DEFAULT_OPTIONS_STRINGIFY);
	const result: string[] = [];
	internalStringify(data, options as StringifyOptions, [], result);
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
	const values: any[] = [];
	for (let i = 0, item = entries[i]; i < entries.length; i++, item = entries[i]) {
		const [rawKey, ...valueArray] = item.split(options.valueDelimiter!);
		if (!rawKey)
			continue;
		const rawValue = valueArray.length ? valueArray.join(options.valueDelimiter) : null;
		const keyvalue = options.decode!(rawKey, rawValue, i);
		if (!keyvalue)
			continue;
		const [keyArray, value] = [[...keyvalue[0]], keyvalue[1]];
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
		values.push(value);
	}
	return normalize(result, values);
}

/**
 * Default implementation for encoding keys and values. The next rules are applied to values when encoding them:
 * - If the value is null then the whole item is discarded
 * - If it is `true` then `null` for value is returned. Null means that only the key will be inserted in the final query
 * - Empty arrays and objects are discarded
 * - Empty strings are preserved
 * - Only special chars are encoded in keys and values ("&", "=" etc.)
 * without a delimiter.
 * @param key Key path to encode.
 * @param value Value to encode.
 * @returns Encoded pair of key and value.
 * @example
 * ```ts
 * encode(["a"], 1);             // ["a", "1"]
 * encode(["a", "b"], null);     // null
 * encode(["a", "b", ""], true); // ["a[b][]", null]
 * ```
 */
export function encode(key: string[], value: any): [key: string, value: string | null] | null {
	if (value == null)
		return null;
	return [
		encodeKey(key),
		encodeValue(value)
	];
}

/**
 * Default implementation for decoding keys and values. The next rules are applied to values when decoding them:
 * - If value is `null`, then the parsed value is `true`
 * - If value is number, then it will be casted to `number`
 * - If value is "null", "undefined", "true", "false" then it will be casted to corresponding types
 * - If key is an empty string, then `null` is returned
 * - If key is "y", "yes", "on" or any contrary, then boolean is returned
 * @param key Raw key to decode.
 * @param value Raw value to decode.
 * @returns 
 * ```ts
 * decode("a", "string");  // [["a"], "string"]
 * decode("a[b][]", "12"); // [["a", "b", ""], 12]
 * decode("a[b]", null);   // [["a", "b"], true]
 * ```
 */
export function decode(key: string, value: string | null): [key: string[], value: any] | null {
	if (!key)
		return null;
	return [
		decodeKey(key),
		decodeValue(value)
	];
}

/**
 * Encodes an array of strings into a key.
 * @param key Key to encode.
 * @returns Encoded key.
 * @example
 * ```ts
 * encodeKey(["a"]);          // "a"
 * encodeKey(["a", "b"]);     // "a[b]"
 * encodeKey(["a", "b", ""]); // "a[b][]"
 * ```
 */
export function encodeKey(key: string[]): string {
	if (!key.length)
		return "";
	const firstItem = encodeURIComponent(key[0]);
	return key.length === 1 ? firstItem : firstItem + `[${key.slice(1).map(item => encodeURIComponent(item)).join("][")}]`;
}

/**
 * Encodes a value into a string or null.
 * @param value Value to encode.
 * @returns Encoded value or null.
 * ```ts
 * encodeValue(true);     // null
 * encodeValue(10);       // "10"
 * encodeValue("string"); // "string"
 * ```
 */
export function encodeValue(value: any): string | null {
	return value === true ? null : value == null ? "" : encodeURIComponent(value.toString());
}

/**
 * Decodes a key into a path array.
 * @param key Key to decode.
 * @returns Path array.
 * @example
 * ```ts
 * decodeKey("a");      // ["a"]
 * decodeKey("a[b]");   // ["a", "b"]
 * decodeKey("a[b][]"); // ["a", "b", ""]
 * ```
 */
export function decodeKey(key: string): string[] {
	const result: string[] = [];
	let inBrace = false;
	for (const char of key) {
		if (!result.length)
			result.push("");
		switch (char) {
			case "[": {
				if (inBrace) {
					result[result.length - 1] += char;
				} else {
					result.push("");
					inBrace = true;
				}
				break;
			}
			case "]": {
				if (inBrace) 
					inBrace = false;
				else
					result[result.length - 1] += char;
				break;
			}
			default: {
				result[result.length - 1] += char;
			}
		}
	}
	if (inBrace)
		result[result.length - 2] = result.at(-2) + "[" + result.pop();
	for (let i = 0; i < result.length; i++) 
		try {
			result[i] = decodeURIComponent(result[i]);
		} catch {}
	return result;
}

/**
 * Decodes a string value into a custom data.
 * @param value Value to decode.
 * @returns Decoded value.
 * @example
 * ```ts
 * decodeValue("string"); // "string"
 * decodeValue("yes");    // true
 * decodeValue("10");     // 10
 * ```
 */
export function decodeValue(value: string | null): any {
	switch (value) {
		case null:
			return true;
		case "":
			return "";
		case "undefined":
			return undefined;
		case "null":
			return null;
		default:
			const numValue = Number.parseFloat(value);
			if (!isNaN(numValue))
				return numValue;
			const boolValue = string.toBoolean(value);
			if (boolValue != null)
				return boolValue;
			try {
				return decodeURIComponent(value);
			} catch {
				return value;
			}
	}
}

function getNextIndex(object: any): number {
	const indices = Object.keys(object).map(k => +k).filter(k => !isNaN(k));
	return indices.length ? Math.max(...indices) + 1 : 0;
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
			continue;
		const [encodedKey, encodedValue] = keyvalue;
		result.push(encodedValue == null ? encodedKey : encodedKey + options.valueDelimiter + encodedValue);
	}
}

function shouldUseIndex(data: any, deep: boolean): boolean {
	const isObject = json.isObject(data);
	const isArray = json.isArray(data);
	if (!isObject && !isArray)
		return false;
	const keys = Object.keys(data);
	const isSparse = isArray && array.isSparse(data);
	const isComplex = deep ? isObject && keys.length > 1 || isArray && data.length > 1 && (!isSparse || isSparse && keys.length > 1) : isObject || isArray && isSparse;
	if (isComplex)
		return true;
	for (const k in data)
		if (shouldUseIndex(data[k], true))
			return true;
	return false;
}

function normalize(data: any, values: any[]): any {
	if (values.includes(data))
		return data;
	const origKeys = Object.keys(data);
	const numKeys = origKeys.map(key => Number.parseInt(key)).filter(key => !isNaN(key));
	const isArray = numKeys.length && numKeys.length === origKeys.length;
	const result = isArray ? new Array(numKeys.length ? Math.max(...numKeys) + 1 : 0) : data;
	for (const i in data)
		result[i] = typeof data[i] === "object" && data[i] != null ? normalize(data[i], values) : data[i];
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
	itemDelimiter: string;

	/**
	 * Which char to use as a delimiter between keys and values.
	 * @defaultValue `"="`
	 * @example
	 * ```ts
	 * stringify({a: 1, b: 2}, {valueDelimiter: ":"}); // "a:1&b:2"
	 * parse("a=1&b=2");                               // {a: 1, b: 2}
	 * ```
	 */
	valueDelimiter: string;
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
	indices: boolean;

	/**
	 * Key-value encoding function that should return both stringified key and value that will be used in the resulting
	 * query string. The function is called at every key-value item occurence. The default behavior description can be
	 * found in {@link encode} function docstrings.
	 * @param key Key path array. The array represents a nesting structure of the query string.
	 * @param value Value associated with the key. Null value represents that an item doesn't even have a key-value
	 *              delimiter to separate the item into a key and value (for example a string like `"a=1&b=&c"`. The
	 *              first item's value is `"1"`, the second one's is `""` and the third one's is `null`).
	 * @param index Zero-based position index.
	 * @returns A key-value pair that will be used as a final key and value for the query string or null to skip.
	 * @example
	 * The following function is called 5 times and the whole code returns `A.B.C=0&A.B.D=4&A.B.E=&A.B.F` as a result:
	 * 
	 * | k                 | v      | i   | Return result     |
	 * |-------------------|--------|-----|-------------------|
	 * | `["a", "b", "c"]` | `3`    | `0` | `["A.B.C", "0"]`  |
	 * | `["a", "b", "d"]` | `4`    | `1` | `["A.B.D", "4"]`  |
	 * | `["a", "b", "e"]` | `""`   | `2` | `["A.B.E", ""]`   |
	 * | `["a", "b", "f"]` | `null` | `3` | `["A.B.F", null]` |
	 * | `["a", "b", "g"]` | `NaN`  | `4` | `null`            |
	 * 
	 * ```ts
	 * stringify({a: {b: {c: 3, d: 4, e: "", f: null, g: NaN}}}, {
	 * 	encode: (k, v, i) => isNaN(v) ? null : [
	 * 		k.map(k => k.toUpperCase()).join("."),
	 * 		v ? v * i : v
	 * 	]
	 * }); // "A.B.C=0&A.B.D=4&A.B.E=&A.B.F"
	 * ```
	 */
	encode(key: string[], value: any, index: number): [key: string, value: string | null] | null;
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
	 * The following function is called 3 times and the whole code returns `{A: {B: {C: [1, 2, 3], D: ""}}}` as a result:
	 * 
	 * | k         | v         | i   | Return result                  |
	 * |-----------|-----------|-----|--------------------------------|
	 * | `"a.b.c"` | `"1,2,3"` | `0` | `[["A", "B", "C"], [1, 2, 3]]` |
	 * | `"a.b.d"` | `""`      | `1` | `[["A", "B", "D"], ""]`        |
	 * | `"a.b.e"` | `null`    | `2` | `null`                         |
	 * 
	 * ```ts
	 * parse("a.b.c=1,2,3&a.b.d=&a.b.e", {
	 * 	decode: (k, v, i) => v == null ? null : [
	 * 		k.toUpperCase().split("."),
	 * 		v.indexOf(",") >= 0 ? v.split(",").map(n => +n) : v
	 * 	]
	 * }); // {A: {B: {C: [1, 2, 3], D: ""}}}
	 * ```
	 */
	decode(key: string, value: string | null, index: number): [key: string[], value: any] | null;
}
