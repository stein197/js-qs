import * as assert from "assert";
import * as mocha from "mocha";
import * as qs from ".";

mocha.describe("stringify()", () => {
	mocha.it("Should not emit indices for arrays by default when options aren't present", () => {
		assert.equal(qs.stringify({a: [1, 2]}), "a[]=1&a[]=2");
	});
	mocha.it("Should not stringify flags by default when options aren't present", () => {
		assert.equal(qs.stringify({a: true}), "a");
	});
	mocha.it("Should discard empty values by default when options aren't present", () => {
		assert.equal(qs.stringify({a: "", b: [], c: {}}), "");
	});
	mocha.it("Should discard null and undefined by default when options aren't present", () => {
		assert.equal(qs.stringify({a: null, b: undefined}), "");
	});
	mocha.it("Should not encode keys by default when options aren't present", () => {
		assert.equal(qs.stringify({" ": 1}), " =1")
	});
	mocha.it("Should not encode values by default when options aren't present", () => {
		assert.equal(qs.stringify({a: " "}), "a= ");
	});
	mocha.it("Should encode special characters in keys", () => {
		assert.equal(qs.stringify({"&=[]": 1}), "%26%3D%5B%5D=1");
	});
	mocha.it("Should encode special characters in values", () => {
		assert.equal(qs.stringify({"a": "&=[]"}), "a=%26%3D%5B%5D");
	});
	mocha.it("Should not encode brackets", () => {
		assert.equal(qs.stringify({a: {b: 1}}), "a[b]=1");
	});
	mocha.it("Should encode encoded characters in keys", () => {
		assert.equal(qs.stringify({"%25": 1}), "%2525=1");
	});
	mocha.it("Should encode encoded characters in values", () => {
		assert.equal(qs.stringify({a: "%25"}), "a=%2525");
	});
	mocha.it("Should throw an error when stringifying circular references", () => {
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
	mocha.it("Should correctly omit indices for nested structures", () => {
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
	mocha.it("Should return correct result when passing large complex object with custom options", () => {
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

	mocha.describe("Options", () => {
		mocha.describe("\"preserveEmpty\"", () => {
			mocha.it("Should discard empty values when \"preserveEmpty\" is false", () => {
				assert.equal(qs.stringify({a: "", b: [], c: {}}, {preserveEmpty: false}), "");
			});
			mocha.it("Should discard empty values inside an array when \"preserveEmpty\" is false", () => {
				assert.equal(qs.stringify({a: ["", "", ""]}, {preserveEmpty: false}), "");
			});
			mocha.it("Should discard empty values inside an object when \"preserveEmpty\" is false", () => {
				assert.equal(qs.stringify({a: {b: ""}}, {preserveEmpty: false}), "");
			});
			mocha.it("Should preserve empty values when \"preserveEmpty\" is true", () => {
				assert.equal(qs.stringify({abc: "", def: [], ghi: {}, jkl: {mno: ""}}, {preserveEmpty: true}), "abc=&def=&ghi=&jkl[mno]=");
			});
			mocha.it("Should preserve empty values inside an array when \"preserveEmpty\" is true", () => {
				assert.equal(qs.stringify({a: ["", "", ""]}, {preserveEmpty: true}), "a[]=&a[]=&a[]=");
			});
			mocha.it("Should preserve empty values inside an object when \"preserveEmpty\" is true", () => {
				assert.equal(qs.stringify({a: {b: ""}}, {preserveEmpty: true}), "a[b]=");
			});
			mocha.it("Should not discard empty arrays when \"preserveEmpty\" is true", () => {
				assert.equal(qs.stringify({a: [[[]]]}, {preserveEmpty: true}), "a[][]=");
			});
			mocha.it("Should not discard empty objects when \"preserveEmpty\" is true", () => {
				assert.equal(qs.stringify({a: {b: {c: {}}}}, {preserveEmpty: true}), "a[b][c]=");
			});
		});
		mocha.describe("\"indices\"", () => {
			mocha.it("Should not emit indices for arrays when \"indices\" is false", () => {
				assert.equal(qs.stringify({a: [1, 2, 3]}, {indices: false}), "a[]=1&a[]=2&a[]=3");
			});
			mocha.it("Should emit indices for arrays when \"indices\" is true", () => {
				assert.equal(qs.stringify({a: [1, 2, 3]}, {indices: true}), "a[0]=1&a[1]=2&a[2]=3");
			});
		});
		mocha.describe("\"flags\"", () => {
			mocha.it("Should stringify flags when \"flags\" is false", () => {
				assert.equal(qs.stringify({a: true}, {flags: false}), "a=true");
			});
			mocha.it("Should not stringify flags when \"flags\" is true", () => {
				assert.equal(qs.stringify({a: true}, {flags: true}), "a");
			});
		});
		mocha.describe("\"nulls\"", () => {
			mocha.it("Should discard null and undefined when \"nulls\" is false", () => {
				assert.equal(qs.stringify({a: null, b: undefined}, {nulls: false}), "");
			});
			mocha.it("Should stringify null and undefined when \"nulls\" is true", () => {
				assert.equal(qs.stringify({a: null, b: undefined}, {nulls: true}), "a=null&b=undefined");
			});
		});
		mocha.describe("\"encodeKeys\"", () => {
			mocha.it("Should not encode keys when \"encodeKeys\" is false", () => {
				assert.equal(qs.stringify({" ": 1}, {encodeKeys: false}), " =1");
			});
			mocha.it("Should encode keys when \"encodeKeys\" is true", () => {
				assert.equal(qs.stringify({" ": 1}, {encodeKeys: true}), "%20=1");
			});
			mocha.it("Should encode special characters in keys anyway", () => {
				assert.equal(qs.stringify({"&[]=%": 1}, {encodeKeys: false}), "%26%5B%5D%3D%25=1");
			});
		});
		mocha.describe("\"encodeValues\"", () => {
			mocha.it("Should not encode values when \"encodeValues\" is false", () => {
				assert.equal(qs.stringify({a: " "}, {encodeValues: false}), "a= ");
			});
			mocha.it("Should encode values when \"encodeValues\" is true", () => {
				assert.equal(qs.stringify({a: " "}, {encodeValues: true}), "a=%20");
			});
			mocha.it("Should encode special characters in values anyway", () => {
				assert.equal(qs.stringify({a: "&[]=%"}, {encodeValues: false}), "a=%26%5B%5D%3D%25");
			});
		});
	});

	mocha.describe("Plain arrays", () => {
		mocha.it("Should return correct result when passing a common array", () => {
			assert.equal(qs.stringify(["a", "b", "c"]), "0=a&1=b&2=c");
		});
		mocha.it("Should return empty string when the array is empty", () => {
			assert.equal(qs.stringify([]), "");
		});
		mocha.it("Should discard empty values when the array is sparsed", () => {
			assert.equal(qs.stringify(["a", , "c"]), "0=a&2=c");
		});
	});
	mocha.describe("Plain objects", () => {
		mocha.it("Should return correct result when passing a common object", () => {
			assert.equal(qs.stringify({a: 1, b: 2, c: 3}), "a=1&b=2&c=3");
		});
		mocha.it("Should return empty string when the object is empty", () => {
			assert.equal(qs.stringify({}), "");
		});
	});
	mocha.describe("Arrays in arrays", () => {
		mocha.it("Should return correct result when passing an array in array", () => {
			assert.equal(qs.stringify([["a"]]), "0[]=a");
		});
		mocha.it("Should return empty string when the arrays are empty", () => {
			assert.equal(qs.stringify([[], []]), "");
		});
		mocha.it("Should not produce indices when nested arrays contain single item", () => {
			assert.equal(qs.stringify([["a"], ["b"], ["c"]]), "0[]=a&1[]=b&2[]=c");
		});
		mocha.it("Should not produce indices when deeply nested arrays contain single item", () => {
			assert.equal(qs.stringify([[["a"]], [["b"]], [["c"]]]), "0[][]=a&1[][]=b&2[][]=c");
		});
		mocha.it("Should not produce explicit indices when deeply nested arrays contain multiple items", () => {
			assert.equal(qs.stringify([[["a"], ["b"], ["c"]]]), "0[][]=a&0[][]=b&0[][]=c");
		});
	});
	mocha.describe("Objects in arrays", () => {
		mocha.it("Should return correct result when passing an object in array", () => {
			assert.equal(qs.stringify([{a: 1}]), "0[a]=1");
		});
		mocha.it("Should return empty string when object and array are empty", () => {
			assert.equal(qs.stringify([{}, {}]), "");
		});
	});
	mocha.describe("Objects in objects", () => {
		mocha.it("Should return correct result when passing an object in object", () => {
			assert.equal(qs.stringify({a: {b: {c: 3}}, b: {c: 3}, c: 3}), "a[b][c]=3&b[c]=3&c=3");
		});
		mocha.it("Should return empty string when objects are empty", () => {
			assert.equal(qs.stringify({a: {b: {}}}), "");
		});
	});
	mocha.describe("Arrays in objects", () => {
		mocha.it("Should return correct result when passing an array in object", () => {
			assert.equal(qs.stringify({a: ["a", "b", "c"]}), "a[]=a&a[]=b&a[]=c");
		});
		mocha.it("Should return empty string when arrays and objects are empty", () => {
			assert.equal(qs.stringify({a: []}), "");
		});
	});
});

mocha.describe("parse()", () => {
	mocha.it("Should return empty object literal when the string is empty", () => {
		assert.deepStrictEqual(qs.parse(""), {});
	});
	mocha.it("Should return empty object literal when the string consists of delimiters", () => {
		assert.deepStrictEqual(qs.parse("&&&"), {});
	});
	mocha.it("Should return empty object literal when the string constists of empty values", () => {
		assert.deepStrictEqual(qs.parse("a=&b=&c="), {});
	});
	mocha.it("Should decode keys when keys are encoded", () => {
		assert.deepStrictEqual(qs.parse("%20=a"), {" ": "a"});
	});
	mocha.it("Should decode values when values are encoded", () => {
		assert.deepStrictEqual(qs.parse("a=%20"), {a: " "});
	});
	mocha.it("Should consider multiple delimiters as a single one", () => {
		assert.deepStrictEqual(qs.parse("&a=1&&&b=2&&"), {a: 1, b: 2});
	});
	mocha.it("Should return true for flags", () => {
		assert.deepStrictEqual(qs.parse("a=1&b"), {a: 1, b: true});
	});
	mocha.it("Should discard empty values by default when options aren't present", () => {
		assert.deepStrictEqual(qs.parse("a=&b=2"), {b: 2});
	});
	mocha.it("Should cast string scalars to corresponding types", () => {
		assert.deepStrictEqual(qs.parse("a=null&b=undefined&c=true&d=-1"), {a: null, b: undefined, c: true, d: -1});
	});
	mocha.it("Should return the last value for multiple key occurences", () => {
		assert.deepStrictEqual(qs.parse("a=1&a=2"), {a: 2});
	});
	mocha.it("Should create new entry for each empty index ([])", () => {
		assert.deepStrictEqual(qs.parse("a[]=1&a[]=2"), {a: [1, 2]});
	});
	mocha.it("Should create new entry for each empty index ([]) for deep objects", () => {
		assert.deepStrictEqual(qs.parse("a[][a]=1&a[][b]=2"), {a: [{a: 1}, {b: 2}]});
	});
	mocha.it("Should return an array when the top-level keys are numbers", () => {
		assert.deepStrictEqual(qs.parse("0=a&1=c"), ["a", "c"]);
	});
	mocha.it("Should return an array when specifying an explicit numeric keys", () => {
		assert.deepStrictEqual(qs.parse("a[0]=1&a[1]=2"), {a: [1, 2]});
	});
	mocha.it("Should preserve all equal signs after the first one when the value contains raw equal signs", () => {
		assert.deepStrictEqual(qs.parse("a=b=c&b=c=d"), {a: "b=c", b: "c=d"});
	});
	mocha.it("Should allow raw brackets in values", () => {
		assert.deepStrictEqual(qs.parse("a=[b]"), {a: "[b]"});
	});
	mocha.it("Should override inherited properties when key is one of inherited property", () => {
		assert.deepStrictEqual(qs.parse("toString=1&hasOwnProperty=2"), {toString: 1, hasOwnProperty: 2});
	});
	mocha.it("Should return malformed URI values as is instead of throwing an error", () => {
		assert.deepStrictEqual(qs.parse("a=%1"), {a: "%1"});
	});
	mocha.it("Should return sparsed array when the string contains sparsed numeric indices", () => {
		assert.deepStrictEqual(qs.parse("a[0]=a&a[2]=c"), {a: ["a", , "c"]});
	});
	mocha.it("Should return plain object when the key contains open bracket", () => {
		assert.deepStrictEqual(qs.parse("a[=1"), {"a[": 1});
		assert.deepStrictEqual(qs.parse("a[b[=1"), {"a[b[": 1});
	});
	mocha.it("Should return plain object when the key contains close bracket", () => {
		assert.deepStrictEqual(qs.parse("a]=1"), {"a]": 1});
	});
	mocha.it("Should continue counting keys when object has explicit numeric keys and implicit ones", () => {
		assert.deepStrictEqual(qs.parse("a[1]=a&a[2]=b&a[]=c"), {a: [, "a", "b", "c"]});
	});
	mocha.it("Should start counting from 0 when object has explicit string keys and implicit ones", () => {
		assert.deepStrictEqual(qs.parse("a[a]=1&a[b]=2&a[]=3"), {a: {a: 1, b: 2, 0: 3}});
	});
	mocha.it("Should return object when the first keys are numbers and the last ones are strings", () => {
		assert.deepStrictEqual(qs.parse("0=a&1=b&c=c"), {0: "a", 1: "b", c: "c"});
	});
	mocha.it("Should return object for nested structures when the first keys ommited and the last ones are strings", () => {
		assert.deepStrictEqual(qs.parse("a[]=a&a[]=b&a[c]=c"), {a: {0: "a", 1: "b", c: "c"}});
	});
	mocha.it("Should return object for nested structures when the first keys are numbers and the last ones are strings", () => {
		assert.deepStrictEqual(qs.parse("a[0]=a&a[1]=b&a[c]=c"), {a: {0: "a", 1: "b", c: "c"}});
	});
	mocha.it("Should discard entry with empty key", () => {
		assert.deepStrictEqual(qs.parse("=1&b=2"), {b: 2});
	});
	mocha.it("Should decode percent-encoded keys only once", () => {
		assert.deepStrictEqual(qs.parse("%2520=a"), {"%20": "a"});
	});
	mocha.it("Should decode percent-encoded values only once", () => {
		assert.deepStrictEqual(qs.parse("a=%2520"), {a: "%20"});
	});
	mocha.it("Should return correct result when parsing complex query string", () => {
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

	mocha.describe("Casting numbers", () => {
		mocha.it("Should properly cast zero", () => {
			assert.deepStrictEqual(qs.parse("a=0"), {a: 0});
		});
		mocha.it("Should properly cast positive number", () => {
			assert.deepStrictEqual(qs.parse("a=5"), {a: 5});
		});
		mocha.it("Should properly cast negative number", () => {
			assert.deepStrictEqual(qs.parse("a=-5"), {a: -5});
		});
		mocha.it("Should properly cast positive float", () => {
			assert.deepStrictEqual(qs.parse("a=5.5"), {a: 5.5});
		});
		mocha.it("Should properly cast negative float", () => {
			assert.deepStrictEqual(qs.parse("a=-5.5"), {a: -5.5});
		});
		mocha.it("Should properly cast positive binary number", () => {
			assert.deepStrictEqual(qs.parse("a=0b111"), {a: 0b111});
		});
		mocha.it("Should properly cast negative binary number", () => {
			assert.deepStrictEqual(qs.parse("a=-0b111"), {a: -0b111});
		});
		mocha.it("Should properly cast positive octal number", () => {
			assert.deepStrictEqual(qs.parse("a=0o10"), {a: 0o10});
		});
		mocha.it("Should properly cast negative octal number", () => {
			assert.deepStrictEqual(qs.parse("a=-0o10"), {a: -0o10});
		});
		mocha.it("Should properly cast positive hexadecimal number", () => {
			assert.deepStrictEqual(qs.parse("a=0xF"), {a: 0xF});
		});
		mocha.it("Should properly cast negative hexadecimal number", () => {
			assert.deepStrictEqual(qs.parse("a=-0xF"), {a: -0xF});
		});
		mocha.it("Should properly cast positive exponential number with positive degree", () => {
			assert.deepStrictEqual(qs.parse("a=1e1"), {a: 1e1});
		});
		mocha.it("Should properly cast negative exponential number with positive degree", () => {
			assert.deepStrictEqual(qs.parse("a=-1e1"), {a: -1e1});
		});
		mocha.it("Should properly cast positive exponential number with negative degree", () => {
			assert.deepStrictEqual(qs.parse("a=1e-1"), {a: 1e-1});
		});
		mocha.it("Should properly cast negative exponential number with negative degree", () => {
			assert.deepStrictEqual(qs.parse("a=-1e-1"), {a: -1e-1});
		});
	});

	mocha.describe("Overriding", () => {
		mocha.it("Should return value for the latest key occurence", () => {
			assert.deepStrictEqual(qs.parse("a=a&a=b"), {a: "b"});
		});
		mocha.it("Should drop value when the first key contains value and the second does not and \"preserveEmpty\" is true", () => {
			assert.deepStrictEqual(qs.parse("a=a&a=", {preserveEmpty: true}), {a: ""});
		});
		mocha.it("Should drop value when the first key contains value and the second does not and \"preserveEmpty\" is false", () => {
			assert.deepStrictEqual(qs.parse("a[b][c]=a&a[b]=", {preserveEmpty: false}), {});
		});
		mocha.it("Should override nested structure with primitive value", () => {
			assert.deepStrictEqual(qs.parse("a[]=a&a=b"), {a: "b"});
		});
		mocha.it("Should override primitive value with nested structure", () => {
			assert.deepStrictEqual(qs.parse("a=a&a[]=b"), {a: ["b"]});
		});
	});

	mocha.describe("Options", () => {
		mocha.describe("\"preserveEmpty\"", () => {
			mocha.it("Should discard empty values when \"preserveEmpty\" is false", () => {
				assert.deepStrictEqual(qs.parse("a=&b=", {preserveEmpty: false}), {});
			});
			mocha.it("Should preserve empty values when \"preserveEmpty\" is true", () => {
				assert.deepStrictEqual(qs.parse("a=&b=", {preserveEmpty: true}), {a: "", b: ""});
			});
		});
		mocha.describe("\"scalars\"", () => {
			mocha.it("Should preserve values as strings when \"scalars\" is false", () => {
				assert.deepStrictEqual(qs.parse("a=null&b=undefined&c=true&d=false&f=-1", {scalars: false}), {a: "null", b: "undefined", c: "true", d: "false", f: "-1"});
			});
			mocha.it("Should cast values to corresponding types when \"scalars\" is true", () => {
				assert.deepStrictEqual(qs.parse("a=null&b=undefined&c=true&d=false&f=-1", {scalars: true}), {a: null, b: undefined, c: true, d: false, f: -1});
			});
			mocha.it("Should not cast space to zero when \"scalars\" is true", () => {
				assert.deepStrictEqual(qs.parse("a= ", {scalars: true}), {a: " "})
			});
		});
		mocha.describe("\"decodeValue\"", () => {
			mocha.it("Should accept valid arguments", () => {
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
			mocha.it("Should not be called when query string is empty", () => {
				let called = false;
				const noop = () => called = true;
				qs.parse("", {decodeValue: noop});
				assert.equal(called, false);
			});
			mocha.it("Should not be called for empty values when \"preserveEmpty\" is false", () => {
				const tracker = new assert.CallTracker();
				const noop = tracker.calls(() => {}, 2);
				qs.parse("a=1&b=2&c=", {preserveEmpty: false, decodeValue: noop});
				tracker.verify();
			});
			mocha.it("Should be called for empty values when \"preserveEmpty\" is true", () => {
				const tracker = new assert.CallTracker();
				const noop = tracker.calls(() => {}, 3);
				qs.parse("a=1&b=2&c=", {preserveEmpty: true, decodeValue: noop});
				tracker.verify();
			});
			mocha.it("Should accept valid index argument for every entry when some of them empty and \"preserveEmpty\" is false", () => {
				const indices: number[] = [];
				qs.parse("a=1&b=&c=3", {decodeValue(k, v, i): void {
					k; v;
					indices.push(i);
				}});
				assert.deepStrictEqual(indices, [0, 2]);
			});
			mocha.it("Should override default values for plain structures", () => {
				assert.deepStrictEqual(qs.parse("a=1&b=2&c=3", {decodeValue: k => k}), {a: "a", b: "b", c: "c"});
			});
			mocha.it("Should override default values for nested structures", () => {
				assert.deepStrictEqual(qs.parse("a[]=1&a[]=2&a[]=3", {decodeValue: k => k}), {a: ["a[]", "a[]", "a[]"]});
			});
		});
	});
});

mocha.describe("stringify() === parse()", () => {
	mocha.it.skip("Should return equal results with default options");
});
