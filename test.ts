import * as qs from ".";
import * as mocha from "mocha";
import "should";

mocha.describe("toString()", () => {
	mocha.describe("toString({...}, {discardEmpty})", () => {});
	mocha.describe("toString({...}, {useFlags})", () => {});
	mocha.describe("toString({...}, {useIndices})", () => {});
});

mocha.describe("fromString()", () => {
	mocha.describe("fromString({...}, {discardEmpty})", () => {});
	mocha.describe("fromString({...}, {emptyTypes})", () => {});
});

// TODO: test url encoding, see npm qs
