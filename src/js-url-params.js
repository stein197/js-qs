/**
 * Encapsulates functions to work with query string
 * parameters.
 * @namespace
 */
var URLParams = {

	/**
	 * Recursively converts object to query string.
	 * @param {Object} data Object to be converted to query string.
	 * @return {string} Query string presented by data parameter. Empty
	 *                  if object is empty.
	 */
	toString: function(data, path) {
		path = path || [];
		var dataType = typeof data;
		if (!path.length) {
			if (data === null || dataType !== "object" || Array.isArray(data))
				throw new TypeError("Only object types are allowed");
		}
		var result = [];
		var strPath = path[0];
		if (path.length > 1)
			strPath += "[" + path.slice(1).join("][") + "]";
		for (var key in data) {
			var value = data[key];
			if (value === "" || value === null)
				continue;
			if (typeof value === "object") {
				var clonedPath = path.slice(0);
				clonedPath.push(Array.isArray(data) ? "" : key);
				result.push(URLParams.toString(value, clonedPath));
			} else {
				if (strPath) {
					var actualKey = strPath + (Array.isArray(data) ? "[]" : "[" + key + "]");
					result.push(actualKey + "=" + value);
				} else {
					result.push(key + "=" + value);
				}
			}
		}
		return result.join("&");
	},

	/**
	 * Parses given string into object structure.
	 * Produces structures as php's arrays.
	 * @param {string} string String to be parsed into object.
	 * @return {Object} Object parsed from given string.
	 *                  If string is empty then empty object is returned
	 */
	fromString: function(string) {
		string = string.trim();
		string = string.replace(/^&+|&+$/g, "");
		if(!string)
			return {};
		var result = {};
		var queryParts = string.split(/&+/g);
		for (var key in queryParts) {
			var parts = queryParts[key].split("=");
			var keyPath = parts[0];
			var value = parts.slice(1).join("=");
			if (!value)
				continue;
			var keyName = keyPath.match(/^.+?(?=\[|$)/)[0];
			// Single value
			if (keyName === keyPath) {
				result[keyName] = value;
			// Nested value
			} else {
				var keyArray = keyPath.match(/\[.*?\]+/g).map(function(v) {
					var raw = v.slice(1, -1);
					return raw;
				});
				keyArray.unshift(keyName);
				var parent = result;
				var lastKey = keyArray.pop();
				for (var i = 0; i < keyArray.length; i++) {
					var currentKey = keyArray[i];
					if (currentKey) {
						if (currentKey in parent && typeof parent[currentKey] === "object") {
							parent = parent[currentKey];
							continue;
						} else {
							parent[currentKey] = {};
							parent = parent[currentKey];
						}
					} else {
						var highestKey = 0;
						Object.keys(parent).forEach(function(v) {
							var numeric = +v;
							if (isNaN(numeric)) {
								return;
							} else {
								highestKey++;
							}
						});
						parent[highestKey] = {};
						parent = parent[highestKey];
					}
				}
				if (lastKey) {
					parent[lastKey] = value;
				} else {
					var highestKey = 0;
					Object.keys(parent).forEach(function(v) {
						var numeric = +v;
						if (isNaN(numeric)) {
							return;
						} else {
							highestKey++;
						}
					});
					parent[highestKey] = value;
				}
			}
		}
		for (var k in result) {
			if (typeof result[k] === "object") {
				result[k] = URLParams.objectToArray(result[k]);
			}
		}
		return result;
	},

	/**
	 * 
	 * @param {*} obj 
	 * @private
	 */
	objectToArray: function(obj) {
		var keys = Object.keys(obj);
		var isArray = keys.every(function(v) {
			return !isNaN(+v);
		});
		var result = isArray ? [] : {};
		for (var key in obj) {
			var value = obj[key];
			if (typeof value === "object")
				if (isArray)
					result.push(URLParams.objectToArray(value));
				else
					result[key] = URLParams.objectToArray(value);
			else
				if (isArray)
					result.push(value);
				else
					result[key] = value;
		}
		return result;
	},

	/**
	 * @private
	 */
	arrayToObject: function(arr) {
		var result = {};
		for (var i in arr) {
			result[i] = arr[i];
		}
		return result;
	},

	/**
	 * Sets page's query string params.
	 * Replaces old value.
	 * @param {Object} data Object to be parsed and set as query string.
	 * @return {Object} Old query string params.
	 */
	setQuery: function(data) {
		var queryString = URLParams.toString(data);
		var url = location.protocol + "//" + location.host + location.pathname;
		var old = location.search.split("?")[1];
		if (queryString)
			url += "?" + queryString;
		if (location.hash)
			url += location.hash;
		history.pushState({
			path: url
		}, "", url);
		return URLParams.fromString(old);
	},

	/**
	 * Returns page's query string params as object.
	 * @return {Object} Object, representing page's query string.
	 *                  Returns empty object if page does not have query string.
	 */
	getQuery: function() {
		return URLParams.fromString(location.search ? location.search.split("?")[1] : "");
	},

	/**
	 * Check if two query strings are equal.
	 * Query strings are equal if they have same amount of parameters
	 * and its values. The order does not mean. Trailing whitespaces
	 * are trimmed.
	 * @param {String} str1 First string.
	 * @param {String} str2 Seconds string.
	 * @return {boolean} True if two strings can be parsed into equal query objects.
	 */
	queriesAreEqual: function(str1, str2) {
		if (typeof str1 !== "string" || typeof str2 !== "string")
			return false;
		if (str1 === str2)
			return true;
		str1 = str1.trim().replace(/^&+|&+$/g, "");
		str2 = str2.trim().replace(/^&+|&+$/g, "");
		var parts1 = str1.split("&");
		var parts2 = str2.split("&");
		var fnReduce = function(o, v) {
			var pair = v.split("=");
			if (pair[1])
				o[pair[0]] = pair[1];
			return o;
		}
		var obj1 = parts1.reduce(fnReduce, {});
		var obj2 = parts2.reduce(fnReduce, {});
		if (Object.keys(obj1).length !== Object.keys(obj2).length)
			return false;
		for (var key in obj1) {
			if (!(key in obj2) || obj2[key] !== obj1[key])
				return false;
		}
		return true;
	},

	/**
	 * Sets single query value at a time.
	 * @param {string} key Key which value to be changed.
	 *                     To change nested values use dot notation like
	 *                     "key1.key2". Number indexes also can be used.
	 * @param {string} value New value.
	 * @param {object} [object=URLParams.getQuery()] The object into which the value is inserted.
	 * @return {string} Previous value or null if there was no old value.
	 * @throws {TypeError} If types of passed arguments do not match the expectable.
	 */
	set: function(key, value, object) {
		if (object !== undefined && typeof object !== "object")
			throw new TypeError("Only objects allowed for the third argument");
		if (typeof key !== "string")
			throw new TypeError("The key parameter should be of string type");
		var queryObj = object || URLParams.getQuery();
		var pathArray = key.split(".");
		var lastPathKey = pathArray.pop();
		lastPathKey = +lastPathKey == lastPathKey ? +lastPathKey : lastPathKey;
		var currentEntry = queryObj;
		for (var i in pathArray) {
			var pathKey = pathArray[i];
			var pathKeyIsNum = +pathKey == pathKey;
			pathKey = pathKeyIsNum ? +pathKey : pathKey;
			if (!(pathKey in currentEntry) || (typeof currentEntry[pathKey] !== "object" && !Array.isArray(currentEntry[pathKey]))) {
				var nextPathKey = pathKey[i + 1];
				if (nextPathKey && +nextPathKey == nextPathKey) {
					currentEntry[pathKey] = [];
				} else {
					currentEntry[pathKey] = {};
				}
			}
			currentEntry = currentEntry[pathKey];
		}
		var old = currentEntry[lastPathKey];
		currentEntry[lastPathKey] = value;
		if (!object)
			URLParams.setQuery(queryObj);
		return old ? old : null;
	},

	/**
	 * Returns single query key value.
	 * @param {string} key Key of which value is returned.
	 *                     To retrieve nested values use dot notation like
	 *                     "key1.key2". Number indexes also can be used.
	 * @param {object} [object=URL.getQuery()] The object from which the value is retrieved.
	 * @return {string} Requested value or null if value is not present.
	 */
	get: function(key, object) {
		var queryObj = object || URLParams.getQuery();
		var pathArray = key.split(".");
		var currentEntry = queryObj;
		for (var i in pathArray) {
			try {
				var pathKey = +pathArray[i] == pathArray[i] ? +pathArray[i] : pathArray[i];
				currentEntry = currentEntry[pathKey];
			} catch (ex) {
				return null;
			}
		}
		return currentEntry ? currentEntry : null;
	}, // TODO

	/**
	 * 
	 * @param {string} key 
	 * @return {string}
	 */
	remove: function(key) {}, // TODO

	getFormQueryObject: function(form) {} // TODO
};

if ("object" === typeof module && "object" === typeof module.exports)
	module.exports.URLParams = URLParams;
