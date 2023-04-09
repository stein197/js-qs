import * as utilArray from "@stein197/util/array";
import * as utilJson from "@stein197/util/json";
import type * as type from "@stein197/type";

const DEFAULT_OPTIONS: Options = {
	empty: false,
	entryDelimiter: "&",
	valueDelimiter: "="
};

const DEFAULT_OPTIONS_STRINGIFY: StringifyOptions = {
	...DEFAULT_OPTIONS,
	indices: false,
	encode: false,
	key: encodeKey,
	value: encodeValue
};

const DEFAULT_OPTIONS_PARSE: ParseOptions = {
	...DEFAULT_OPTIONS,
	decode: false,
	key: decodeKey,
	value: decodeValue
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
	return result.join(options.entryDelimiter);
	// return internalStringify(data, mergeObject(options, DEFAULT_OPTIONS_STRINGIFY), []).join(options.entryDelimiter);
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
	const entries = data.split(options.entryDelimiter!).filter(entry => entry);
	for (let i = 0, entry = entries[i]; i < entries.length; i++, entry = entries[i]) {
		const [rawKey, ...valueArray] = entry.split(options.valueDelimiter!);
		if (!rawKey)
			continue;
		const rawValue = valueArray.length ? valueArray.join(options.valueDelimiter) : null;
		let value: any = rawValue;
		if (options.decode)
			try {
				value = decodeURIComponent(value);
			} catch {}
		value = options.value!(rawKey, rawValue, i);
		const keyArray = options.key!(rawKey, rawValue, i);
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
	if (!options.empty) // TODO: Make cleanup right here and delete cleanup() function?
		removeEmptyValues(result);
	return normalize(result);
}

// TODO
export function encodeKey(key: string[]): string {
	const firstItem = encodeSpecialChars(key[0]);
	return key.length === 1 ? firstItem : firstItem + `[${key.slice(1).map(item => encodeSpecialChars(item)).join("][")}]`;
}

// TODO
export function encodeValue(...[, value]: [never, any]): string {
	return value == null ? "" : encodeSpecialChars(value.toString());
}

// TODO
export function decodeKey(key: string): string[] {
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

// TODO
export function decodeValue(...[, value]: [never, string | null]): any {
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
		if (!options.empty && isEmpty(value))
			continue;
		const keyPathCopy = [...keyPath];
		keyPathCopy.push(options.indices || needIndex ? key : "");
		if (value != null && typeof value === "object") {
			internalStringify(value, options, keyPathCopy, result);
			// if (nestValue || options.empty)
			// 	result.push(...nestValue);
			continue;
		}
		let encodedKeyPath = keyPathCopy.map(k => options.encode ? encodeURIComponent(k) : k);
		const encodedKey = options.key(encodedKeyPath, value, result.length);
		result.push(encodedKey + options.valueDelimiter + (options.encode ? encodeURIComponent(String(value)) : value));
	}
}

function encodeSpecialChars(data: string): string {
	let result: string = "";
	for (const char of data)
		result += CHARS_RESERVED.includes(char) ? encodeURIComponent(char) : char;
	return result;
}

function isEmpty(data: any): boolean {
	const dataType = typeof data;
	if (dataType === "string")
		return !data.length;
	if (dataType !== "object" || data == null)
		return false;
	for (const i in data)
		if (!isEmpty(data[i]))
			return false;
	return true;
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

function removeEmptyValues(data: any): void {
	for (const i in data) {
		const value = data[i];
		if (typeof value === "object" && value != null)
			removeEmptyValues(value);
		if (isEmpty(value))
			delete data[i];
	}
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
	 * Preserves entries with empty values if `true`, `false` by default. Empty values are "", [] and {}. Does not
	 * discard flags when parsing.
	 * @example
	 * ```ts
	 * stringify({a: 1, b: ""}, {empty: false});  // "a=1"
	 * parse("a=1&b=&c", {empty: true});          // {a: "1", b: "", c: true}
	 * ```
	 */
	empty: boolean;
	// TODO
	entryDelimiter: string;
	// TODO
	valueDelimiter: string;
}

type StringifyOptions = Options & {

	// TODO
	indices: boolean;
	// TODO
	encode: boolean;
	// TODO
	key(key: string[], value: any, index: number): string;
	// TODO
	value(key: string[], value: any, index: number): string;
}

type ParseOptions = Options & {

	// TODO
	decode: boolean;
	// TODO
	key(key: string, value: string | null, index: number): string[];
	// TODO
	value(key: string, value: string | null, index: number): any;
}
