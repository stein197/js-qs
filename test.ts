import * as qs from ".";
import * as mocha from "mocha";
import "should";

/*-------------------------------------------------------
stringify() should be tested against:
- Empty object
- Empty array
- Empty values (null, "", [], {})
- Simple object
- Simple array
- Nested arrays
- Nested objects
- Nested array in objects
- Nested objects in arrays
stringify() should be tested with options:
- discardEmpty
- indices
- flags
parse() should be tested against:
- Empty string
- Simple string
- String with no values for keys
- String with flags
- String with numeric and string keys for a single entry
parse() should be tested with options:
- discardEmpty
- scalars
-------------------------------------------------------*/

mocha.describe("stringify()", () => {
	mocha.it.skip("Should return empty string when the object is empty", () => {});
	mocha.it.skip("Should not discard empty values", () => {});
	mocha.it.skip("Should not discard empty values when object is nesting", () => {});
	mocha.it.skip("Should convert flags to true", () => {});
	mocha.it.skip("Should use indices when object contains string and numeric keys", () => {});
	mocha.it.skip("Should not use indices", () => {});
	mocha.it.skip("Should be correct when the object contains nested arrays", () => {});
	mocha.it.skip("Should be correct and use indices when the object contains nested arrays with contain objects", () => {});

	mocha.describe.skip("stringify({...}, {discardEmpty})", () => {});
	mocha.describe.skip("stringify({...}, {flags})", () => {});
	mocha.describe.skip("stringify({...}, {indices})", () => {});
});

mocha.describe("parse()", () => {
	mocha.it.skip("Should return empty object when the string is empty", () => {});
	mocha.it.skip("Should return decoded values when the string is encoded", () => {});
	mocha.it.skip("Should discard leading question mark", () => {});
	mocha.it.skip("Should discard edge ampersands", () => {});
	mocha.it.skip("Should discard multiple ampersands", () => {});
	mocha.it.skip("Should preserve keys with empty values", () => {});
	mocha.it.skip("Should return true for flags", () => {});
	mocha.it.skip("Should return the last value for multiple key occurences", () => {});
	mocha.it.skip("Should return object for strings \"a[b]=1&a[]=2\" and produce consequential numeric keys for empty keys", () => {});
	mocha.it.skip("Should return an array when the top-level keys are numbers", () => {});

	mocha.describe.skip("parse({...}, {discardEmpty})", () => {});
	mocha.describe.skip("parse({...}, {scalars})", () => {});
});

mocha.describe("stringify(...) === parse(...)", () => {

});

// TODO: test url encoding, see npm qs
