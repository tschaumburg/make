# Parsing target names

Target names are used in various positions in a *rule* in a Makefile:

    foo.exe: foo.c
        cc foo.c -o foo.exe

 Because of this context, not any character can be used in a target name. For instance, if we allowed `:` in target names, we could write this in a Makefile:

     a:b:c
         ...

But would that mean that file `a:b` could be made from `c` - or that `a` could be made from `b:c`?

## Disambiguation

To fix this ambiguity, the colon can be *escaped*:

    a\:b:c
         ...

or put in a *variable*:

    colon=:
    a$(colon)b:c
         ...

In a better world, `make` would list *one* set of reserved characters, and *one* way to reference them (eg. "*...the characters ':', ';' and '#' must be escaped using '\\'...")


Instead, the reserved characters, and how to escape them, depends on the context. The remainder of this document will list these contexts.

## Reserved characters by context

Target names appear in 5 different contexts in a rule

In order to correctlyp

The purpose of a Makefile is to tell `make` how one *target* can be built from another.

Targets are usually just *file names* that appear in *rules* (eg. ``foo.exe: source/foo.c; cc foo.c -o foo.exe`` tells how `foo.exe` can be built from `foo.c`). 

This naturally make it important that any

targets can just be abstract names (such as `all` or `clean`), but such abstracttargets o

In a makefile, targets appear in *rules*

## Code

// Target list:
// -------------
// A target list is a space-separated list of target names,
// with the following restrictions on characters:
// 
//     characters requiring escapes: ':' ';' '#' ' '
//     characters requiring variable: '%' '='
//     characters not allowed:       '\r' '\n' 0x00
//
// This gives the following regex for a targetlist:
// 
//     (?:[^:# \r\n%=0x00]|(?:\\[:;# ]))+
//
xtargets (?:[^:;#\r\n%=0x00]|(?:\\[:;# ]))*

// Target pattern list:
// --------------------
// 
//     characters requiring escapes: ':' ';' '#' ' '
//     characters requiring variable: '='
//     characters not allowed:       '\r' '\n' 0x00
//
// This gives the following regex for a target pattern list:
// 
//     (?:[^:;#\r\n=0x00]|(?:\\[:;# ]))+
//
xtargetpatterns (?:[^:;#\r\n=0x00]|(?:\\[:;# ]))+

// Prerequisite list:
// -------------------
// 
//     characters requiring escapes: '|' '#' ' '
//     characters requiring variable: '='
//     characters not allowed:       ':' '\r' '\n' 0x00
//
// This gives the following regex for a targetlist:
// 
//     [^|# =:\r\n0x00]|(?:\\[|# ])
//
xprerequisites (?:[^|#=:\r\n0x00]|(?:\\[|# ]))*

xprereqpatterns (?:[^|#=:\r\n0x00]|(?:\\[|# ]))*

// Order-only list:
// -------------------
// 
//     characters requiring escapes: '|' '#' ' '
//     characters requiring variable: '='
//     characters not allowed:       ':' '\r' '\n' 0x00
//
// This gives the following regex for a targetlist:
// 
//     [^#=:\r\n0x00]|(?:\\[# ])
//
xorderonlies (?:[^#=:\r\n0x00]|(?:\\[# ]))*

