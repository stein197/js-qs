var chai = require("chai");
let params = require("../src/js-url-params.js");

describe("Testing URLParams.queriesAreEqual(string, string)", () => {
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
		chai.assert.isTrue(f("query&string", "query&string"));
	});

	it("False when strings have different lengths", () => {
		chai.assert.isFalse(f("param", "param2"));
		chai.assert.isFalse(f("", "param"));
	});

	it("Query strings are equal on unordered params", () => {
		chai.assert.isTrue(f(" param1=1&param2=2 ", "  param2=2&param1=1"));
		chai.assert.isTrue(f("k1=v1&k2=v2&k3=v3", "k2=v2&k3=v3&k1=v1"));
	});

	it("Query strings are equal on nested params", () => {
		chai.assert.isTrue(f("k1=v1&k2[k1]=v1.1", "k2[k1]=v1.1&k1=v1"));
	});
	it("Query strings are equal on unordered params and nested");
	it("Query strings are equal when values are not present");
	it("Query strings are equal when values partially present");
	it("Query strings are not equal when keys override each other");
	it("Query strings are not equal when amount of params differs");
	it("Query strings are not equal when keys do not match");
	it("Query strings are not equal when values do not match");
});

describe("Testing URLParams.toString(object)", () => {
	it("Empty object produces empty string");
	it("Only objects are allowed");
	it("Array values produce [] key");
	it("Objects nested in array produce string of type\"key[][innerKey]=value\"");
	it("Function produces correct query string");
});

describe("Testing URLParams.fromString(string)", () => {
	it("Empty string produces empty object");
	it("String of type \"key[]=value&key[innerKey]=value\" creates object instead of array");
	it("Query without values produces object with empty key values");
	it("Query with duplicate keys saves last one value");
	it("String of type \"key[innerKey]=value&key[]=value\" creates object anyway. Keys without name creates ordered \numeric name");
});

describe("Testing URLParams.getFormQuery()", () => {});
