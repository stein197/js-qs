import jsonUtil from "@stein197/json-util";

const DEFAULT_OPTIONS: Options = {
	discardEmpty: false,
	useFlags: true
}

const DEFAULT_OPTIONS_STRINGIFY: StringifyOptions = {
	...DEFAULT_OPTIONS,
	useIndices: false
}

const DEFAULT_OPTIONS_PARSE: ParseOptions = {
	...DEFAULT_OPTIONS,
	inferTypes: false
}

/**
 * Stringifies an object to query string.
 * @param data Object stringufy.
 * @return Query string from the object. Returns empty string if the object is empty.
 */
export function toString(data: object, options: Partial<StringifyOptions> = DEFAULT_OPTIONS_STRINGIFY): string {
	return stringify(data, mergeOptions(options, DEFAULT_OPTIONS_STRINGIFY), []);
}

/**
 * Parses the given string into an object.
 * @param data String to parse.
 * @return Object parsed from given string. Returns empty object if the string is empty.
 */
export function fromString(data: string, options: Partial<ParseOptions> = DEFAULT_OPTIONS_PARSE): object {
	options = mergeOptions(options, DEFAULT_OPTIONS_PARSE);
	while (data != (data = decodeURIComponent(data)));
	data = data.replace(/^\?/, "");
	const result = {};
}

function stringify(data: object, options: StringifyOptions, path: string[]): string {
	const result: string[] = [];
	for (const key in data) {
		const value = data[key];
		if (options.discardEmpty && jsonUtil.isEmpty(value))
			continue;
		const pathClone = jsonUtil.clone(path);
		pathClone.push(Array.isArray(data) && !options.useIndices ? "" : key);
		if (typeof value === "object") {
			result.push(stringify(value, options, pathClone));
		} else {
			let qKey = pathClone.shift()!;
			qKey += pathClone.length ? `[${pathClone.join("][")}]` : "";
			if (options.useFlags)
				result.push(qKey);
			else
				result.push(`${qKey}=${encodeURIComponent(value.toString())}`);
		}
	}
	return result.join("&");
}

function parse(data: object, options: ParseOptions, result: object): object {}

function mergeOptions<T extends Options>(userOptions: Partial<T>, defaultOptions: T): T {
	return (userOptions === defaultOptions ? userOptions : {
		...defaultOptions,
		...userOptions
	}) as T;
}

type Options = {

	/**
	 * Discards entries with empty values if `true`, `false` by default. Empty values are "", [] and {}
	 * @example
	 * ```ts
	 * qs.toString({a: 1, b: ""}, {discardEmpty: true}); // "a=1"
	 * qs.fromString("a=1&b=", {discardEmpty: true});    // {a: "1"}
	 * ```
	 */
	discardEmpty: boolean;

	/**
	 * Converts entries with `true` values as a query flag (key without value and assign character) when stringifying.
	 * Converts query flags to an entries with `true` value when parsing. Otherwise consider these values as strings.
	 * `true` by default.
	 * @example
	 * ```ts
	 * qs.toString({a: 1, b: true}, {useFlags: true}); // "a=1&b"
	 * qs.fromString("a=1&b", {useFlags: true});       // {a: "1", b: true}
	 * ```
	 */
	useFlags: boolean;
}

type StringifyOptions = Options & {

	/**
	 * Outputs indices for arrays if `true`, `false` by default.
	 * @example
	 * ```ts
	 * qs.toString({a: [1]}, {useIndices: true});  // "a[0]=1"
	 * qs.toString({a: [1]}, {useIndices: false}); // "a[]=1"
	 * ```
	 */
	useIndices: boolean;
}

type ParseOptions = Options & {

	/**
	 * If entry values could be converted to a corresponding type ("true" to true, "1" to 1, etc.) then do it, `false`
	 * by default.
	 * @example
	 * ```ts
	 * qs.fromString("a=true&b=1", {inferTypes: true});  // {a: true, b: 1}
	 * qs.fromString("a=true&b=1", {inferTypes: false}); // {a: "true", b: "1"}
	 * ```
	 */
	inferTypes: boolean;
}
