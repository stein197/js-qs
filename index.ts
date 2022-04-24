/**
 * Recursively converts object to query string.
 * @param data Object to be converted to query string.
 * @return Query string presented by data parameter. Empty if the object is empty.
 */
export function toString(data: object): string {
	return encodeURIComponent(result);
}

/**
 * Parses given string into object structure.
 * @param data String to be parsed into an object.
 * @return Object parsed from given string. Returns empty object if string is empty.
 */
export function fromString(data: string): object {
	data = decodeURIComponent(data).replace(/^\?/, "");
}
