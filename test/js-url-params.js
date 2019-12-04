var chai = require("chai");
let params = require("../src/js-url-params.js");

describe("Testing URLParams.queriesAreEqual", () => {
	let f = params.URLParams.queriesAreEqual;
	it("False when args are not strings", () => {
		chai.assert.isFalse(f(true, "string"));
		chai.assert.isFalse(f(1, null));
	});
	
	it("True when strings are both empty", () => {
		chai.assert.isTrue(f("", ""));
	});

	it("True when strings are equal", () => {
		chai.assert.isTrue(f("param1=true", "param1=true"));
		chai.assert.isTrue(f("param1=true&param2=false", "param1=true&param2=false"));
		chai.assert.isTrue(f("querystring", "querystring"));
	});
});
describe("Testing", () => {

});
