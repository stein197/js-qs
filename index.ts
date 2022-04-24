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
	options = mergeOptions(options);
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
