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

Fallthru programs with multiple lines should have a comment line with fallthru to prevent warnings of unreferenced lines.

### Limited formatting

Formatting is for the whole document. Trims trailing spaces. Does indentations, fixed at 2 spaces. Increases on lines and control statements loops, if - endif. Adds spacing on operator expressions (-,+,*,/, ..etc). 

### Limited hints, warnings, and errors

 + Duplicate declarations (error)
 + Unused declarations (hint)
 + Undeclared variables or functions (error)
 + Line statements that are not referenced (warning)
 + Goto calls to non-existing lines (error)

## References

 + [ecostruxure-building](https://ecostruxure-building-help.se.com/bms/home/index.castle?locale=en-US&productversion=3.1)

## Known Issues


## Release Notes

Users appreciate release notes as you update your extension.

### 0.5.0

Initial release.

