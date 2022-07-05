# Change Log

All notable changes to the "ebo-script" extension will be documented in this file.

## [0.10.0] 2022-07-05

- improve error checking, rewrote the checker/parser.
- fix formatting of unary operators +/- 
- fix formatting of error line E:

## [0.9.9] 2022-03-03

- fix bad error for case else in select statement

## [0.9.8] 2022-02-15

- updated dependencies
- update to vscode 1.64 

## [0.9.4] 2022-02-14

### Added

- Added checks mismatched control statements

### Fixed 

- Added fix for public variable in for statement 

## [0.9.3] 2020-10-xx

### Added

- Added fix for mismatched variable case 
- Added check for misc colon (case statements) 

### Fixed 

- 

## [0.9.2] 2020-10-12

### Added

- snippets for declarations.
    - **numin** Numeric Input
    - **numout** Numeric Output
    - **numpub** Numeric Public
    - **num** Numeric
    - **datein** DateTime Input
    - **dateout** DateTime Output
    - **datepub** DateTime Public
    - **datet** DateTime
    - **strin** String Input
    - **strout** String Output
    - **strpub** String Public
    - **str** String
- created initial ebo.json config file support

### Fixed 

- select case snippet fixed for trailing colon on the case statement
- fix issues in assignment to arrays to support expressions

## [0.9.1] 2020-10-12

### Added

- command to list all variables can now exclude io and consumer points through config files.

### Fixed 

- system functions were generating parse errors

## [0.9.0] 2020-10-11

### Added

- command to list all scripts in folder
- command to list all variables 
- error checking for all files in folder 

### Fixed 

- misc

## [0.8.2] 2020-09-23

### Added

- settings for reformatting declarations

### Fixed 

- update code reformatting to use editor tab size and not fixed 2 spaces - (uses spaces only though!).

## [0.8.1] 2020-09-21

### Fixed 

- formatting error on trailing spaces after then
- add missing null keyword 
- inserted declarations are inserted after header comments

## [0.8.0] 2020-09-20

### Added

- added commands for reformatting declarations
- added command to clean up declarations

### Fixed 

- code fix for removing array declarations in list 

## [0.7.0]

- added code fixes for declaration errors
- added code fixes to change declaration types

## [0.6.0]

- better formatting.
- additional error checking

## [0.5.8]

- additional error checking
- misc bug fixes

## [0.5.8]

- added line continuations.
- misc bug fixes

## [0.5.6] - 2020-05-21

### Added

- support for line continuations
- error reporting for mismatched parentheses

### Fixed 

- based on syntax fixed for commas

## [0.5.0]

- Initial release