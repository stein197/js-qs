import * as assert from "assert";
import * as qs from ".";

describe("stringify()", () => {
	it("Should not emit indices for arrays by default when options aren't present", () => {
		assert.equal(qs.stringify({a: [1, 2]}), "a[]=1&a[]=2");
	});
	it("Should not stringify flags by default when options aren't present", () => {
		assert.equal(qs.stringify({a: true}), "a");
	});
	it("Should discard empty values by default when options aren't present", () => {
		assert.equal(qs.stringify({a: "", b: [], c: {}}), "");
	});
	it("Should discard null and undefined by default when options aren't present", () => {
		assert.equal(qs.stringify({a: null, b: undefined}), "");
	});
	it("Should not encode keys by default when options aren't present", () => {
		assert.equal(qs.stringify({" ": 1}), " =1")
	});
	it("Should not encode values by default when options aren't present", () => {
		assert.equal(qs.stringify({a: " "}), "a= ");
	});
	it("Should encode special characters in keys", () => {
		assert.equal(qs.stringify({"&=[]": 1}), "%26%3D%5B%5D=1");
	});
	it("Should encode special characters in values", () => {
		assert.equal(qs.stringify({"a": "&=[]"}), "a=%26%3D%5B%5D");
	});
	it("Should not encode brackets", () => {
		assert.equal(qs.stringify({a: {b: 1}}), "a[b]=1");
	});
	it("Should encode encoded characters in keys", () => {
		assert.equal(qs.stringify({"%25": 1}), "%2525=1");
	});
	it("Should encode encoded characters in values", () => {
		assert.equal(qs.stringify({a: "%25"}), "a=%2525");
	});
	it("Should throw an error when stringifying circular references", () => {
		let a: any = {};
		let b: any = {};
		a.b = b;
		b.a = a;
		assert.throws(() => qs.stringify(a), {
			name: "ReferenceError",
			message: "Cannot stringify data because of circular reference at [\"b\"][\"a\"]"
		});
		a = {
			a: {
				b: [
					1
				]
			}
		}
		b = a
		a.a.b.push(b);
		assert.throws(() => qs.stringify(a), {
			name: "ReferenceError",
			message: "Cannot stringify data because of circular reference at [\"a\"][\"b\"][1]"
		});
	});
	it("Should correctly omit indices for nested structures", () => {
		const cases = [
			{
				expected: "0[]=1",
				value: [
					[
						1
					]
				]
			},
			{
				expected: "3=a",
				value: [,,,"a"]
			},
			{
				expected: "0[3]=a",
				value: [
					[,,,"a"]
				],
			},
			{
				expected: "0[a][]=2&0[b]=3",
				value: [
					{
						a: [
							2
						],
						b: 3
					}
				]
			},
			{
				expected: "a[]=2&b=3",
				value: {
					a: [
						2
					],
					b: 3
				}
			},
			{
				expected: "0=2",
				value: [
					2
				]
			},
			{
				expected: "0[]=4&0[]=5",
				value: [
					[
						4,
						5
					]
				],
			},
			{
				expected: "0=1&1[0][a][]=2&1[0][b]=3&2[0][]=4&2[0][]=5",
				value: [
					1,
					[
						{
							a: [
								2
							],
							b: 3
						}
					],
					[
						[
							4,
							5
						]
					]
				]
			}
		];
		for (const testCase of cases)
			// @ts-ignore
			assert.equal(qs.stringify(testCase.value), testCase.expected);
	});
	it("Should return correct result when passing large complex object with custom options", () => {
		assert.equal(qs.stringify({
			a: {
				b: [
					"c", {
						d: 4
					}
				]
			},
			b: [
				1, 2
			],
			"=": "=",
			"%25": "%25",
			"key": "value"
		}), "a[b][]=c&a[b][][d]=4&b[]=1&b[]=2&%3D=%3D&%2525=%2525&key=value");
		assert.equal(qs.stringify({
			ios: true,
			platform: "android",
			ids: [
				123, 456, 789
			],
			user: {
				name: "Jon Doe",
				company: "J&J"
			}
		}), "ios&platform=android&ids[]=123&ids[]=456&ids[]=789&user[name]=Jon Doe&user[company]=J%26J");
	});

	describe("Options", () => {
		describe("\"empty\"", () => {
			it("Should discard empty values when \"empty\" is false", () => {
				assert.equal(qs.stringify({a: "", b: [], c: {}}, {empty: false}), "");
			});
			it("Should discard empty values inside an array when \"empty\" is false", () => {
				assert.equal(qs.stringify({a: ["", "", ""]}, {empty: false}), "");
			});
			it("Should discard empty values inside an object when \"empty\" is false", () => {
				assert.equal(qs.stringify({a: {b: ""}}, {empty: false}), "");
			});
			it("Should preserve empty values when \"empty\" is true", () => {
				assert.equal(qs.stringify({abc: "", def: [], ghi: {}, jkl: {mno: ""}}, {empty: true}), "abc=&def=&ghi=&jkl[mno]=");
			});
			it("Should preserve empty values inside an array when \"empty\" is true", () => {
				assert.equal(qs.stringify({a: ["", "", ""]}, {empty: true}), "a[]=&a[]=&a[]=");
			});
			it("Should preserve empty values inside an object when \"empty\" is true", () => {
				assert.equal(qs.stringify({a: {b: ""}}, {empty: true}), "a[b]=");
			});
			it("Should not discard empty arrays when \"empty\" is true", () => {
				assert.equal(qs.stringify({a: [[[]]]}, {empty: true}), "a[][]=");
			});
			it("Should not discard empty objects when \"empty\" is true", () => {
				assert.equal(qs.stringify({a: {b: {c: {}}}}, {empty: true}), "a[b][c]=");
			});
		});
		describe("\"indices\"", () => {
			it("Should not emit indices for arrays when \"indices\" is false", () => {
				assert.equal(qs.stringify({a: [1, 2, 3]}, {indices: false}), "a[]=1&a[]=2&a[]=3");
			});
			it("Should emit indices for arrays when \"indices\" is true", () => {
				assert.equal(qs.stringify({a: [1, 2, 3]}, {indices: true}), "a[0]=1&a[1]=2&a[2]=3");
			});
		});
		describe("\"flags\"", () => {
			it("Should stringify flags when \"flags\" is false", () => {
				assert.equal(qs.stringify({a: true}, {flags: false}), "a=true");
			});
			it("Should not stringify flags when \"flags\" is true", () => {
				assert.equal(qs.stringify({a: true}, {flags: true}), "a");
			});
		});
		describe("\"nulls\"", () => {
			it("Should discard null and undefined when \"nulls\" is false", () => {
				assert.equal(qs.stringify({a: null, b: undefined}, {nulls: false}), "");
			});
			it("Should stringify null and undefined when \"nulls\" is true", () => {
				assert.equal(qs.stringify({a: null, b: undefined}, {nulls: true}), "a=null&b=undefined");
			});
		});
		describe("\"encodeKeys\"", () => {
			it("Should not encode keys when \"encodeKeys\" is false", () => {
				assert.equal(qs.stringify({" ": 1}, {encodeKeys: false}), " =1");
			});
			it("Should encode keys when \"encodeKeys\" is true", () => {
				assert.equal(qs.stringify({" ": 1}, {encodeKeys: true}), "%20=1");
			});
			it("Should encode special characters in keys anyway", () => {
				assert.equal(qs.stringify({"&[]=%": 1}, {encodeKeys: false}), "%26%5B%5D%3D%25=1");
			});
		});
		describe("\"encodeValues\"", () => {
			it("Should not encode values when \"encodeValues\" is false", () => {
				assert.equal(qs.stringify({a: " "}, {encodeValues: false}), "a= ");
			});
			it("Should encode values when \"encodeValues\" is true", () => {
				assert.equal(qs.stringify({a: " "}, {encodeValues: true}), "a=%20");
			});
			it("Should encode special characters in values anyway", () => {
				assert.equal(qs.stringify({a: "&[]=%"}, {encodeValues: false}), "a=%26%5B%5D%3D%25");
			});
		});
	});

	describe("Plain arrays", () => {
		it("Should return correct result when passing a common array", () => {
			assert.equal(qs.stringify(["a", "b", "c"]), "0=a&1=b&2=c");
		});
		it("Should return empty string when the array is empty", () => {
			assert.equal(qs.stringify([]), "");
		});
		it("Should discard empty values when the array is sparsed", () => {
			assert.equal(qs.stringify(["a", , "c"]), "0=a&2=c");
		});
	});
	describe("Plain objects", () => {
		it("Should return correct result when passing a common object", () => {
			assert.equal(qs.stringify({a: 1, b: 2, c: 3}), "a=1&b=2&c=3");
		});
		it("Should return empty string when the object is empty", () => {
			assert.equal(qs.stringify({}), "");
		});
	});
	describe("Arrays in arrays", () => {
		it("Should return correct result when passing an array in array", () => {
			assert.equal(qs.stringify([["a"]]), "0[]=a");
		});
		it("Should return empty string when the arrays are empty", () => {
			assert.equal(qs.stringify([[], []]), "");
		});
		it("Should not produce indices when nested arrays contain single item", () => {
			assert.equal(qs.stringify([["a"], ["b"], ["c"]]), "0[]=a&1[]=b&2[]=c");
		});
		it("Should not produce indices when deeply nested arrays contain single item", () => {
			assert.equal(qs.stringify([[["a"]], [["b"]], [["c"]]]), "0[][]=a&1[][]=b&2[][]=c");
		});
		it("Should not produce explicit indices when deeply nested arrays contain multiple items", () => {
			assert.equal(qs.stringify([[["a"], ["b"], ["c"]]]), "0[][]=a&0[][]=b&0[][]=c");
		});
	});
	describe("Objects in arrays", () => {
		it("Should return correct result when passing an object in array", () => {
			assert.equal(qs.stringify([{a: 1}]), "0[a]=1");
		});
		it("Should return empty string when object and array are empty", () => {
			assert.equal(qs.stringify([{}, {}]), "");
		});
	});
	describe("Objects in objects", () => {
		it("Should return correct result when passing an object in object", () => {
			assert.equal(qs.stringify({a: {b: {c: 3}}, b: {c: 3}, c: 3}), "a[b][c]=3&b[c]=3&c=3");
		});
		it("Should return empty string when objects are empty", () => {
			assert.equal(qs.stringify({a: {b: {}}}), "");
		});
	});
	describe("Arrays in objects", () => {
		it("Should return correct result when passing an array in object", () => {
			assert.equal(qs.stringify({a: ["a", "b", "c"]}), "a[]=a&a[]=b&a[]=c");
		});
		it("Should return empty string when arrays and objects are empty", () => {
			assert.equal(qs.stringify({a: []}), "");
		});
	});
});

describe("parse()", () => {
	it("Should return empty object literal when the string is empty", () => {
		assert.deepStrictEqual(qs.parse(""), {});
	});
	it("Should return empty object literal when the string consists of delimiters", () => {
		assert.deepStrictEqual(qs.parse("&&&"), {});
	});
	it("Should return empty object literal when the string constists of empty values", () => {
		assert.deepStrictEqual(qs.parse("a=&b=&c="), {});
	});
	it("Should decode keys when keys are encoded", () => {
		assert.deepStrictEqual(qs.parse("%20=a"), {" ": "a"});
	});
	it("Should decode values when values are encoded", () => {
		assert.deepStrictEqual(qs.parse("a=%20"), {a: " "});
	});
	it("Should consider multiple delimiters as a single one", () => {
		assert.deepStrictEqual(qs.parse("&a=1&&&b=2&&"), {a: 1, b: 2});
	});
	it("Should return true for flags", () => {
		assert.deepStrictEqual(qs.parse("a=1&b"), {a: 1, b: true});
	});
	it("Should discard empty values by default when options aren't present", () => {
		assert.deepStrictEqual(qs.parse("a=&b=2"), {b: 2});
	});
	it("Should cast string types to corresponding types", () => {
		assert.deepStrictEqual(qs.parse("a=null&b=undefined&c=true&d=-1"), {a: null, b: undefined, c: true, d: -1});
	});
	it("Should return the last value for multiple key occurences", () => {
		assert.deepStrictEqual(qs.parse("a=1&a=2"), {a: 2});
	});
	it("Should create new entry for each empty index ([])", () => {
		assert.deepStrictEqual(qs.parse("a[]=1&a[]=2"), {a: [1, 2]});
	});
	it("Should create new entry for each empty index ([]) for deep objects", () => {
		assert.deepStrictEqual(qs.parse("a[][a]=1&a[][b]=2"), {a: [{a: 1}, {b: 2}]});
	});
	it("Should return an array when the top-level keys are numbers", () => {
		assert.deepStrictEqual(qs.parse("0=a&1=c"), ["a", "c"]);
	});
	it("Should return an array when specifying an explicit numeric keys", () => {
		assert.deepStrictEqual(qs.parse("a[0]=1&a[1]=2"), {a: [1, 2]});
	});
	it("Should preserve all equal signs after the first one when the value contains raw equal signs", () => {
		assert.deepStrictEqual(qs.parse("a=b=c&b=c=d"), {a: "b=c", b: "c=d"});
	});
	it("Should allow raw brackets in values", () => {
		assert.deepStrictEqual(qs.parse("a=[b]"), {a: "[b]"});
	});
	it("Should override inherited properties when key is one of inherited property", () => {
		assert.deepStrictEqual(qs.parse("toString=1&hasOwnProperty=2"), {toString: 1, hasOwnProperty: 2});
	});
	it("Should return malformed URI values as is instead of throwing an error", () => {
		assert.deepStrictEqual(qs.parse("a=%1"), {a: "%1"});
	});
	it("Should return sparsed array when the string contains sparsed numeric indices", () => {
		assert.deepStrictEqual(qs.parse("a[0]=a&a[2]=c"), {a: ["a", , "c"]});
	});
	it("Should return plain object when the key contains open bracket", () => {
		assert.deepStrictEqual(qs.parse("a[=1"), {"a[": 1});
		assert.deepStrictEqual(qs.parse("a[b[=1"), {"a[b[": 1});
	});
	it("Should return plain object when the key contains close bracket", () => {
		assert.deepStrictEqual(qs.parse("a]=1"), {"a]": 1});
	});
	it("Should continue counting keys when object has explicit numeric keys and implicit ones", () => {
		assert.deepStrictEqual(qs.parse("a[1]=a&a[2]=b&a[]=c"), {a: [, "a", "b", "c"]});
	});
	it("Should start counting from 0 when object has explicit string keys and implicit ones", () => {
		assert.deepStrictEqual(qs.parse("a[a]=1&a[b]=2&a[]=3"), {a: {a: 1, b: 2, 0: 3}});
	});
	it("Should return object when the first keys are numbers and the last ones are strings", () => {
		assert.deepStrictEqual(qs.parse("0=a&1=b&c=c"), {0: "a", 1: "b", c: "c"});
	});
	it("Should return object for nested structures when the first keys ommited and the last ones are strings", () => {
		assert.deepStrictEqual(qs.parse("a[]=a&a[]=b&a[c]=c"), {a: {0: "a", 1: "b", c: "c"}});
	});
	it("Should return object for nested structures when the first keys are numbers and the last ones are strings", () => {
		assert.deepStrictEqual(qs.parse("a[0]=a&a[1]=b&a[c]=c"), {a: {0: "a", 1: "b", c: "c"}});
	});
	it("Should discard entry with empty key", () => {
		assert.deepStrictEqual(qs.parse("=1&b=2"), {b: 2});
	});
	it("Should decode percent-encoded keys only once", () => {
		assert.deepStrictEqual(qs.parse("%2520=a"), {"%20": "a"});
	});
	it("Should decode percent-encoded values only once", () => {
		assert.deepStrictEqual(qs.parse("a=%2520"), {a: "%20"});
	});
	it("Should return correct result when parsing complex query string", () => {
		assert.deepStrictEqual(qs.parse("a[b][]=c&a[b][][d]=4&b[]=1&b[]=2&%3D=%3D&%2525=%2525&key=value"), {
			a: {
				b: [
					"c", {
						d: 4
					}
				]
			},
			b: [
				1, 2
			],
			"=": "=",
			"%25": "%25",
			"key": "value"
		});
		assert.deepStrictEqual(qs.parse("ios&platform=android&ids[]=123&ids[]=456&ids[]=789&user[name]=Jon Doe&user[company]=J%26J"), {
			ios: true,
			platform: "android",
			ids: [
				123, 456, 789
			],
			user: {
				name: "Jon Doe",
				company: "J&J"
			}
		});
	});

	describe("Casting numbers", () => {
		it("Should properly cast zero", () => {
			assert.deepStrictEqual(qs.parse("a=0"), {a: 0});
		});
		it("Should properly cast positive number", () => {
			assert.deepStrictEqual(qs.parse("a=5"), {a: 5});
		});
		it("Should properly cast negative number", () => {
			assert.deepStrictEqual(qs.parse("a=-5"), {a: -5});
		});
		it("Should properly cast positive float", () => {
			assert.deepStrictEqual(qs.parse("a=5.5"), {a: 5.5});
		});
		it("Should properly cast negative float", () => {
			assert.deepStrictEqual(qs.parse("a=-5.5"), {a: -5.5});
		});
		it("Should properly cast positive binary number", () => {
			assert.deepStrictEqual(qs.parse("a=0b111"), {a: 0b111});
		});
		it("Should properly cast negative binary number", () => {
			assert.deepStrictEqual(qs.parse("a=-0b111"), {a: -0b111});
		});
		it("Should properly cast positive octal number", () => {
			assert.deepStrictEqual(qs.parse("a=0o10"), {a: 0o10});
		});
		it("Should properly cast negative octal number", () => {
			assert.deepStrictEqual(qs.parse("a=-0o10"), {a: -0o10});
		});
		it("Should properly cast positive hexadecimal number", () => {
			assert.deepStrictEqual(qs.parse("a=0xF"), {a: 0xF});
		});
		it("Should properly cast negative hexadecimal number", () => {
			assert.deepStrictEqual(qs.parse("a=-0xF"), {a: -0xF});
		});
		it("Should properly cast positive exponential number with positive degree", () => {
			assert.deepStrictEqual(qs.parse("a=1e1"), {a: 1e1});
		});
		it("Should properly cast negative exponential number with positive degree", () => {
			assert.deepStrictEqual(qs.parse("a=-1e1"), {a: -1e1});
		});
		it("Should properly cast positive exponential number with negative degree", () => {
			assert.deepStrictEqual(qs.parse("a=1e-1"), {a: 1e-1});
		});
		it("Should properly cast negative exponential number with negative degree", () => {
			assert.deepStrictEqual(qs.parse("a=-1e-1"), {a: -1e-1});
		});
	});

	describe("Overriding", () => {
		it("Should return value for the latest key occurence", () => {
			assert.deepStrictEqual(qs.parse("a=a&a=b"), {a: "b"});
		});
		it("Should drop value when the first key contains value and the second does not and \"empty\" is true", () => {
			assert.deepStrictEqual(qs.parse("a=a&a=", {empty: true}), {a: ""});
		});
		it("Should drop value when the first key contains value and the second does not and \"empty\" is false", () => {
			assert.deepStrictEqual(qs.parse("a[b][c]=a&a[b]=", {empty: false}), {});
		});
		it("Should override nested structure with primitive value", () => {
			assert.deepStrictEqual(qs.parse("a[]=a&a=b"), {a: "b"});
		});
		it("Should override primitive value with nested structure", () => {
			assert.deepStrictEqual(qs.parse("a=a&a[]=b"), {a: ["b"]});
		});
	});

	describe("Options", () => {
		describe("\"empty\"", () => {
			it("Should discard empty values when \"empty\" is false", () => {
				assert.deepStrictEqual(qs.parse("a=&b=", {empty: false}), {});
			});
			it("Should preserve empty values when \"empty\" is true", () => {
				assert.deepStrictEqual(qs.parse("a=&b=", {empty: true}), {a: "", b: ""});
			});
		});
		describe("\"types\"", () => {
			it("Should preserve values as strings when \"types\" is false", () => {
				assert.deepStrictEqual(qs.parse("a=null&b=undefined&c=true&d=false&f=-1", {types: false}), {a: "null", b: "undefined", c: "true", d: "false", f: "-1"});
			});
			it("Should cast values to corresponding types when \"types\" is true", () => {
				assert.deepStrictEqual(qs.parse("a=null&b=undefined&c=true&d=false&f=-1", {types: true}), {a: null, b: undefined, c: true, d: false, f: -1});
			});
			it("Should not cast space to zero when \"types\" is true", () => {
				assert.deepStrictEqual(qs.parse("a= ", {types: true}), {a: " "})
			});
		});
		describe("\"decodeValue\"", () => {
			it("Should accept valid arguments", () => {
				const keys: string[] = [];
				const values: any[] = [];
				const indices: number[] = [];
				qs.parse("a=undefined&b=null&c=false&d=12&e=string&f", {decodeValue(k, v, i): void {
					keys.push(k);
					values.push(v);
					indices.push(i);
				}});
				assert.deepStrictEqual(keys, ["a", "b", "c", "d", "e", "f"]);
				assert.deepStrictEqual(values, [undefined, null, false, 12, "string", true]);
				assert.deepStrictEqual(indices, [0, 1, 2, 3, 4, 5]);
			});
			it("Should not be called when query string is empty", () => {
				let called = false;
				const noop = () => called = true;
				qs.parse("", {decodeValue: noop});
				assert.equal(called, false);
			});
			it("Should not be called for empty values when \"empty\" is false", () => {
				const tracker = new assert.CallTracker();
				const noop = tracker.calls(() => {}, 2);
				qs.parse("a=1&b=2&c=", {empty: false, decodeValue: noop});
				tracker.verify();
			});
			it("Should be called for empty values when \"empty\" is true", () => {
				const tracker = new assert.CallTracker();
				const noop = tracker.calls(() => {}, 3);
				qs.parse("a=1&b=2&c=", {empty: true, decodeValue: noop});
				tracker.verify();
			});
			it("Should accept valid index argument for every entry when some of them empty and \"empty\" is false", () => {
				const indices: number[] = [];
				qs.parse("a=1&b=&c=3", {decodeValue(k, v, i): void {
					k; v;
					indices.push(i);
				}});
				assert.deepStrictEqual(indices, [0, 2]);
			});
			it("Should override default values for plain structures", () => {
				assert.deepStrictEqual(qs.parse("a=1&b=2&c=3", {decodeValue: k => k}), {a: "a", b: "b", c: "c"});
			});
			it("Should override default values for nested structures", () => {
				assert.deepStrictEqual(qs.parse("a[]=1&a[]=2&a[]=3", {decodeValue: k => k}), {a: ["a[]", "a[]", "a[]"]});
			});
		});
	});
});

describe("stringify() === parse()", () => {
	it("Should return equal results with default options when first stringifying and then parsing", () => {
		assert.deepStrictEqual(qs.parse(qs.stringify({a: 1, b: 2, c: {d: 4}})), {a: 1, b: 2, c: {d: 4}});
	});
	it("Should return equal results with default options when first parsing and then stringifying", () => {
		assert.equal(qs.stringify(qs.parse("a=1&b=2&c[d]=4")), "a=1&b=2&c[d]=4");
	});
});
