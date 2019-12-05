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

	it("Query strings are equal on unordered params", () => {
		chai.assert.isTrue(f(" param1=1&param2=2 ", "  param2=2&param1=1"));
		chai.assert.isTrue(f("k1=v1&k2=v2&k3=v3", "k2=v2&k3=v3&k1=v1"));
	});

	it("Query strings are equal on nested params", () => {
		chai.assert.isTrue(f("k1=v1&k2[k1]=v1.1", "k2[k1]=v1.1&k1=v1"));
	});

	it("Query strings are equal on unordered and nested params", () => {
		chai.assert.isTrue(f("k1=v2&k2[k1]=v3", "k2[k1]=v3&k1=v2"));
		chai.assert.isTrue(f("k1=v1&k2=v2&k2.1[k1]=v2.1", "k2.1[k1]=v2.1&k1=v1&k2=v2"));
	});

	it("Query strings are equal when values are not present", () => {
		chai.assert.isTrue(f("k1&k2&k3", "k2&k3&k1"));
		chai.assert.isTrue(f("k1", "k1"));
		chai.assert.isTrue(f("k1&k2", "k2&k1"));
	});

	it("Query strings are equal when values partially present", () => {
		chai.assert.isTrue(f("k1&k2&k3=v3", "k3=v3&k1&k2"));
		chai.assert.isTrue(f("k1=v1&k2", "k2&k1=v1"));
	});

	it("Query strings are equal when key override with same value", () => {
		chai.assert.isTrue(f("k1=v1&k1=v2", "k1=v2"));
		chai.assert.isTrue(f("k1=v2", "k1=v1&k1=v2"));
		chai.assert.isTrue(f("k1=v1&k2=v2&k1=v3", "k1=v3&k2=v2"));
		chai.assert.isTrue(f("k1=v3&k2=v2", "k1=v1&k2=v2&k1=v3"));
	});

	it("Query strings are equal with trailing amp sign", () => {
		chai.assert.isTrue(f("&", ""));
		chai.assert.isTrue(f("a=1&b=2", "a=1&b=2&"));
		chai.assert.isTrue(f("a=1&b=2", "&a=1&b=2"));
		chai.assert.isTrue(f("a=1&b=2", "&a=1&b=2&"));
		chai.assert.isTrue(f("a=1&b=2", "&a=1&b=2&&&&&"));
		chai.assert.isTrue(f("a=1&b=2", "&&&&&b=2&a=1&"));
	});

	it("Query strings are not equal when key override with different value", () => {
		chai.assert.isFalse(f("k1=v1&k1=v2", "k1=v1"));
		chai.assert.isFalse(f("k1=v1", "k1=v1&k1=v2"));
		chai.assert.isFalse(f("k1=v1&k2=v2&k1=v3", "k1=v1&k2=v2"));
		chai.assert.isFalse(f("k1=v1&k2=v2", "k1=v1&k2=v2&k1=v3"));
	});

	it("Query strings are not equal when amount of params differs", () => {
		chai.assert.isFalse(f("k1=v1&k2=v2", "k1=v1&k2=v2&k3=v3"), "Different length");
		chai.assert.isFalse(f("k1=v1&k2=v2&k3=v3", "k1=v1&k2=v2"), "Different length");
		chai.assert.isFalse(f("a=1&b=2", "a=bcdef"), "Equal total length");
	});

	it("Query strings are not equal when keys do not match", () => {
		chai.assert.isFalse(f("a=1&b=2", "A=1&b=2"));
		chai.assert.isFalse(f("a=1&b=2", "b=2&A=1"));
	});

	it("Query strings are not equal when values do not match", () => {
		chai.assert.isFalse(f("a=1", "a=2"));
		chai.assert.isFalse(f("a=1&b=2", "a=2&b=2"));
	});

	it("Query without values equals to empty string", () => {
		chai.assert.isTrue(f("a=", ""));
		chai.assert.isTrue(f("a=1&b=", "a=1"));
		chai.assert.isTrue(f("a=1&b=2&c[]=", "a=1&b=2"));
		chai.assert.isTrue(f("a=1&b=2&c[1]=1&c[2]=", "a=1&b=2&c[1]=1"));
		chai.assert.isTrue(f("a=&b=&c[1]=&c[2]=", ""));
	});
});

describe("Testing URLParams.toString(object)", () => {
	let f = params.URLParams.toString;
	it("Empty object produces empty string", () => {
		chai.assert.equal(f({}), "");
	});

	it("Only objects are allowed", () => {
		chai.expect(() => f(null)).to.throw(TypeError);
		chai.expect(() => f(1)).to.throw(TypeError);
		chai.expect(() => f(true)).to.throw(TypeError);
		chai.expect(() => f()).to.throw(TypeError);
		chai.expect(() => f([])).to.throw(TypeError);
		chai.expect(() => f("")).to.throw(TypeError);
	});

	it("Empty values do not produce query string", () => {
		let cases = [
			{
				test: {
					a: ""
				},
				expect: ""
			},
			{
				test: {
					a: 1,
					b: ""
				},
				expect: "a=1"
			},
		];
		for (let i in cases) {
			chai.assert.isTrue(params.URLParams.queriesAreEqual(f(cases[i].test), cases[i].expect));
		}
	});

	it("Nested empty values do not produce query string", () => {
		let cases = [
			{
				test: {
					a: 1,
					b: 2,
					c: []
				},
				expect: "a=1&b=2"
			},
			{
				test: {
					a: [
						[
							{}
						]
					]
				},
				expect: ""
			}
		];
		for (let i in cases) {
			chai.assert.isTrue(params.URLParams.queriesAreEqual(f(cases[i].test), cases[i].expect));
		}
	});

	it("Array values produce [] key", () => {
		let cases = [
			{
				test: {
					a: [
						1
					]
				},
				expect: "a[]=1"
			},
			{
				test: {
					a: [
						1, 2, 3
					]
				},
				expect: "a[]=1&a[]=2&a[]=3"
			},
			{
				test: {
					a: 1,
					b: [
						[
							1, 2, 3
						]
					]
				},
				expect: "a=1&b[][]=1&b[][]=2&b[][]=3"
			}
		];
		for (let i in cases) {
			chai.assert.isTrue(params.URLParams.queriesAreEqual(f(cases[i].test), cases[i].expect), `Expected: ${cases[i].expect}`);
		}
	});

	it("Object values produce named [] key", () => {
		let cases = [
			{
				test: {
					a: {
						b: 1
					}
				},
				expect: "a[b]=1"
			},
			{
				test: {
					a: {
						b: {
							c: 3
						}
					}
				},
				expect: "a[b][c]=3"
			},
			{
				test: {
					a: 1,
					b: "string",
					c: {
						key: "value",
						empty: ""
					}
				},
				expect: "a=1&b=string&c[key]=value"
			}
		];
		for (let i in cases) {
			chai.assert.isTrue(params.URLParams.queriesAreEqual(f(cases[i].test), cases[i].expect), `Expected: ${cases[i].expect}`);
		}
	});

	it("Arrays nested in object produce string of type \"key[innerKey][]=value\"", () => {
		let cases = [
			{
				test: {
					a: [
						1
					]
				},
				expect: "a[]=1"
			},
			{
				test: {
					a: {
						b: [
							1, 2
						]
					}
				},
				expect: "a[b][]=1&a[b][]=2"
			}
		];
		for (let i in cases) {
			chai.assert.isTrue(params.URLParams.queriesAreEqual(f(cases[i].test), cases[i].expect), `Expected: ${cases[i].expect}`);
		}
	});

	it("Objects nested in array produce string of type \"key[][innerKey]=value\"", () => {
		let cases = [
			{
				test: {
					a: [
						{
							b: 1
						}
					]
				},
				expect: "a[][b]=1"
			},
			{
				test: {
					a: [
						[
							{
								b: 1,
								c: 3,
								d: ""
							}
						]
					]
				},
				expect: "a[][][b]=1&a[][][c]=3"
			}
		];
		for (let i in cases) {
			chai.assert.isTrue(params.URLParams.queriesAreEqual(f(cases[i].test), cases[i].expect), `Expected: ${cases[i].expect}`);
		}
	});
	it("Function produces correct query string", () => {
		let cases = [
			{
				test: {
					FILTER: {
						PROP_121: 23,
						PROP_122: {
							FROM: 12,
							TO: 40
						},
						PROP_123: [
							"D", "T"
						]
					},
					D: 157
				},
				expect: "D=157&FILTER[PROP_121]=23&FILTER[PROP_122][FROM]=12&FILTER[PROP_122][TO]=40&FILTER[PROP_123][]=D&FILTER[PROP_123][]=T"
			}
		];
		for (let i in cases)
			chai.assert.isTrue(params.URLParams.queriesAreEqual(f(cases[i].test), cases[i].expect), `Expected: ${cases[i].expect}`);
	});
});

describe("Testing URLParams.fromString(string)", () => {
	it("Empty string produces empty object");
	it("String of type \"key[]=value&key[innerKey]=value\" creates object instead of array");
	it("Query without values produces object with empty key values");
	it("Query with duplicate keys saves last one value");
	it("String of type \"key[innerKey]=value&key[]=value\" creates object anyway. Keys without name creates ordered \numeric name");
	it("String splits by amp sign inside square brackets");
	it("String key value pairs splits by equal sign inside square brackets");
});

describe("Testing URLParams.getFormQuery()", () => {});
