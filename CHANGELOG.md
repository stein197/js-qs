# CHANGELOG

## [2.0.2](../../compare/2.0.1..2.0.2) - 2023-07-17
### Fixed
- `parse()` handling objects returned by `decode()` callback

## [2.0.1](../../compare/2.0.0..2.0.1) - 2023-04-30
### Fixed
- Fixed `sparse() is not a function` error. Updated the `@stein197/util` dependency

## [2.0.0](../../compare/1.1.0..2.0.0) - 2023-04-23
### Added
- Generic return type for `parse()`
- `encode()` and `decode()` functions
- `parse()` and `stringify()` now accept `decode` and `encode` parameters respectively

### Changed
- Number parsing now uses native `Number.parseFloat()`

### Removed
- Check for circular dependencies
- `preserveEmpty`, `scalars`, `nulls`, `flags`, `encodeKeys`, `encodeValues` options

## [1.1.0](../../compare/1.0.0..1.1.0) - 2022-09-07
### Added
- `decodeValue` function to provide custom value decoder

### Fixed
- Entries with empty keys are discarded

## [1.0.0](../../1.0.0) - 2022-09-04
Release
