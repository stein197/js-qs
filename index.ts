import * as jsonUtil from "@stein197/json-util";

const DEFAULT_OPTIONS: Options = {
	preserveEmpty: false
};

const DEFAULT_OPTIONS_STRINGIFY: StringifyOptions = {
	...DEFAULT_OPTIONS,
	indices: false,
	flags: true,
	nulls: false,
	encodeKeys: false,
	encodeValues: false
};

const DEFAULT_OPTIONS_PARSE: ParseOptions = {
	...DEFAULT_OPTIONS,
	scalars: true
};

const CHARS_RESERVED: string[] = [
	"%", "=", "&", "[", "]"
];

const CHARS_ESCAPE: string[] = [
	"\"", "'", "\\"
];

const CHAR_STRING_ESCAPE = "\\";
const QUERY_SEPARATOR = "&";
const KEY_VALUE_SEPARATOR = "=";
const REGEX_ENTRIES = /&+/;

/**
 * Stringifies an object or array to a query string.
 * @param data Object to stringify.
 * @param options Options to use.
 * @return Query string from the object. Returns empty string if the object is empty.
 * @throws {@link ReferenceError} When data contains circular references.
 */
export function stringify(data: Stringifyable, options: Partial<StringifyOptions> = DEFAULT_OPTIONS_STRINGIFY): string {
	checkCircularReferences(data, [], []);
	return internalStringify(data, mergeObject(options, DEFAULT_OPTIONS_STRINGIFY), []);
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
export function parse(data: string, options: Partial<ParseOptions> = DEFAULT_OPTIONS_PARSE): Stringifyable {
	const opts = mergeObject(options, DEFAULT_OPTIONS_PARSE);
	const result: any = {};
	const entries = data.split(REGEX_ENTRIES).filter(entry => entry);
	for (const entry of entries) {
		const [key, ...values] = entry.split(KEY_VALUE_SEPARATOR);
		let value: any;
		if (values.length) {
			value = values.join(KEY_VALUE_SEPARATOR);
			try {
				value = decodeURIComponent(value);
			} catch {}
			if (!opts.preserveEmpty && !value)
				continue;
			if (opts.scalars)
				value = castValue(value);
		} else {
			value = true;
		}
		let keyPath: string[] = parseKey(key);
		let curObj = result;
		const lastKey = keyPath.pop()!;
		for (let k of keyPath) {
			if (!k) {
				const indices = Object.keys(curObj).map(k => +k).filter(k => !isNaN(k));
				k = (indices.length ? Math.max(...indices) + 1 : 0).toString();
			}
			if (!curObj[k] || typeof curObj[k] !== "object")
				curObj[k] = {};
			curObj = curObj[k];
		}
		curObj[lastKey] = value;
	}
	return normalize(result);
}

function parseKey(key: string): string[] {
	const result: string[] = [];
	let curKey: string | null = "";
	for (const char of key) {
		if (char === "[" || char === "]") {
			if (curKey != null)
				result.push(curKey);
			curKey = char === "[" ? "" : null;
		} else {
			curKey += char;
		}
	}
	if (curKey != null)
		result.push(curKey);
	return result.map(k => decodeURIComponent(k));
}

function castValue(value: string): undefined | null | boolean | number | string {
	if (value === "undefined")
		return undefined;
	if (value === "null")
		return null;
	if (value === "true")
		return true;
	if (value === "false")
		return false;
	const numValue = +value;
	return isNaN(numValue) ? value : numValue;
}

function internalStringify(data: Stringifyable, options: StringifyOptions, path: string[]): string {
	const result: string[] = [];
	const needIndex = !path.length || shouldUseIndex(data, false);
	for (const [key, value] of Object.entries(data)) {
		const isNull = value == null;
		if (!options.preserveEmpty && !isNull && isEmpty(value) || !options.nulls && value == null)
			continue;
		const pathCopy = jsonUtil.clone(path);
		pathCopy.push(options.indices || needIndex ? key : "");
		// TODO: Refactor it, pull qKey out, remove redundant ifs
		if (!isNull && typeof value === "object") {
			const strResult = internalStringify(value, options, pathCopy);
			if (options.preserveEmpty && !strResult) {
				result.push(encode(pathCopy.shift()!, options.encodeKeys) + (pathCopy.length ? `[${pathCopy.map(k => encode(k, options.encodeKeys)).join("][")}]` : "") + "=")
			} else {
				result.push(strResult);
			}
		} else {
			let qKey = encode(pathCopy.shift()!, options.encodeKeys);
			qKey += pathCopy.length ? `[${pathCopy.map(k => encode(k, options.encodeKeys)).join("][")}]` : "";
			if (value === true && options.flags)
				result.push(qKey);
			else
				result.push(`${qKey}=${encode(String(value), options.encodeValues)}`);
		}
	}
	return result.join(QUERY_SEPARATOR);
}

function encode(data: string, force: boolean): string {
	if (force)
		return encodeURIComponent(data);
	let result: string = "";
	for (const char of data)
		result += CHARS_RESERVED.includes(char) ? encodeURIComponent(char) : char;
	return result;
}

function escape(string: string): string {
	let result = "";
	for (const char of string)
		result += CHARS_ESCAPE.includes(char) ? CHAR_STRING_ESCAPE + char : char;
	return result;
}

function isEmpty(data: any): boolean {
	const dataType = typeof data;
	if (dataType === "string")
		return !data.length;
	if (dataType !== "object")
		return false;
	for (const i in data)
		if (!isEmpty(data[i]))
			return false;
	return true;
}

function shouldUseIndex(data: any, deep: boolean): boolean {
	const isObject = jsonUtil.isObject(data);
	const isArray = jsonUtil.isArray(data);
	if (!isObject && !isArray)
		return false;
	const keys = Object.keys(data);
	const sparse = isArray && isSparse(data);
	const isComplex = deep ? isObject && keys.length > 1 || isArray && data.length > 1 && (!sparse || sparse && keys.length > 1) : isObject || isArray && sparse;
	if (isComplex)
		return true;
	for (const i in data)
		// @ts-ignore
		if (shouldUseIndex(data[i], true))
			return true;
	return false;
}

function checkCircularReferences(data: Stringifyable, path: string[], references: Stringifyable[]): void | never {
	if (references.includes(data))
		throw new ReferenceError(`Cannot stringify data because of circular reference at ${path.map(k => isNaN(+k) ? `["${escape(k)}"]` : `[${k}]`).join("")}`);
	references.push(data);
	for (const i in data) {
		if (typeof data[i] !== "object")
			continue;
		const pathCopy = jsonUtil.clone(path);
		pathCopy.push(i);
		checkCircularReferences(data[i], pathCopy, references);
	}
}

function isSparse(array: any[]): boolean {
	return array.length !== Object.keys(array).length;
}

function normalize(data: Stringifyable): Stringifyable {
	const originalKeys = Object.keys(data);
	const castedKeys = originalKeys.map(key => +key);
	const isDataArray = castedKeys.length && castedKeys.every(key => !isNaN(key) && Math.round(key) === key);
	const result = isDataArray ? new Array(castedKeys.length ? Math.max(...castedKeys) + 1 : 0) : data;
	for (const i in data)
		result[i] = typeof data[i] === "object" ? normalize(data[i]) : data[i];
	return result;
}

function mergeObject<T extends Options>(userObject: Partial<T>, defaultObject: T): T {
	return (userObject === defaultObject ? userObject : {
		...defaultObject,
		...userObject
	}) as T;
}

type Stringifyable = any[] | {
	[k: string]: any;
	[k: number]: any;
}

type Options = {

	/**
	 * Preserves entries with empty values if `true`, `false` by default. Empty values are "", [] and {}. Does not
	 * discard flags when parsing.
	 * @example
	 * ```ts
	 * stringify({a: 1, b: ""}, {preserveEmpty: false});  // "a=1"
	 * parse("a=1&b=&c", {preserveEmpty: true});          // {a: "1", b: "", c: true}
	 * ```
	 */
	preserveEmpty: boolean;
}

type StringifyOptions = Options & {

	/**
	 * Outputs indices for arrays if `true`, `false` by default.
	 * @example
	 * ```ts
	 * stringify({a: [1]}, {indices: true});  // "a[0]=1"
	 * stringify({a: [1]}, {indices: false}); // "a[]=1"
	 * ```
	 */
	indices: boolean;

	/**
	 * Converts entries with `true` values as a query flag (key without value and assign character) when stringifying.
	 * Converts query flags to an entries with `true` value when parsing. Otherwise consider these values as strings.
	 * `true` by default.
	 * @example
	 * ```ts
	 * stringify({a: 1, b: true}, {flags: true});  // "a=1&b"
	 * stringify({a: 1, b: true}, {flags: false}); // "a=1&b=true"
	 * ```
	 */
	flags: boolean;

	/**
	 * Stringifies `null` and `undefined` values if `true`. `false` by default.
	 * @example
	 * ```ts
	 * stringify({a: null, b: undefined}, {nulls: true});  // "a=null&b=undefined"
	 * stringify({a: null, b: undefined}, {nulls: false}); // ""
	 * ```
	 */
	nulls: boolean;

	/**
	 * Encodes keys in percent notation. `false` by default. Note than if the key contains "special" characters, then
	 * they will be encoded anyway even of the option is unset.
	 * @example
	 * ```ts
	 * stringify({":a": "1"}, {encodeKeys: false}); // "%3Aa=1"
	 * ```
	 */
	encodeKeys: boolean;

	/**
	 * Encodes values in percent notation. `false` by default. Note than if the key contains "special" characters, then
	 * they will be encoded anyway even of the option is unset.
	 * @example
	 * ```ts
	 * stringify({1: ":a"}, {encodeValues: false}); // "1=%3Aa"
	 * ```
	 */
	encodeValues: boolean;
}

type ParseOptions = Options & {

	/**
	 * Convers a value to a corresponding type if possible. Available convertations are:
	 * - boolean ("true" => true)
	 * - number ("1" => 1)
	 * - null ("null" => null)
	 * - undefined ("undefined" => undefined)
	 * 
	 * `true` by default.
	 * @example
	 * ```ts
	 * parse("a=true&b=1", {scalars: true});  // {a: true, b: 1}
	 * parse("a=true&b=1", {scalars: false}); // {a: "true", b: "1"}
	 * ```
	 */
	scalars: boolean;
}
