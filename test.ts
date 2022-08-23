import * as qs from ".";
import * as mocha from "mocha";
import "should";

/*-------------------------------------------------------
toString() should be tested against:
- Empty object
- Empty array
- Empty values (null, "", [], {})
- Simple object
- Simple array
- Nested arrays
- Nested objects
- Nested array in objects
- Nested objects in arrays
toString() should be tested with options:
- discardEmpty
- indices
- flags
fromString() should be tested against:
- Empty string
- Simple string
- String with no values for keys
- String with flags
- String with numeric and string keys for a single entry
fromString() should be tested with options:
- discardEmpty
- inferTypes
-------------------------------------------------------*/

mocha.describe("toString()", () => {
	mocha.it.skip("Should return empty string when the object is empty", () => {});
	mocha.it.skip("Should not discard empty values", () => {});
	mocha.it.skip("Should not discard empty values when object is nesting", () => {});
	mocha.it.skip("Should convert flags to true", () => {});
	mocha.it.skip("Should use indices when object contains string and numeric keys", () => {});
	mocha.it.skip("Should not use indices", () => {});
	mocha.it.skip("Should be correct when the object contains nested arrays", () => {});
	mocha.it.skip("Should be correct and use indices when the object contains nested arrays with contain objects", () => {});

	mocha.describe.skip("toString({...}, {discardEmpty})", () => {});
	mocha.describe.skip("toString({...}, {flags})", () => {});
	mocha.describe.skip("toString({...}, {indices})", () => {});
});

mocha.describe("fromString()", () => {
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

	mocha.describe.skip("fromString({...}, {discardEmpty})", () => {});
	mocha.describe.skip("fromString({...}, {inferTypes})", () => {});
});

mocha.describe("toString(...) === fromString(...)", () => {

});

// TODO: test url encoding, see npm qs
