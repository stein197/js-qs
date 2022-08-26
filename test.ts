import assert from "assert";
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
		// @ts-ignore
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
	});

	mocha.describe("Options", () => {
		mocha.describe("\"preserveEmpty\"", () => {
			mocha.it("Should discard empty values when \"preserveEmpty\" is false", () => {
				assert.equal(qs.stringify({a: "", b: [], c: {}}, {preserveEmpty: false}), "");
			});
			mocha.it("Should preserve empty values when \"preserveEmpty\" is true", () => {
				assert.equal(qs.stringify({abc: "", def: [], ghi: {}}, {preserveEmpty: true}), "abc=&def=&ghi=");
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
				// @ts-ignore
				assert.equal(qs.stringify({a: null, b: undefined}, {nulls: false}), "");
			});
			mocha.it("Should stringify null and undefined when \"nulls\" is true", () => {
				// @ts-ignore
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
		mocha.it.skip("Should return correct result when passing a common array");
		mocha.it.skip("Should return empty string when the array is empty");
		mocha.it.skip("Should discard empty values when the array is sparsed");
	});
	mocha.describe("Plain objects", () => {
		mocha.it.skip("Should return correct result when passing a common object");
		mocha.it.skip("Should return empty string when the object is empty");
	});
	mocha.describe("Arrays in arrays", () => {
		mocha.it.skip("Should return correct result when passing an array in array");
		mocha.it.skip("Should return empty string when the arrays are empty");
		mocha.it.skip("Should not produce indices when nested arrays contain single item");
		mocha.it.skip("Should not produce indices when deeply nested arrays contain single item");
		mocha.it.skip("Should produce explicit indices when nested arrays contain multiple items");
		mocha.it.skip("Should produce explicit indices when deeply nested arrays contain multiple items");
	});
	mocha.describe("Objects in arrays", () => {
		mocha.it.skip("Should return correct result when passing an object in array");
		mocha.it.skip("Should return empty string when object and array are empty");
		mocha.it.skip("Should not produce indices when nested objects contain single item");
		mocha.it.skip("Should not procues indices when deeply nested objects contain single item");
		mocha.it.skip("Should produce explicit indices when nested objects contain multiple items");
		mocha.it.skip("Should produce explicit indices when deeply nested objects contain multiple items");
	});
	mocha.describe("Objects in objects", () => {
		mocha.it.skip("Should return correct result when passing an object in object");
		mocha.it.skip("Should return empty string when objects are empty");
	});
	mocha.describe("Arrays in objects", () => {
		mocha.it.skip("Should return correct result when passing an arrasy in object");
		mocha.it.skip("Should return empty string when arrays and objects are empty");
	});
});

mocha.describe("parse()", () => {
	mocha.it.skip("Should return empty object literal when the string is empty");
	mocha.it.skip("Should return empty object literal when the string consists of delimiters");
	mocha.it.skip("Should return empty object literal when the string constists of empty values");
	mocha.it.skip("Should decode keys when keys are encoded");
	mocha.it.skip("Should decode values when values are encoded");
	mocha.it.skip("Should consider multiple delimiters as a single one");
	mocha.it.skip("Should return true for flags");
	mocha.it.skip("Should discard empty values by default when options aren't present");
	mocha.it.skip("Should cast string scalars to corresponding types");
	mocha.it.skip("Should return the last value for multiple key occurences");
	mocha.it.skip("Should create new entry for each empty index ([])");
	mocha.it.skip("Should create new entry for each empty index ([]) for deep objects");
	mocha.it.skip("Should return an array when the top-level keys are numbers");
	mocha.it.skip("Should return correct result when parsing complex query string");
	mocha.it.skip("Should return an array when specifying an explicit numeric keys");
	mocha.it.skip("Should preserve all equal signs after the first one when the value contains raw equal signs");
	mocha.it.skip("Should allow raw brackets in values");
	mocha.it.skip("Should override inherited properties when key is one of inherited property");
	mocha.it.skip("Should return malformed URI values as is instead of throwing an error");
	mocha.it.skip("Should return sparsed array when the string contains sparsed numeric indices");
	mocha.it.skip("Should return plain object when the key contains open bracket");
	mocha.it.skip("Should return plain object when the key contains close bracket");

	mocha.describe("Options", () => {
		mocha.describe("\"preserveEmpty\"", () => {
			mocha.it.skip("Should discard empty values when \"preserveEmpty\" is false");
			mocha.it.skip("Should preserve empty values when \"preserveEmpty\" is true");
		});
		mocha.describe("\"scalars\"", () => {
			mocha.it.skip("Should preserve values as strings when \"scalars\" is false");
			mocha.it.skip("Should cast values to corresponding types when \"scalars\" is true");
		});
	});
});

mocha.describe("stringify() === parse()", () => {
	mocha.it.skip("Should return equal results with default options");
});
