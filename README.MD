# JavaScript URL query string params parser and reader
This simple script is used to parse URL query string to JS objects and stringify these objects into string so they can be used in AJAX queries. Supports nested objects.

## Installation
### As a Node.js module
```
npm install @stein197/qs
```
```js
import * as qs from "@stein197/qs";
```
### As a script tag
```html
<!-- The global qs variable will be accessible -->
<script src="qs.min.js"></script>
```

## Features
- Automatically omits redundant indices
- Automatically decodes percent-encoded chars
- Automatically infers types from values

## Usage

## NPM scripts
- `build` - builds the project
- `test` - runs unit tests

