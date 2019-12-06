/**
 * Encapsulates functions to work with query string
 * parameters.
 * @namespace
 */
var URLParams = {

	/**
	 * Recursively converts object to query string.
	 * @param {Object} data Object to be converted to query string.
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
						if (currentKey in parent) {
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
			if (typeof value === "object") {
				if (isArray)
					result.push(URLParams.objectToArray(value));
				else
					result[key] = URLParams.objectToArray(value);
			} else {
				if (isArray)
					result.push(value);
				else
					result[key] = value;
			}
		}
		return result;
	},

	/**
	 * Sets page's query string params.
	 * Replaces old value.
	 * @param {Object} data Object to be parsed and set as query string.
	 */
	setQuery: function(data) {
		var queryString = URLParams.toString(data);
		var url = location.protocol + "//" + location.host + location.pathname;
		if (queryString)
			url += "?" + queryString;
		if (location.hash)
			url += location.hash;
		history.pushState({
			path: url
		}, "", url);
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

	getFormQueryObject: function(form) {} // TODO
};

if ("object" === typeof module && "object" === typeof module.exports)
	module.exports.URLParams = URLParams;
