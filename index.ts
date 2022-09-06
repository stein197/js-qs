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

const CHAR_BACKSLASH = "\\";
const CHAR_AMPERSAND = "&";
const CHAR_EQUALS = "=";
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
// TODO: {} -> Object.create(null)
export function parse(data: string, options: Partial<ParseOptions> = DEFAULT_OPTIONS_PARSE): Stringifyable {
	const opts = mergeObject(options, DEFAULT_OPTIONS_PARSE);
	const result: any = {};
	const entries = data.split(REGEX_ENTRIES).filter(entry => entry);
	for (let i = 0, entry = entries[i]; i < entries.length; i++, entry = entries[i]) {
		const [key, ...values] = entry.split(CHAR_EQUALS);
		let value: any;
		if (values.length) {
			value = values.join(CHAR_EQUALS);
			try {
				value = decodeURIComponent(value);
			} catch {}
			if (opts.scalars)
				value = castValue(value);
		} else {
			value = true;
		}
		let keyPath: string[] = parseKey(key);
		let curObj = result;
		let lastKey = keyPath.pop()!;
		for (let k of keyPath) {
			k = k || getNextIndex(curObj).toString();
			if (!curObj[k] || typeof curObj[k] !== "object")
				curObj[k] = {};
			curObj = curObj[k];
		}
		lastKey = lastKey || getNextIndex(curObj).toString();
		curObj[lastKey] = options.decodeValue?.(key, value, i) ?? value;
	}
	if (!opts.preserveEmpty)
		cleanup(result);
	return normalize(result);
}

function getNextIndex(object: any): number {
	const indices = Object.keys(object).map(k => +k).filter(k => !isNaN(k));
	return indices.length ? Math.max(...indices) + 1 : 0;
}

function parseKey(key: string): string[] {
	const result = [];
	let curKey: string | null = "";
	let inBrace = false;
	for (const char of key) {
		if (char === "[" || char === "]") {
			if (!inBrace && char === "]" || inBrace && char === "[") {
				curKey += char;
				continue;
			}
			if (curKey != null)
				result.push(curKey);
			inBrace = char === "[";
			curKey = char === "[" ? "" : null;
		} else {
			curKey += char;
		}
	}
	if (inBrace)
		result[result.length - 1] = result[result.length - 1] + "[" + (curKey ?? "");
	else if (curKey != null)
		result.push(curKey);
	return result.map(k => decodeURIComponent(k));
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

function castValue(value: string): undefined | null | boolean | number | string {
	if (value === "undefined")
		return undefined;
	if (value === "null")
		return null;
	if (value === "true")
		return true;
	if (value === "false")
		return false;
	if (isBlank(value))
		return value;
	const numValue = parseNumber(value);
	return isNaN(numValue) ? value : numValue;
}

function internalStringify(data: Stringifyable, options: StringifyOptions, path: string[]): string {
	const result: string[] = [];
	const needIndex = !path.length || shouldUseIndex(data, false);
	for (const [key, value] of Object.entries(data)) {
		const isNull = value == null;
		if (!options.preserveEmpty && !isNull && isEmpty(value) || !options.nulls && isNull)
			continue;
		const pathCopy = jsonUtil.clone(path);
		pathCopy.push(options.indices || needIndex ? key : "");
		let strKey = encode(pathCopy[0], options.encodeKeys) + (pathCopy.length > 1 ? `[${pathCopy.slice(1).map(k => encode(k, options.encodeKeys)).join("][")}]` : "");
		if (!isNull && typeof value === "object") {
			const strValue = internalStringify(value, options, pathCopy);
			if (options.preserveEmpty && !strValue)
				result.push(`${strKey}=`);
			else
				result.push(strValue);
		} else {
			if (value === true && options.flags)
				result.push(strKey);
			else
				result.push(`${strKey}=${encode(String(value), options.encodeValues)}`);
		}
	}
	return result.join(CHAR_AMPERSAND);
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
		result += CHARS_ESCAPE.includes(char) ? CHAR_BACKSLASH + char : char;
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

function isBlank(string: string): boolean {
	return !!string.match(/^\s*$/);
}

function cleanup(data: Stringifyable): void {
	for (const i in data) {
		const value = data[i];
		if (typeof value === "object" && value != null)
			cleanup(value);
		if (isEmpty(value))
			delete data[i];
	}
}

function normalize(data: Stringifyable): Stringifyable {
	const originalKeys = Object.keys(data);
	const castedKeys = originalKeys.filter(key => key.match(/^\d+$/)).map(key => +key);
	const isDataArray = castedKeys.length && castedKeys.length === originalKeys.length;
	const result = isDataArray ? new Array(castedKeys.length ? Math.max(...castedKeys) + 1 : 0) : data;
	for (const i in data)
		result[i] = typeof data[i] === "object" && data[i] != null ? normalize(data[i]) : data[i];
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

	/**
	 * Function that should return custom value for each entry. When provided, the function gets called for each entry
	 * and the result will override the default values. Example:
	 * @example
	 * ```ts
	 * parse("a=1&b=2", {decodeValue: (key, value, index) => value * 2}); // {a: 2, b: 4}
	 * ```
	 * `undefined` by default (`parse()` returns only parsed values).
	 * @param key Raw entry key.
	 * @param value Parsed entry value.
	 * @param index Index of the entry. The index matches the position of the entry in the raw query string.
	 * @returns A new value that will override the default one.
	 */
	decodeValue?(key: string, value: undefined | null | boolean | number | string, index: number): any;
}
