# JavaScript URL query string params parser and reader
This simple script is used to parse URL query string to JS objects and stringify these objects into string so they can be used in AJAX queries. Supports nested objects.

## Usage
Firstly, include this script like this:
```HTML
<script src="/src/js-url-params.js"></script>
```
All the functions to use are located in URLParams global object.

### Methods
|Return type|Name|Description|
|---|---|---|
|String|toString(Object data)|Recursively converts object to query string. Empty objects return empty strings. Other types are not allowed and `TypeError` is thrown.|
|Object|fromString(String string)|Parses given string into object structure. Produces structures as php's arrays. Empty strings produce empty objects. Supports nested values like `a[b][c]=1`.|
|Object|setQuery(Object data)|Sets page's query string params presented by given object. Replaces old query string. Returns old one as object.|
|Object|getQuery()|Returns page's query string params as object. Returns empty object if page does not have query string.|
|boolean|queriesAreEqual(String str1, String str2)|Check if two query strings are equal. Query strings are equal if they have same amount of parameters and its values. The order does not matter.|
|Object|set(String key, value)|Sets single query value at a time. Returns previous value or null if there was no old value.|
|Object|get(String key)|Returns single query key value or null if value is not presented.|
|Object|remove(String key)|Removes specified value from query string. Returns old value or null if there is no such a key.|
|Object|clear()|Clears page's query string. Returns current page query string.|

Can be used in NodeJS via `module.exports.URLParams`. To test code run `npm test`. Uses chai and mocha testing libraries as dependencies.
