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

	it("Queries with multiple amp signs are equal", () => {
		chai.assert.isTrue(f("a=1&&&b=2", "a=1&b=2"));
		chai.assert.isTrue(f("  a=1&&&b=2&&", "a=1&b=2"));
		chai.assert.isTrue(f("  a=1&&&b=2&&", "b=2&a=1"));
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
	let f = params.URLParams.fromString;
	it("Empty string produces empty object", () => {
		let cases = [
			{
				test: "",
				expect: {}
			},
			{
				test: "    ",
				expect: {}
			},
			{
				test: "  & ",
				expect: {}
			}
		];
		for (let i in cases)
			chai.expect(f(cases[i].test)).to.eql(cases[i].expect);
	});

	it("Simple examples pass", () => {
		let cases = [
			{
				test: "a=1",
				expect: {
					a: "1"
				}
			},
			{
				test: "a=1&b=2",
				expect: {
					a: "1",
					b: "2"
				}
			},
			{
				test: "  a=1&b=2",
				expect: {
					a: "1",
					b: "2"
				}
			},
			{
				test: "&a=1&b=2& ",
				expect: {
					a: "1",
					b: "2"
				}
			}
		];
		for (let i in cases)
			chai.expect(f(cases[i].test)).to.eql(cases[i].expect);
	});

	it("Simple key nested examples pass", () => {
		let cases = [
			{
				test: "a[b]=1",
				expect: {
					a: {
						b: "1"
					}
				}
			},
			{
				test: "a[b]=1&a[c]=2",
				expect: {
					a: {
						b: "1",
						c: "2"
					}
				}
			},
			{
				test: "a=1&b[a]=2&b[c]=3",
				expect: {
					a: "1",
					b: {
						a: "2",
						c: "3"
					}
				}
			}
		];
		for (let i in cases)
			chai.expect(f(cases[i].test)).to.eql(cases[i].expect);
	});

	it("Query without values do not produce keys", () => {
		let cases = [
			{
				test: "a=",
				expect: {}
			},
			{
				test: "a=1&b=",
				expect: {
					a: "1"
				}
			},
			{
				test: "a[b]=",
				expect: {}
			},
			{
				test: "a=1&b[c]=",
				expect: {
					a: "1"
				}
			},
			{
				test: "a[]=&b[][]=",
				expect: {}
			}
		];
		for (let i in cases)
			chai.expect(f(cases[i].test)).to.eql(cases[i].expect);
	});

	it("String of type \"key[]=value&key[innerKey]=value\" creates object instead of array", () => {
		let cases = [
			{
				test: "key[]=value&key[innerKey]=value",
				expect: {
					key: {
						0: "value",
						innerKey: "value"
					}
				},
			},
			{
				test: "key[][]=value&key[][key]=value",
				expect: {
					key: [
						[
							"value"
						],
						{
							key: "value"
						}
					]
				}
			},
			{
				test: "key[][key][][]=value&key[][key][][deepKey]=value",
				expect: {
					key: [
						{
							key: [
								[
									"value",
								]
							]
						},
						{
							key: [
								{
									deepKey: "value"
								}
							]
						}
					]
				}
			}
		];
		for (let i in cases)
			chai.expect(f(cases[i].test)).to.eql(cases[i].expect, cases[i].test);
	});

	it("Query with duplicate keys saves last value", () => {
		let cases = [
			{
				test: "a=1&a=2",
				expect: {
					a: "2"
				}
			},
			{
				test: "a=1&b=2&a=4",
				expect: {
					a: "4",
					b: "2"
				}
			},
			{
				test: "a=1&a[]=2",
				expect: {
					a: [
						"2"
					]
				}
			}
		];
		for (let i in cases)
			chai.expect(f(cases[i].test)).to.eql(cases[i].expect);
	});

	it("String of type \"key[innerKey]=value&key[]=value\" creates object anyway. Keys without name creates ordered numeric name", () => {
		let cases = [
			{
				test: "a[b]=value&a[]=value",
				expect: {
					a: {
						b: "value",
						0: "value"
					}
				}
			},
			{
				test: "a[]=1&a[b]=2&a[]=3",
				expect: {
					a: {
						0: "1",
						b: "2",
						1: "3"
					}
				}
			},
			{
				test: "a[a][b]=1&a[][]=2",
				expect: {
					a: {
						a: {
							b: "1"
						},
						0: [
							"2"
						]
					}
				}
			}
		];
		for (let i in cases)
			chai.expect(f(cases[i].test)).to.eql(cases[i].expect);
	});

	it("String splits by amp sign inside square brackets", () => {
		let cases = [
			{
				test: "a[&]=1",
				expect: {
					"]": "1"
				}
			},
			{
				test: "a[in&ner]=1",
				expect: {
					"ner]": "1"
				}
			},
		];
		for (let i in cases)
			chai.expect(f(cases[i].test)).to.eql(cases[i].expect);
	});

	it("String key value pairs splits by equal sign inside square brackets", () => {
		let cases = [
			{
				test: "a[=]=1",
				expect: {
					"a[": "]=1"
				},
			}
		];
		for (let i in cases)
			chai.expect(f(cases[i].test)).to.eql(cases[i].expect);
	});

	it("Multiple amp signs do not create empty entries", () => {
		let cases = [
			{
				test: "&& ",
				expect: {}
			},
			{
				test: "a=1&&b=2",
				expect: {
					a: "1",
					b: "2"
				}
			},
			{
				test: " &a=2&&a=3",
				expect: {
					a: "3"
				}
			}
		];
		for (let i in cases)
			chai.expect(f(cases[i].test)).to.eql(cases[i].expect);
	});
});

describe("Testing URLParams.fromString(string) and URLParams.toString(object) equality", () => {});

describe("Testing URLParams.set(key, value, object)", () => {
	let f = params.URLParams.set;
	it("Wrong types aren't allowed", () => {
		chai.expect(() => f(null)).to.throw(TypeError);
		chai.expect(() => f(123, "value", "object")).to.throw(TypeError);
		chai.expect(() => f(false, "value", function() {})).to.throw(TypeError);
		chai.expect(() => f(function() {}, "value", true)).to.throw(TypeError);
	});

	it("Single key-value pairs are set correctly", () => {
		let o = {
			key: "value"
		};
		f("key", "new value", o);
		chai.expect(o).to.eql({"key": "new value"});
	});

	it("Nested key-value pairs are set correctly", () => {
		let o = {
			key: {
				key: "value"
			},
			key2: {}
		};
		f("key.key", "new value", o);
		chai.expect(o).to.eql({
			key: {
				key: "new value"
			},
			key2: {}
		});
		f("key2.key", "new value", o);
		chai.expect(o).to.eql({
			key: {
				key: "new value"
			},
			key2: {
				key: "new value"
			}
		});
	});

	it("Low nested key-value pairs overrides high depth old chains", () => {
		let o = {
			key: {
				subKey: {
					subsubKey: "value"
				}
			}
		};
		f("key", "value", o);
		chai.expect(o).to.eql({
			key: "value"
		});
	});

	it("Nested key-value pairs with number index are set correctly", () => {
		let o = {
			array: [1, 2, {}]
		};
		f("array.0", "value", o);
		chai.expect(o).to.eql({
			array: ["value", 2, {}]
		});
		f("array.1", "value", o);
		chai.expect(o).to.eql({
			array: ["value", "value", {}]
		});
		f("array.2.subkey", "value", o);
		chai.expect(o).to.eql({
			array: ["value", "value", {
				subkey: "value"
			}]
		});
	});

	it("Nonexistent entries are automatically created", () => {
		let o = {};
		f("key.subkey", "value", o);
		chai.expect(o).to.eql({
			key: {
				subkey: "value"
			}
		});
		f("key.subkey0", "value0", o);
		chai.expect(o).to.eql({
			key: {
				subkey: "value",
				subkey0: "value0"
			}
		});
		f("key0.subkey0.subsubkey0", "value0", o);
		chai.expect(o).to.eql({
			key: {
				subkey: "value",
				subkey0: "value0"
			},
			key0: {
				subkey0: {
					subsubkey0: "value0"
				}
			}
		});
		o = {};
		f("key.0", "value", o);
		chai.expect(o).to.eql({
			key: {
				0: "value"
			}
		});
		f("key.0.0.0", "value", o);
		chai.expect(o).to.eql({
			key: {
				0: {
					0: {
						0: "value"
					}
				}
			}
		});
	});

	it("Brand new values return nulls", () => {
		let o = {};
		chai.assert.isNull(f("key", "value", o));
		chai.assert.isNull(f("superkey.subkey", "subvalue", o));
		chai.assert.isNull(f("array.0", "value", o));
	});

	it("New values return replaced values", () => {
		let o = {
			key: "value",
			array: [
				"a"
			],
			superkey: {
				subkey: "subvalue"
			}
		};
		chai.assert.equal(f("key", "new value", o), "value");
		chai.assert.equal(f("array.0", "A", o), "a");
		chai.assert.equal(f("superkey.subkey", "new subvalue", o), "subvalue");
		chai.assert.equal(f("key", "value", o), "new value");
	});

	it("Object keys override arrays and preserve indices", () => {
		let o = {
			array: [
				"a"
			]
		};
		f("array.key", "a", o);
		chai.expect(o).to.eql({
			array: {
				0: "a",
				key: "a"
			}
		});
	});

	it("Array indices are inserted and do not override objects", () => {
		let o = {
			object: {
				key: "value"
			}
		};
		f("object.0", "a", o);
		chai.expect(o).to.eql({
			object: {
				0: "a",
				key: "value"
			}
		});
	});
});

describe("Testing URLParams.set(key, value, object)", () => {
	let f = params.URLParams.get;
	it("Nonexistent paths return nulls", () => {
		let o = {
			key: "value"
		};
		chai.assert.isNull(f("key0", o));
	});
	it("Deep nonexistent paths return nulls", () => {
		let o = {
			key: "value"
		};
		chai.assert.isNull(f("key0.key.subkey", o));
		chai.assert.isNull(f("key0.0.key.0.key", o));
		chai.assert.isNull(f("key0.0", o));
		chai.assert.isNull(f("key0.0.0", o));
	});
	it("Existent paths return value", () => {
		let o = {
			key: "value",
			array: [
				1, 2, {
					arraykey: "arrayvalue"
				}
			],
			subkey: {
				subkey: "subkey value"
			}
		};
		chai.assert.equal(f("key", o), "value");
		chai.assert.equal(f("array.0", o), 1);
		chai.assert.equal(f("array.2.arraykey", o), "arrayvalue");
		chai.assert.equal(f("subkey.subkey", o), "subkey value");
	});
});
