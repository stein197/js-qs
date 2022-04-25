import jsonUtil from "@stein197/json-util";

const DEFAULT_OPTIONS: Options = {
	discardEmpty: false,
	inferTypes: false,
	emitIndices: false
}

/**
 * Stringifies an object to query string.
 * @param data Object stringufy.
 * @return Query string from the object. Returns empty string if the object is empty.
 */
export function toString(data: object, options: Partial<Options> = DEFAULT_OPTIONS): string {
	return stringify(data, mergeOptions(options), []);
}

/**
 * Parses the given string into an object.
 * @param data String to parse.
 * @return Object parsed from given string. Returns empty object if the string is empty.
 */
export function fromString(data: string, options: Partial<Options> = DEFAULT_OPTIONS): object {
	options = mergeOptions(options);
	while (data != (data = decodeURIComponent(data)));
	data = data.replace(/^\?/, "");
}

function stringify(data: object, options: Options, path: string[]): string {
	const result: string[] = [];
	for (const key in data) {
		const value = data[key];
		if (options.discardEmpty && jsonUtil.isEmpty(value))
			continue;
		const pathClone = jsonUtil.clone(path);
		pathClone.push(Array.isArray(data) && !options.emitIndices ? "" : key);
		if (typeof value === "object") {
			result.push(stringify(value, options, pathClone));
		} else {
			let qKey = pathClone.shift()!;
			qKey += pathClone.length ? `[${pathClone.join("][")}]` : "";
			result.push(`${qKey}=${encodeURIComponent(value.toString())}`);
		}
	}
	return result.join("&");
}

function mergeOptions(options: Partial<Options>): Options {
	return (options === DEFAULT_OPTIONS ? options : {
		...DEFAULT_OPTIONS,
		...options
	}) as Options;
}

type Options = {
	/** Discards entries with empty values if set to `true`. `false` by default. */
	discardEmpty: boolean;
	/** If entry values could be converted to a corresponding type ("true" to true, "1" to 1, etc.) then do it. `false` by default. */
	inferTypes: boolean;
	/** Outputs indices for arrays when stringifying if `true`. `false` by default. */
	emitIndices: boolean;
}