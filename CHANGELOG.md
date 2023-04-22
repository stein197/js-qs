# CHANGELOG
## [2.0.0](../../compare/1.1.0..2.0.0) - XXXX-XX-XX
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
