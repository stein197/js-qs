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
|string|toString(data)|Recursively converts object to query string. Empty objects return empty strings. Other types are not allowed and `TypeError` is thrown.|
|object|fromString(string)|Parses given string into object structure. Produces structures as php's arrays. Empty strings produce empty objects. There is support for nested values like "a[b][c]=1".|
|object|setQuery(data)|Sets page's query string params presented by given object. Replaces old query string. Returns old one as object.|
|object|getQuery()|Returns page's query string params as object. Returns empty object if page does not have query string.|
|boolean|queriesAreEqual(str1, str2)|Check if two query strings are equal. Query strings are equal if they have same amount of parameters and its values. The order does not mean. Trailing whitespaces are trimmed.|

Can be used in NodeJS via `module.exports.URLParams`. To test code run `npm test`. Uses chai and mocha testing libraries as dependencies.