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

- __ebo-script: Generate State Diagrams__ - Creates html file with all the state diagrams. 
    - uses Mermaid diagramming tool [https://mermaid.js.org/]
    - launches the generated file in the default browser

- __ebo-script: Create State Diagram__ - Create Mermaid mmd file for the current script program. 
    - uses program lines and goto statements for the state
    generation.
    - fall thru programs should have a comment with the word `fallthru`    
    - see Mermaid diagramming tool [https://mermaid.js.org/]

## References

 + [ecostruxure-building](https://ecostruxure-building-help.se.com/bms/home/index.castle?locale=en-US&productversion=3.1)

## Known Issues


## Release Notes

### 0.12.0

- bug fixes.
- updated clean declarations for expanded declarations.
    - grouped by input, output, function, locals 
    - group sorted by name
    - allows comments

### 0.11.0

- bug fixes.
- initial update for added language features.

### 0.10.12

- added command `ebo-script: Create State Diagram`

### 0.10.11

- added command `ebo-script: Generate State Diagrams` for generating mermaid state diagrams
- added support missing reserved values: FlashEmpty BackupNow BackupNeeded

### 0.10.10

- fix added support logical operators - & (and), ! (or)

### 0.10.9

- formatting normalize newlines - remove \r\n
- formatting normalize spaces - remove tabs
- fix basedon goto's were not incrementing references

### 0.10.8

- misc fixes for arguments in script functions 

### 0.10.7

- misc fixes for arguments in script functions 

### 0.10.6

- fix for numbers with % 
- fix for decimal numbers starting with . 

### 0.10.5

- error checking 
- parsing 

### 0.10.4

- refactoring 

### 0.10.3

- function fixes 
- fix for numbers with % 

### 0.10.1

- minor updates  

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

