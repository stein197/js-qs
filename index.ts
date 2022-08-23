import jsonUtil from "@stein197/json-util";
import {Json, JsonArray, JsonObject} from "@stein197/ts-util";

const DEFAULT_OPTIONS: Options = {
	preserveEmpty: false
};

const DEFAULT_OPTIONS_STRINGIFY: StringifyOptions = {
	...DEFAULT_OPTIONS,
	indices: false,
	flags: true,
	nulls: false
};

const DEFAULT_OPTIONS_PARSE: ParseOptions = {
	...DEFAULT_OPTIONS,
	scalars: true
};

const QUERY_SEPARATOR = "&";
const KEY_VALUE_SEPARATOR = "=";

/**
 * Stringifies an object to query string.
 * @param data Object stringufy.
 * @param options Options to use.
 * @return Query string from the object. Returns empty string if the object is empty.
 */
export function stringify(data: Exclude<Json, null>, options: Partial<StringifyOptions> = DEFAULT_OPTIONS_STRINGIFY): string {
	return internalStringify(data, mergeObject(options, DEFAULT_OPTIONS_STRINGIFY), []);
}

/**
 * Parses the given string into an object. If the string contains multiple keys with different values then only the last
 * one is preserved. Keys without values and equal sign (i.e. "flags") are always preserved and being parsed as `true`.
 * For example:
 * @example Parsing flags
 * ```ts
 * qs.parse("a&b"); // {a: true, b: true}
 * ```
 * @param data String to parse.
 * @param options Options to use.
 * @return Object parsed from given string. Returns empty object if the string is empty.
 */
export function parse(data: string, options: Partial<ParseOptions> = DEFAULT_OPTIONS_PARSE): Exclude<Json, null> {
	const opts = mergeObject(options, DEFAULT_OPTIONS_PARSE);
	while (data != (data = decodeURIComponent(data)));
	data = data.replace(/^\?/, "");
	const result: any = {};
	for (const [key, value] of data.split(/&+/).filter(entry => entry).map(entry => parseEntry(entry, opts))) {
		let curObject = result;
		const lastKey = key.pop()!;
		for (const i in key) {
			let part = key[i];
			if (!part) {
				const indices = Object.keys(curObject).map(k => +k);
				part = (indices.length ? Math.max(...indices) + 1 : 0).toString();
			}
			if (!curObject[part] || typeof curObject[part] !== "object")
				curObject[part] = {};
			curObject = curObject[part];
		}
		curObject[lastKey] = value;
	}
	return normalize(result);
}

function internalStringify(data: Exclude<Json, null>, options: StringifyOptions, path: string[]): string {
	const result: string[] = [];
	for (const [key, value] of Object.entries(data)) {
		if (value == null || options.preserveEmpty && jsonUtil.isEmpty(value))
			continue;
		const pathClone = jsonUtil.clone(path);
		pathClone.push(Array.isArray(data) && !options.indices ? "" : key);
		if (typeof value === "object") {
			result.push(internalStringify(value, options, pathClone));
		} else {
			let qKey = pathClone.shift()!;
			qKey += pathClone.length ? `[${pathClone.join("][")}]` : "";
			if (options.flags)
				result.push(qKey);
			else
				result.push(`${qKey}=${encodeURIComponent(value.toString())}`);
		}
	}
	return result.join(QUERY_SEPARATOR);
}

function parseEntry(entry: string, options: ParseOptions): [key: string[], value?: any] {
	let [key, ...values] = entry.split(KEY_VALUE_SEPARATOR);
	let keyPath: string[] = [];
	let value: any = null;
	if (values.length) {
		value = values.join(KEY_VALUE_SEPARATOR);
		if (!options.preserveEmpty && !value)
			value = null;
		if (options.scalars) {
			if (value === "true")
				value = true;
			else if (value === "false")
				value = false;
			else if (!isNaN(+value))
				value = +value;
		}
	} else {
		value = true;
	}

	let matches = key.match(/\[[^\[\]]*\]/g);
	if (!matches) {
		keyPath = [key];
	} else {
		keyPath.push(key.split(/\[\]/, 1)[0]);
		keyPath.push(...matches);
	}

	return [keyPath, value];
}

function normalize(data: JsonObject): JsonObject | JsonArray {
	const isArray = Object.keys(data).every(k => k.match(/^\d+$/));
	const result: JsonArray | JsonObject = isArray ? [] : {};
	for (const i in data)
		result[i as any] = typeof data[i] === "object" ? normalize(data[i] as JsonObject) : data[i];
	return result;
}

function mergeObject<T extends Options>(userObject: Partial<T>, defaultObject: T): T {
	return (userObject === defaultObject ? userObject : {
		...defaultObject,
		...userObject
	}) as T;
}

// TODO: What to do with URL encoding/decoding? Encode keys/values?
type Options = {

	/**
	 * Preserves entries with empty values if `true`, `false` by default. Empty values are "", [] and {}. Does not
	 * discard flags when parsing.
	 * @example
	 * ```ts
	 * qs.stringify({a: 1, b: ""}, {preserveEmpty: false});  // "a=1"
	 * qs.parse("a=1&b=&c", {preserveEmpty: true});          // {a: "1", b: "", c: true}
	 * ```
	 */
	preserveEmpty: boolean;
}

type StringifyOptions = Options & {

	/**
	 * Outputs indices for arrays if `true`, `false` by default.
	 * @example
	 * ```ts
	 * qs.stringify({a: [1]}, {indices: true});  // "a[0]=1"
	 * qs.stringify({a: [1]}, {indices: false}); // "a[]=1"
	 * ```
	 */
	indices: boolean;

	/**
	 * Converts entries with `true` values as a query flag (key without value and assign character) when stringifying.
	 * Converts query flags to an entries with `true` value when parsing. Otherwise consider these values as strings.
	 * `true` by default.
	 * @example
	 * ```ts
	 * qs.stringify({a: 1, b: true}, {flags: true});  // "a=1&b"
	 * qs.stringify({a: 1, b: true}, {flags: false}); // "a=1&b=true"
	 * ```
	 */
	flags: boolean;

	/**
	 * Stringifies `null` and `undefined` values if `true`. `false` by default.
	 * @example
	 * ```ts
	 * qs.stringify({a: null, b: undefined}, {nulls: true});  // "a=null&b=undefined"
	 * qs.stringify({a: null, b: undefined}, {nulls: false}); // ""
	 * ```
	 */
	nulls: boolean;
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
	 * qs.parse("a=true&b=1", {scalars: true});  // {a: true, b: 1}
	 * qs.parse("a=true&b=1", {scalars: false}); // {a: "true", b: "1"}
	 * ```
	 */
	scalars: boolean;
}
