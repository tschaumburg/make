## 4.2 Rule Syntax
In general, a rule looks like this:

>    targets : prerequisites
>        recipe
        …
or like this:

    targets : prerequisites ; recipe
        recipe
        …
The *targets* are file names, separated by spaces. Wildcard characters may be used (see Using Wildcard Characters in File Names) and a name of the form a(m) represents member m in archive file a (see Archive Members as Targets). Usually there is only one target per rule, but occasionally there is a reason to have more (see Multiple Targets in a Rule).

> ### **Clarification:**
>
> The statement *"...targets are file names..."* is correct, but glosses over some importants details: some characters must be *escaped* when used in targets, and some file names are reserved/forbidden by the operating system, and should probably be avoided as target names.
>
> &nbsp;
>
> #### Special characters and escaping
> Some characters have *special meaning* which precludes them from being used directly in a target name. 
> 
> For instance you cannot use the (completely valid) Windows filename `log#1.txt` in a makefile:
>
>     log#1.txt: tool.log backend.log
>           echo collect logs...
>
> because `make` would interpret everything after `#` as a comment. Instead, the `'#'` should be *escaped* as `'\#'`: 
>
>     log\#1.txt: tool.log backend.log
>           echo collect logs...
>
> The special characters for targets are listed below, along with their special meaning - and how to escape them.
>
> |   character  |                   Special meaning                     |                                   Example                                          | Use in targets | Use in prerequisites | Use in order-only<br>prerequisites |
> |:------------:|:------------------------------------------------------|:-----------------------------------------------------------------------------------|:---------------|:---------------------|:-----------------------------------|
> |      `:`     | separator between target<br>and prerequisite lists    | `if.c if.h: if.spec`<br>&nbsp;&nbsp;&nbsp;&nbsp;`generator if.spec`                | `\:`           | not possible         | not possible
> |      `;`     | marks the start of an *in-line recipe*                | `%.o: %.c; cc $< -o $@`                                                            | `\;`           | `variable:=\;`       | `variable:=\;`
> |      `#`     | marks the start of an *in-line comment*               | `if.c if.h: if.spec # compile spec`<br>&nbsp;&nbsp;&nbsp;&nbsp;`generator if.spec` | `\#`           |`\#`                  | `\#`
> |      `$`     | marks the start of a *variable reference*             | `prog.exe: $(objfiles)`<br>&nbsp;&nbsp;&nbsp;&nbsp;`cc -o $@ $(objfiles)`          | `$$`           | `$$`                 | `$$`
> |      `|`     | marks the start of *order only* target list           | `prog.exe: $(objfiles) | ./build`<br>&nbsp;&nbsp;&nbsp;&nbsp;`cc -o $@ $(objfiles)`| `|`            | `\|`                 | `|`
> |`' '`<br>*(space)*| Separates targets in a *target list*              | `prog.exe: main.o extensions.o`                                                    |`'\ '`          | `'\ '`               | `'\ '`
> |      `%`     | wildcard symbol in pattern<br>rules                   |`%.o: %.c`<br>&nbsp;&nbsp;&nbsp;&nbsp;`cc $< -o $@`                                 | To use a `%` in a<br>target name<br>(eg. `a%a`), write:<br>`$(subst %,%,a%a)`<br>*or*<br>`variable=\%` |`%`|`%`
> |      `=`     | identifies a line as a *variable asignment*           | &nbsp;&nbsp;&nbsp;&nbsp;`a=b:;echo $@`<br>defines a variable called *`a`* with the value <br>&nbsp;&nbsp;&nbsp;&nbsp;*`b:;echo $@`*<br>*not* a rule for building `a=b`    | variable(`=`)                 | variable(`=`)    
> | | | | |
>
> &nbsp;
>
> #### Valid file/target names
>
> Even with the practical issues of encoding special characters aside, target names are not "just filenames" - there are valid target names that are not legal filenames, and vice versa
>
> For instance `a:k.txt` is a perfectly valid target name, but will not be accepted by Windows as a file name. And conversely, the valid Windows file name `x;y` cannot be entered as a target name in a makefile.
>
> The table below summarizes the naming restrictions - both disallowed characters, reserved names and length restrictions -  for makefile targets, Windows files and Linux files:
>
> |              |   target    | Windows file | Linux file  | npm-make handling |
> | :----------: | :---------: | :----------: | :---------: | :---------------- |
> | char `\`     |   allowed   | not allowed  |             | warning           |
> | char `/`     |   allowed   | not allowed  | not allowed | warning           |
> | char `:`     |   allowed   | not allowed  |             | warning           |
> | char `*`     |   allowed   | not allowed  |             | warning           |
> | char `?`     |   allowed   | not allowed  |             | warning           |
> | char `"`     |   allowed   | not allowed  |             | warning           |
> | char `<`     |   allowed   | not allowed  |             | warning           |
> | char `>`     |   allowed   | not allowed  |             | warning           |
> | char `|`     |   allowed   | not allowed  |             | warning           |
> | char `;`     |   allowed   |   allowed    |             | not allowed       |
> | char `%`     | not allowed |              |             |                   |
> | ASCII 0      | pattern marker<br>*cannot be part of target name* | not allowed  | not allowed | not allowed       |
> | ASCII 1-31   |   allowed   | not allowed  | not allowed | warning           |
> | 'CON'        |   allowed   | not allowed  |             | warning           |
> | 'PRN'        |   allowed   | not allowed  |             | warning           | 
> | 'AUX'        |   allowed   | not allowed  |             | warning           | 
> | 'NUL'        |   allowed   | not allowed  |             | warning           | 
> | 'COM1'       |   allowed   | not allowed  |             | warning           | 
> | 'COM2'       |   allowed   | not allowed  |             | warning           | 
> | 'COM3'       |   allowed   | not allowed  |             | warning           | 
> | 'COM4'       |   allowed   | not allowed  |             | warning           | 
> | 'COM5'       |   allowed   | not allowed  |             | warning           | 
> | 'COM6'       |   allowed   | not allowed  |             | warning           | 
> | 'COM7'       |   allowed   | not allowed  |             | warning           | 
> | 'COM8'       |   allowed   | not allowed  |             | warning           | 
> | 'COM9'       |   allowed   | not allowed  |             | warning           | 
> | 'LPT1'       |   allowed   | not allowed  |             | warning           | 
> | 'LPT2'       |   allowed   | not allowed  |             | warning           | 
> | 'LPT3'       |   allowed   | not allowed  |             | warning           | 
> | 'LPT4'       |   allowed   | not allowed  |             | warning           | 
> | 'LPT5'       |   allowed   | not allowed  |             | warning           | 
> | 'LPT6'       |   allowed   | not allowed  |             | warning           | 
> | 'LPT7'       |   allowed   | not allowed  |             | warning           | 
> | 'LPT8'       |   allowed   | not allowed  |             | warning           | 
> | 'LPT9'       |   allowed   | not allowed  |             | warning           |
> |Case sensitivity| like platform | No | Yes | Rule def: allow rules w/ different case ( but warn)<br> target Match: ignore case (but warn if different)
>
> Note the last column which specifies how `npm-make` should handle a case. *Warning* means that the target name will be accepted *but* `npm-make` will print a warning that the chosen target name may not work on all platform.

> Test each of the cases above, including warnings

The *recipe* lines start with a tab character (or the first character in the value of the .RECIPEPREFIX variable; see Special Variables). The first recipe line may appear on the line after the prerequisites, with a tab character, or may appear on the same line, with a semicolon. Either way, the effect is the same. There are other differences in the syntax of recipes. See Writing Recipes in Rules.
>
>
>
> targets are filenames
> targets are separated by spaces
> wildcards may be used
> one or more targets per rule

> recipe lines start with tab
> recipe lines start with .RECIPEPREFIX

Because dollar signs are used to start make variable references, if you really want a dollar sign in a target or prerequisite you must write two of them, ‘$$’ (see How to Use Variables). If you have enabled secondary expansion (see Secondary Expansion) and you want a literal dollar sign in the prerequisites list, you must actually write four dollar signs (‘$$$$’).

> $$ must be used to get a $
> $$$$ must be used to get a $ w secondary expansion

You may split a long line by inserting a backslash followed by a newline, but this is not required, as make places no limit on the length of a line in a makefile.

> `\` before a newline ignores the newline

A rule tells make two things: when the targets are out of date, and how to update them when necessary.

The criterion for being out of date is specified in terms of the *prerequisites*, which consist of file names separated by spaces. (Wildcards and archive members (see Archives) are allowed here too.) 

> prereqs are file names sep by spc

A target is out of date if it does not exist or if it is older than any of the prerequisites (by comparison of last-modification times). The idea is that the contents of the target file are computed based on information in the prerequisites, so if any of the prerequisites changes, the contents of the existing target file are no longer necessarily valid.

How to update is specified by a recipe. This is one or more lines to be executed by the shell (normally ‘sh’), but with some extra features (see Writing Recipes in Rules).

> test out-of-date logic