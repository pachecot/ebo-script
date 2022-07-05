# EBO Script Extension

This preview release of the "ebo-script" extension adds support for schneider electric ecostruxure building operation scripting language.

Extensions
+ .ebosf - script function
+ .ebosp - script program

## Capabilities
+ Syntax highlighting
+ Bracket matching
+ Code snippets
+ Hover definitions
+ Limited hints, warnings, and errors
+ Limited formatting
+ Code fixes
+ Commands

Fallthru programs with multiple lines should have a comment line with fallthru to prevent warnings of unreferenced lines.

### Limited formatting

Formatting is for the whole document. Trims trailing spaces. Does indentations, fixed at 2 spaces. Increases on lines and control statements loops, if - endif. Adds spacing on operator expressions (-,+,*,/, ..etc). 

### Limited hints, warnings, and errors

 + Duplicate declarations (error)
 + Unused declarations (hint)
 + Undeclared variables or functions (error)
 + Line statements that are not referenced (warning)
 + Goto calls to non-existing lines (error)

### Code Fixes

 + Add declarations for undeclared Functions and Variables.
 + Remove declarations for duplicate and unused Functions and Variables.
 + Change Declaration types  

### Commands

- __ebo-script: Clean Declarations__ - Clean all declarations removing unused and adding missing 

- __ebo-script: Compact Declarations__ - Compact declarations onto a single line

- __ebo-script: Expand Declarations__ - Expand declarations onto individual lines

## References

 + [ecostruxure-building](https://ecostruxure-building-help.se.com/bms/home/index.castle?locale=en-US&productversion=3.1)

## Known Issues


## Release Notes

### 0.10.0

- rewrite checker for better errors  
- formatting fixes for unary +/- and Error line E: 

### 0.9.2

- added ebo.json config file support  
- fix snippet for case
- added snippets for declarations

### 0.9.1

- improve variable list command  
- fix system function parse error

### 0.9.0

- added commands for file list and variable list 
- added checking of entire folder

### 0.8.2

- added settings for declaration formatting 
- minor fixes 

### 0.8.1

- minor fixes 

### 0.8.0

- added new commands
- minor fixes

### 0.7.0

- added code fixes for declaration errors
- added code fixes to change declaration types

### 0.6.0

- better formatting.
- additional error checking

### 0.5.8

- additional error checking
- misc bug fixes

### 0.5.8

- added line continuations.
- misc bug fixes

### 0.5.0

- Initial release.

