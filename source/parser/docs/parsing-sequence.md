# Parsing and variable expansion

Makefile variables look deceptively like the classic C-language preprocessor, and it's easy to believe that they - like the C preprocessor - are evaluated before compilation even starts.

The following example proves this wrong - if variables were evaluated and resolved before compilation, make shouldn't have any problems with this:

    DEPENDENCY=program.exe: a.o b.o
    
    # The following *fails* because `make` doesn't recognize it as a
    # dependency declaration:
    $(DEPENDENCY)
        cc -o program.exe a.o b.o

So when *are* variables resolved?

This document answers this question by running experimental Makefiles through GNU make 4.2.1

## Logical Makefile evaluation sequence

For the purposes of this document, the parsing and execution of a Makefile can be split into these activities:

                                                        
                                                        
                                                        
                                     +-------------+        +---------+             +------------+
                                     | Dependency  |        | Target  |             |  Runtime   |
                                +--->| Declaration |------->|  list   |------------>| dependency |
                                |    |   parsing   |---+    | parsing |             | evaluation |   
                                |    +-------------+   |    +---------+             +------------+
                                |                      |
    +-----------------------+   |                      |  (unparsed inline recipe)  +-----------+
    |       Top-level       |---+                      +--------------------------->|  Runtime  |
    |        parsing        |                             (unparsed recipe line)    |  recipe   |
    | (identify line types) |------------------------------------------------------>| execution |
    +-----------------------+                                                       +-----------+

## Top-level parsing

Read the makefile line-by-line, and determines the type of the line: *dependency declaration*, *recipe*, *variable definition* or *directive*:

| Line type                | Starts with...                           |
|--------------------------|------------------------------------------|
| Variable definition line | ``varname = ...``                        |
| Dependency declarations  | ``targetlist: ...``                      |
| Recipe lines             | a ``TAB`` character (`\\t`)              |
| Directive lines          | one of ``VPATH``, ``RECIPEPREFIX``, etc. |

If variables were expanded before top-level  parsing, the following two makefiles would be identical:

    var := run:;echo OK
    $(var)

    var := run:;echo OK

However, the first is rejected, meaning that variables are expanded after top-level parsing.

## Dependency declaration parsing

Splits the line into *target lists* (*targets*, *prerequisites*, *order-only prerequisites*, *target patterns* and *prerequisite patterns*) and possibly an *inline recipe*

    targets: prerequisites | orderonly 
    targets: targetpatterns: prerequisitepatterns | orderonly

If variables were expanded before dependency declarations are parsed, the following makefiles should be identical.

    var := foo;echo OK
    run:$(var)
    foo:

    run:foo;echo OK
    foo:

However, the first makefile fails, meaning that variables are expanded after dependency declaration parsing too.

## Target list parsing

Splits a target list into individual targets, and pattern lists into individual patterns.

## Inline recipe pass-through
:** Seen from make, there isn't much internal structure in a recipe line - it's just a string that's passed on to the system for execution.
 







## Conclusion

                                                        
                                     +-------------+        +----------+     +---------+     +------------+
                                     | Dependency  |        |          |     | Target  |     |  Runtime   |
                                +--->| Declaration |------->| Variable |---->|  list   |---->| dependency |
                                |    |   parsing   |--+     |          |     | parsing |     | evaluation |
                                |    +-------------+  |     +----------+     +---------+     +------------+
                                |                     |
    +-----------------------+   |                     |     +----------+                     +-----------+
    |       Top-level       |---+                     +---->| Variable |-------------------->|  Runtime  |
    |        parsing        |                               |          |                     |  recipe   |
    | (identify line types) |------------------------------>|          |-------------------->| execution |
    +-----------------------+                               +----------+                     +-----------+


We can determine this by running the following `Makefiles` (testing each of the 4 line types):

    LINE:=MYVAR:=OK
    $LINE
    run:;echo ${MYVAR}

    LINE:=run:;echo OK
    $LINE

    LINE:=  echo OK
    run:
    $LINE

    VAR:=VALUE
    LINE:=export VAR
    $LINE

In all cases, `GNU make` fails with

    Makefile:2: *** missing separator.  Stop.

meaning that variable references are resolved *after* line type identification:


### Line structure: rules

At the top level, a rule line is structure following one of these templates:

Again, an experiment will show if variables are expanded before or after the dependency declaration lines are parsed:

    DEP=run:
    $(RUN);echo $@ OK

    DEP:=run:
    $(RUN);echo $@ OK


Each line in a Makefile is structured according to its type - a variable definition is a name and a value part

    varname = varvalue

A dependency declaration is a collection of lists, separated by `:`, `|` or `;`

    targets: prerequisites | orderonly 
    targets: targetpatterns: prerequisitepatterns | orderonly

<table>
<tr><th colspan="2">Structural element</th><th colspan="2">Variable definition</th><th rowspan="2">Character escape</th></tr>
<tr><th>Level</th><th>Structure</th><th>Deferred</th><th>Immediate</th></tr>

<tr><td>File</td><td>VARDEF<br>deferred</td>
    <td>
<pre>X=before
VAR=X=after
${VAR}
run:;echo $X
</pre>
    </td>
    <td>
        <pre>VAR=X:=7
        ${VAR}
        run:;echo $X</pre>
    </td>
</tr>
<tr><td></td><td>VARDEF<br>immediate</td><td>Y</td><td>Z</td></tr>
<tr><td></td><td>Rule</td><td>Y</td><td>Z</td></tr>
<tr><td></td><td>Recipe</td><td>Y</td><td>Z</td></tr>

<tr><td>Line</td><td>X</td><td>Y</td><td>Z</td></tr>
<tr><td></td><td>X</td><td>Y</td><td>Z</td></tr>
<tr><td></td><td>X</td><td>Y</td><td>Z</td></tr>
<tr><td></td><td>X</td><td>Y</td><td>Z</td></tr>

<tr><td>Token</td><td>X</td><td>Y</td><td>Z</td></tr>
<tr><td></td><td>X</td><td>Y</td><td>Z</td></tr>
<tr><td></td><td>X</td><td>Y</td><td>Z</td></tr>
<tr><td></td><td>X</td><td>Y</td><td>Z</td></tr>
</table>
|       Structure        | Vardef   | Vardef
|                        | Deferred | Immediate
| File: immediate vardef | VAR:=X=7
|                        | ${VAR}
|                        | run:;echo $X
|                        |    e
| File: deferred vardef  
| File: dependency
| File: recipe line
| Line