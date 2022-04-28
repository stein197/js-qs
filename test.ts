import * as qs from ".";
import * as mocha from "mocha";
import "should";

mocha.describe("toString()", () => {
	mocha.it("Should return empty object when the string is empty", () => {});
	mocha.it("Should not discard empty values", () => {});
	mocha.it("Should not discard empty values when object is nesting", () => {});
	mocha.it("Should convert flags to true", () => {});
	mocha.it("Should use indices when object contains string and numeric keys", () => {});
	mocha.it("Should not use indices", () => {});
	mocha.it("Should be correct when the object contains nested arrays", () => {});
	mocha.it("Should be correct and use indices when the object contains nested arrays with contain objects", () => {});
	
	mocha.describe("toString({...}, {discardEmpty})", () => {});
	mocha.describe("toString({...}, {useFlags})", () => {});
	mocha.describe("toString({...}, {useIndices})", () => {});
});

mocha.describe("fromString()", () => {
	mocha.describe("fromString({...}, {discardEmpty})", () => {});
	mocha.describe("fromString({...}, {emptyTypes})", () => {});
});

mocha.describe("toString(...) === fromString(...)", () => {
	
});

// TODO: test url encoding, see npm qs
