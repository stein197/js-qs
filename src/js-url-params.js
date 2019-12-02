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
	toString: function(data) {
		var result = [];
		var keyPath = arguments[1] || [];
		var keyPrefix = "";
		if (keyPath.length) {
			keyPrefix = keyPath[0];
			if (keyPath.length > 1) {
				keyPrefix += "[" + keyPath.slice(1).join("][") + "]";
			}
		}
		for (var key in data) {
			var value = data[key];
			if(typeof value === "object"){
				result.push(URLParams.toString(value, keyPath.concat(key)));
			} else {
				if (keyPrefix) {
					if(Array.isArray(data)){
						result.push(keyPrefix + "[]=" + value);
					} else {
						result.push(keyPrefix + "[" + key + "]=" + value);
					}
				} else {
					result.push(key + "=" + value);
				}
			}
		}
		return result.join("&");
	},
	
	/**
	 * Parses given string into object structure.
	 * @param {string} string String to be parsed into object.
	 * @return {Object} Object parsed from given string or null
	 *                  if string is empty.
	 */
	fromString: function(string) {
		if(!string)
			return null;
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
	 *                  Returns null if page does not have query string.
	 */
	getQuery: function() {
		return URLParams.fromString(location.search ? location.search.split("?")[1] : "");
	}
};
