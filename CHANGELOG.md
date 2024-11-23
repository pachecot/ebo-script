# Change Log

All notable changes to the "ebo-script" extension will be documented in this file.

## [0.13.3] 2024-11-23

  - add missing Find function

## [0.13.2] 2024-06-09

  - updated print statement parsing
  - fix scanner for strings with escape sequences    

## [0.13.1] 2024-06-08

 - added some initial support for infinet controller programming that generated errors on properties: 
    - `Alarm1` - `Alarm8`
    - `Refresh`
    - `State` 
    - `Size` 
 - added value `NotSet` 
 - fixed some missing support for Enable and Disable actions.
 - misc fixes
 - additional tests

## [0.12.1] 2023-08-05

 - updates to declaration code actions
 - updated clean declarations for expanded declarations
    - group by input, output, function, locals
    - sorted by name
    - include lines with single declaration and comments (these were skipped before and pushed to the end)
 - updated parsing of declarations. removed some illegal combinations that were allowed before.  

## [0.11.1] 2023-07-09

 - updated dependencies

## [0.11.0] 2023-07-09

 - fix reported bug for expressions in case statements.
 - misc initial updates for newer added language features. 

## [0.10.13] 2023-06-21

- fix issue with clean declarations leaving dangling empty declarations.

## [0.10.12] 2023-06-20

- added command for generating single mermaid state diagram of the current script file
    - command: `ebo-script: Create State Diagram`
    - creates [filename].mmd in current folder and opens 
    in editor. 
    - see mermaid plugins for viewing the state graph

## [0.10.11] 2023-06-18

- added command for generating mermaid state diagrams
    - command: `ebo-script: Generate State Diagrams`
    - creates _state_diagram.html in current folder. 
    - opens file in browser.
    - uses js mermaid library to generate the diagrams (requires internet). 
- added support missing reserved values: 
    - FlashEmpty
    - BackupNow
    - BackupNeeded

## [0.10.10] 2023-03-05

- added support for logical operators 
    - &: and
    - !: or

## [0.10.9] 2023-02-19

- update formatting
    - normalize new lines.
    - normalize spaces.
- fix basedon statements were not adding references.

## [0.10.8] 2023-02-08

- script function arguments - assignment.

## [0.10.7] 2023-02-07

- script function arguments - indexing arrays.

## [0.10.6] 2023-02-07

- better number support. 
    - allow numbers starting with .  
    - % with fractional numbers  

## [0.10.5] 2022-07-09

- added precedence checking to parsing.
- error check for files ending on line statement.
- cursor prevent overrun.

## [0.10.4] 2022-07-07

- syntaxes updated. added words.
- misc. changes

## [0.10.3] 2022-07-06

- fix function programs
- fix return statements

## [0.10.2] 2022-07-06

- fix errors reporting on function statements 
- fix errors on numbers with % symbol 

## [0.10.1] 2022-07-05

- minor updates 

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