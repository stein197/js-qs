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
		if(!string)
			return {};
		var result = {};
		var queryParts = string.split("&");
		for(var i in queryParts){
			var parts = queryParts[i].split("=");
			var keyParts = parts[0].split(/[\[\]]{1,2}/);
			var value = parts[1];
			if(keyParts.length > 2)
				keyParts.pop();
			var parentObj = result;
			for(var j = 0; j < keyParts.length; j++){
				var key = keyParts[j];
				var nextKey = keyParts[j + 1];
				if(!parentObj[key]){
					if(nextKey === undefined){
						if(Array.isArray(parentObj))
							parentObj.push(value);
						else
							parentObj[key] = value;
					} else if(nextKey === "" || nextKey.search(/^\d+$/) >= 0) {
						parentObj[key] = [];
					} else {
						parentObj[key] = {};
					}
				}
				var parentObj = parentObj[key];
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

	getFormQuery: function(form) {}
};

module.exports.URLParams = URLParams;
