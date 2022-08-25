import assert from "assert";
import mocha from "mocha";
import * as qs from ".";

mocha.describe("stringify()", () => {
	mocha.it.skip("Should not emit indices for arrays by default when options aren't present");
	mocha.it.skip("Should not stringify flags by default when options aren't present");
	mocha.it.skip("Should discard empty values by default when options aren't present");
	mocha.it.skip("Should discard null and undefined by default when options aren't present");
	mocha.it.skip("Should not encode keys by default when options aren't present");
	mocha.it.skip("Should not encode values by default when options aren't present");
	mocha.it.skip("Should encode special characters in keys");
	mocha.it.skip("Should encode special characters in values");
	mocha.it.skip("Should return correct result when passing large complex object with custom options");

	mocha.describe("Options", () => {
		mocha.describe("\"preserveEmpty\"", () => {
			mocha.it.skip("Should discard empty values when \"preserveEmpty\" is false");
			mocha.it.skip("Should preserve empty values when \"preserveEmpty\" is true");
		});
		mocha.describe("\"indices\"", () => {
			mocha.it.skip("Should not emit indices for arrays when \"indices\" is false");
			mocha.it.skip("Should emit indices for arrays when \"indices\" is true");
		});
		mocha.describe("\"flags\"", () => {
			mocha.it.skip("Should stringify flags when \"flags\" is false");
			mocha.it.skip("Should not stringify flags when \"flags\" is true");
		});
		mocha.describe("\"nulls\"", () => {
			mocha.it.skip("Should discard null and undefined when \"nulls\" is false");
			mocha.it.skip("Should stringify null and undefined when \"nulls\" is true");
		});
		mocha.describe("\"encodeKeys\"", () => {
			mocha.it.skip("Should not encode keys when \"encodeKeys\" is false");
			mocha.it.skip("Should encode keys when \"encodeKeys\" is true");
			mocha.it.skip("Should encode special characters in keys anyway");
		});
		mocha.describe("\"encodeValues\"", () => {
			mocha.it.skip("Should not encode values when \"encodeValues\" is false");
			mocha.it.skip("Should encode values when \"encodeValues\" is true");
			mocha.it.skip("Should encode special characters in values anyway");
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
	});
	mocha.describe("Objects in arrays", () => {
		mocha.it.skip("Should return correct result when passing an object in array");
		mocha.it.skip("Should return empty string when object and array are empty");
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
	mocha.it.skip("Should return an array when the top-level keys are numbers");
	mocha.it.skip("Should return correct result when parsing complex query string");

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
