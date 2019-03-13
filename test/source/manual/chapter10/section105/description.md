## 10.5 Defining and Redefining Pattern Rules

You define an implicit rule by writing a *pattern rule*. 

A pattern rule looks like an ordinary rule, except that its target contains the character ``'%'`` (exactly one of them). The target is considered a pattern for matching file names; the ``'%'`` can match any nonempty substring, while other characters match only themselves. The prerequisites likewise use ``'%'`` to show how their names relate to the target name.

Thus, a pattern rule ``'%.o : %.c'`` says how to make any file ``stem.o`` from another file ``stem.c``.

Note that expansion using ``'%'`` in pattern rules occurs after any variable or function expansions, which take place when the makefile is read. See How to Use Variables, and Functions for Transforming Text.


### 10.5.1 Introduction to Pattern Rules

A pattern rule contains the character ``'%'`` (exactly one of them) in the target; otherwise, it looks exactly like an ordinary rule. 

The target is a pattern for matching file names; the ``'%'`` matches any nonempty substring, while other characters match only themselves.

For example, ``'%.c'`` as a pattern matches any file name that ends in ``'.c'``. ``'s.%.c'`` as a pattern matches any file name that starts with ``'s.'``, ends in ``'.c'`` and is at least five characters long. (There must be at least one character to match the ``'%'``.) The substring that the ``'%'`` matches is called the stem.

> Test case 1:
> 
> Makefile
>
>     %.c:
>          echo building $@
>
> Case | Goal | Output
> -----|------|--------
> 1a   | a.c  | building a.c
> 1b   | ab.c | building ab.c
> 1c   |a.b.c | building a.b.c
> 1d   | .c   | error



``'%'`` in a prerequisite of a pattern rule stands for the same stem that was matched by the ``'%'`` in the target. 

In order for the pattern rule to apply, its target pattern must match the file name under consideration and all of its prerequisites (after pattern substitution) must name files that exist or can be made. These files become prerequisites of the target.

Thus, a rule of the form

    %.o : %.c ; recipe…

specifies how to make a file n.o, with another file n.c as its prerequisite, provided that n.c exists or can be made.

> Test case 2:
> 
> Makefile
>
>     %.c: %.x
>          echo building $@ from $<
>     a.x: 
>     ab.x: 
>     a.b.c: 
>
> Case | Goal  | Output
> -----|-------|--------
> 2a   | a.c   | building a.c from a.x
> 2b   | ab.c  | building ab.c from ab.x
> 2c   | a.b.c | building a.b.c ab.c from a.b.x
> 2d   | ad.c  | error

There may also be prerequisites that do not use ``'%'``; such a prerequisite attaches to every file made by this pattern rule. These unvarying prerequisites are useful occasionally.

A pattern rule need not have any prerequisites that contain ``'%'``, or in fact any prerequisites at all. Such a rule is effectively a general wildcard. It provides a way to make any file that matches the target pattern. See Last Resort.

> Test case 3:
> 
> makefile
>     %.bar:
>          echo building $@
>
> Test case | Goal | Output
> ----------|------|--------
> 3a | foo.bar | building foo.bar
> 3b | baz.bar | building baz.bar
> 

More than one pattern rule may match a target. In this case make will choose the “best fit” rule. See How Patterns Match.

Pattern rules may have more than one target. Unlike normal rules, this does not act as many different rules with the same prerequisites and recipe. If a pattern rule has multiple targets, make knows that the rule's recipe is responsible for making all of the targets. The recipe is executed only once to make all the targets. When searching for a pattern rule to match a target, the target patterns of a rule other than the one that matches the target in need of a rule are incidental: make worries only about giving a recipe and prerequisites to the file presently in question. However, when this file's recipe is run, the other targets are marked as having been updated themselves.

> Test case 4:
> 
> makefile:
>     implicit: foo.bar foo.baz
>     explicit: foo.whiz foo.bang
>     
>     %.bar %.baz:; echo building $@
>     foo.whiz foo.bang:; echo building $@
>
> Test case |  Goal   | Expected result
> ----------|---------|-------------------
>    4a     |implicit | building foo.bar foo.baz
>    4b     |explicit | building foo.whiz<b>building foo.bang



### 10.5.2 Pattern Rule Examples

Here are some examples of pattern rules actually predefined in make. 

First, the rule that compiles ``'.c'`` files into ``'.o'`` files:

    %.o : %.c
            $(CC) -c $(CFLAGS) $(CPPFLAGS) $< -o $@

defines a rule that can make any file x.o from x.c. 

The recipe uses the automatic variables ``'$@'`` and ``'$<'`` to substitute the names of the target file and the source file in each case where the rule applies (see Automatic Variables).

> Test case 5:
> 
> makefile:
>     CC = echo running cc
>     CFLAGS = -cflags
>     CPPFLAGS = -cppflags
>     foo.c:
>          echo. > foo.c
>
> Goal  | Output
> ------|-------
> foo.o | running cc -cflags -cppflags foo.c -o foo.o

Here is a second built-in rule:

    % :: RCS/%,v
            $(CO) $(COFLAGS) $<

defines a rule that can make any file x whatsoever from a corresponding file x,v in the sub-directory RCS. Since the target is ``'%'``, this rule will apply to any file whatever, provided the appropriate prerequisite file exists. The double colon makes the rule terminal, which means that its prerequisite may not be an intermediate file (see Match-Anything Pattern Rules).

> Test case 6:
> 
> makefile:
>     CO = echo running co
>     COLAGS = -coflags
>     RCS/foo.c,v:
>          echo. > RCS/foo.c,v
>
> Goal  | Output
> ------|-------
> foo.c | running co -coflags RCS/foo.c,v

This pattern rule has two targets:

    %.tab.c %.tab.h: %.y
            bison -d $<

This tells make that the recipe ``'bison -d x.y'`` will make both x.tab.c and x.tab.h. 

If the file foo depends on the files parse.tab.o and scan.o and the file scan.o depends on the file parse.tab.h, when parse.y is changed, the recipe ``'bison -d parse.y'`` will be executed only once, and the prerequisites of both parse.tab.o and scan.o will be satisfied. (Presumably the file parse.tab.o will be recompiled from parse.tab.c and the file scan.o from scan.c, while foo is linked from parse.tab.o, scan.o, and its other prerequisites, and it will execute happily ever after.)

> Test case 7:
>
>     %.tab.c %.tab.h: %.y
>         echo bison -d $<
>    
>     foo: parse.tab.o scan.o
>     
>     scan.o: parse.tab.h
> 
> case | goal | expected output
> ---- | ---- | ----------------
>  7   | foo  | bison -d pparse.y
> 



### 10.5.3 Automatic Variables

Suppose you are writing a pattern rule to compile a ``'.c'`` file into a ``'.o'`` file: how do you write the ``'cc'`` command so that it operates on the right source file name? You cannot write the name in the recipe, because the name is different each time the implicit rule is applied.

What you do is use a special feature of make, the automatic variables. These variables have values computed afresh for each rule that is executed, based on the target and prerequisites of the rule. In this example, you would use ``'$@'`` for the object file name and ``'$<'`` for the source file name.

It's very important that you recognize the limited scope in which automatic variable values are available: they only have values within the recipe. 

In particular, you cannot use them anywhere within the target list of a rule; they have no value there and will expand to the empty string. Also, they cannot be accessed directly within the prerequisite list of a rule. A common mistake is attempting to use $@ within the prerequisites list; this will not work. However, there is a special feature of GNU make, secondary expansion (see Secondary Expansion), which will allow automatic variable values to be used in prerequisite lists.

Here is a table of automatic variables:

**``$@``**: The file name of the target of the rule. If the target is an archive member, then ``'$@'`` is the name of the archive file. In a pattern rule that has multiple targets (see Introduction to Pattern Rules), ``'$@'`` is the name of whichever target caused the rule'``s recipe to be run.

> #### Test case 8a-d:
>
>     foo1 foo2: bar1 bar2
>         echo $@
>     
>     %.bar %.baz: %.foo
>         echo $@
>
> case | goal | expected
> -----|------|----------
>   a  | foo1 |   foo1
>   b  | foo2 |   foo2
>   c  | giz.bar | giz.bar
>   d  | giz.baz | giz.baz

**``$%``**: The target member name, when the target is an archive member. See Archives. For example, if the target is foo.a(bar.o) then ``'**$%'`` is bar.o and ``'$@'`` is foo.a. ``'$%'`` is empty when the target is not an archive member.

**``$<``**: The name of the first prerequisite. If the target got its recipe from an implicit rule, this will be the first prerequisite added by the implicit rule (see Implicit Rules).

> #### Test case 8e-g:
>
>     a b: c d
>         echo $<
>     %.foo: %.bar %.baz
>         echo $<
>     a.foo: a.h
> 
> case | goal | expected
> -----|------|----------
> e | a | c
> f | b | c
> g | a.foo | a.bar

**``$?``**: The names of all the prerequisites that are newer than the target, with spaces between them. For prerequisites which are archive members, only the named member is used (see Archives).

> #### Test case 8h:
>
>     t1 t2: p1 p2 p3
>          echo $?
>
> Case | Targets / prerequisites<br>*(oldest first)* | Goal | <br>Expected output
> ---- | :-----------------------------------------: | ---- | ----------------
>  8h  |  t1 p1 p2 p3 t2 | t1 | |
>  8i  |  t1 p1 p2 p3 t2 | t2 | p1 p2 p3 |
>  8j  |  p1 t2 p2 t1 p3 | t1 | p1 p2 |
>  8k  |  p1 t2 p2 t1 p3 | t2 | p1 |

**``$^``**: The names of all the prerequisites, with spaces between them. For prerequisites which are archive members, only the named member is used (see Archives). A target has only one prerequisite on each other file it depends on, no matter how many times each file is listed as a prerequisite. So if you list a prerequisite more than once for a target, the value of $^ contains just one copy of the name. This list does not contain any of the order-only prerequisites; for those see the ``'$|'`` variable, below.

**``$+``**: This is like ``'$^'``, but prerequisites listed more than once are duplicated in the order they were listed in the makefile. This is primarily useful for use in linking commands where it is meaningful to repeat library file names in a particular order.

> #### Test case 8m-n:
> 
>     t1: p1 p2 p1 p3
>         echo $^
> 
>     t2: p1 p2 p1 p3
>         echo $+
> 
> Case | Goal | Expected output
> ---- | ---- | ---------------
>  m   |  t1  | p1 p2 p1 p3
>  n   |  t2  | p1 p2 p3

**``$|``**: The names of all the order-only prerequisites, with spaces between them.

> #### Test case 8o:
> 
>     t1: | p1 p2 p1 p3
>         echo $|
> 
> Case | Goal | Expected output
> ---- | ---- | ---------------
>  o   |  t1  | p1 p2 p1 p3

**``$*``**: The stem with which an implicit rule matches (see How Patterns Match). If the target is dir/a.foo.b and the target pattern is a.%.b then the stem is dir/foo. The stem is useful for constructing names of related files.

> Test case 8p:
> 
>     a%b:
>         echo $*
> 
> Case |    Goal     | Expected output
> ---- | ----------- | ---------------
>  p   | dir/a.foo.b | dir/foo

In a static pattern rule, the stem is part of the file name that matched the ``'%'`` in the target pattern.

In an explicit rule, there is no stem; so ``'$*'`` cannot be determined in that way. Instead, if the target name ends with a recognized suffix (see Old-Fashioned Suffix Rules), ``'$*'`` is set to the target name minus the suffix. For example, if the target name is ``'foo.c'``, then ``'$*'`` is set to ``'foo'``, since ``'.c'`` is a suffix. GNU make does this bizarre thing only for compatibility with other implementations of make. You should generally avoid using ``'$*'`` except in implicit rules or static pattern rules.

If the target name in an explicit rule does not end with a recognized suffix, ``'$*'`` is set to the empty string for that rule.

``'$?'`` is useful even in explicit rules when you wish to operate on only the prerequisites that have changed. For example, suppose that an archive named lib is supposed to contain copies of several object files. This rule copies just the changed object files into the archive:

    lib: foo.o bar.o lose.o win.o
            ar r lib $?

Of the variables listed above, four have values that are single file names, and three have values that are lists of file names. These seven have variants that get just the file's directory name or just the file name within the directory. The variant variables' names are formed by appending ``'D'`` or ``'F'``, respectively. 

These variants are semi-obsolete in GNU make since the functions dir and notdir can be used to get a similar effect (see Functions for File Names). Note, however, that the ``'D'`` variants all omit the trailing slash which always appears in the output of the dir function. Here is a table of the variants:

**``'$(@D)'``** | The directory part of the file name of the target, with the trailing slash removed. If the value of ``'$@'`` is dir/foo.o then ``'$(@D)'`` is dir. This value is . if ``'$@'`` does not contain a slash.
**``'$(@F)'``** | The file-within-directory part of the file name of the target. If the value of ``'$@'`` is dir/foo.o then ``'$(@F)'`` is foo.o. ``'$(@F)'`` is equivalent to ``'$(notdir $@)'``.

> Test case 8q:
> 
>     targetdir/targetfile.txt: predir1/prefile1.foo predir2/prefile2.bar
>         echo Target dir name: $(@D)
>         echo Target file name: $(@F)
> 
> Case |    Goal     | Expected output
> ---- | ----------- | ---------------
>  q   | targetdir/targetfile.txt | Target dir name: targetdir<br>Target file name: targetfile.txt
> 

**``'$(*D)'``<br>``'$(*F)'``** | The directory part and the file-within-directory part of the stem; dir and foo in this example.

> Test case 8r:
> 
>     a%b:
>         echo Stem dir name: $(@D)
>         echo Stem file name: $(@F)
> 
> Case |    Goal     | Expected output
> ---- | ----------- | ---------------
>  r   | dir/a.foo.b | Stem dir name: dir<br>Stem file name: foo

**``'$(%D)'``<br>``'$(%F)'``** | The directory part and the file-within-directory part of the target archive member name. This makes sense only for archive member targets of the form archive(member) and is useful only when member may contain a directory name. (See Archive Members as Targets.)
**``'$(<D)'``<br>``'$(<F)'``** | The directory part and the file-within-directory part of the first prerequisite.

> Test case 8s:
> 
>     targetdir/targetfile.txt: predir1/prefile1.foo predir2/prefile2.bar
>         echo First prerequisite dir name: $(@D)
>         echo First prerequisite file name: $(@F)
> 
> Case |    Goal     | Expected output
> ---- | ----------- | ---------------
>  s   | targetdir/targetfile.txt | First prerequisite dir name: predir1<br>First prerequisite file name: prefile1.txt
> 

**``'$(^D)'``<br>``'$(^F)'``** | Lists of the directory parts and the file-within-directory parts of all prerequisites.

> Test case 8t:
> 
>     targetdir/targetfile.txt: predir1/prefile1.foo predir2/prefile2.bar predir1/prefile1.foo
>         echo prerequisite dir names: $(^D)
>         echo prerequisite file names: $(^F)
> 
> Case |    Goal     | Expected output
> ---- | ----------- | ---------------
>  t   | targetdir/targetfile.txt | prerequisite dir names: predir1 predir2<br>prerequisite file names: prefile1.foo prefile2.bar

**``'$(+D)'``<br>``'$(+F)'``** | Lists of the directory parts and the file-within-directory parts of all prerequisites, including multiple instances of duplicated prerequisites.

> Test case 8u:
> 
>     targetdir/targetfile.txt: predir1/prefile1.foo predir2/prefile2.bar predir1/prefile1.foo
>         echo prerequisite dir names: $(^D)
>         echo prerequisite file names: $(^F)
> 
> Case |    Goal     | Expected output
> ---- | ----------- | ---------------
>  u   | targetdir/targetfile.txt | prerequisite dir names: predir1 predir2 predir1<br>prerequisite file names: prefile1.foo prefile2.bar prefile1.foo

**``'$(?D)'``<br>``'$(?F)'``** | Lists of the directory parts and the file-within-directory parts of all prerequisites that are newer than the target.

> #### Test case 8w:
>
>     t: dir1/p1 dir2/p2
>          echo dir: ($?D)
>          echo file: ($?F)
>
> Case | Targets / prerequisites<br>*(oldest first)* | Goal | <br>Expected output
> ---- | :-----------------------------------------: | ---- | ----------------
>  8w  |  p1 t1 p2 | t1 | dir: dir2<br>file: p2 |

Note that we use a special stylistic convention when we talk about these automatic variables; we write “the value of ``'$<'``”, rather than “the variable <” as we would write for ordinary variables such as objects and CFLAGS. We think this convention looks more natural in this special case. Please do not assume it has a deep significance; ``'$<'`` refers to the variable named < just as ``'$(CFLAGS)'`` refers to the variable named CFLAGS. You could just as well use ``'$(<)'`` in place of ``'$<'``.

> Test case 9:
> 
> 
> 


### 10.5.4 How Patterns Match

A target pattern is composed of a ``'%'`` between a prefix and a suffix, either or both of which may be empty. The pattern matches a file name only if the file name starts with the prefix and ends with the suffix, without overlap. The text between the prefix and the suffix is called the stem. Thus, when the pattern ``'%.o'`` matches the file name test.o, the stem is ``'test'``. The pattern rule prerequisites are turned into actual file names by substituting the stem for the character ``'%'``. Thus, if in the same example one of the prerequisites is written as ``'%.c'``, it expands to ``'test.c'``.

>     abc%cde: prereq_%
>         echo stem:
>         echo prereq: 
> 
> Case | Goal | Expected output
> ---- | ---- | ---------------
>  9a  | abcmynamecde | stem: myname<br>prereq: prereq_myname
>  9b  | abccde | stem: <br>prereq: prereq_
>  9c  | abcde | error

When the target pattern does not contain a slash (and it usually does not), directory names in the file names are removed from the file name before it is compared with the target prefix and suffix. After the comparison of the file name to the target pattern, the directory names, along with the slash that ends them, are added on to the prerequisite file names generated from the pattern rule's prerequisite patterns and the file name. The directories are ignored only for the purpose of finding an implicit rule to use, not in the application of that rule. Thus, ``'e%t'`` matches the file name src/eat, with ``'src/a'`` as the stem. When prerequisites are turned into file names, the directories from the stem are added at the front, while the rest of the stem is substituted for the ``'%'``. The stem ``'src/a'`` with a prerequisite pattern ``'c%r'`` gives the file name src/car.

>     my.%.foo: your.%.bar
>         echo stem:
>         echo prereq: 
> 
> Case | Goal | Expected output
> ---- | ---- | ---------------
>  9a  | my.hoo.foo | stem: hoo<br>prereq: your.hoo.bar
>  9b  | dir1/my.hoo.foo | stem: dir1/hoo<br>prereq: dir1/your.hoo.bar
>  9b  | dir1/dir2/my.hoo.foo | stem: dir1/dir2/hoo<br>prereq: dir1/dir2/your.hoo.bar

A pattern rule can be used to build a given file only if there is a target pattern that matches the file name, and all prerequisites in that rule either exist or can be built. The rules you write take precedence over those that are built in. Note however, that a rule whose prerequisites actually exist or are mentioned always takes priority over a rule with prerequisites that must be made by chaining other implicit rules.

It is possible that more than one pattern rule will meet these criteria. In that case, make will choose the rule with the shortest stem (that is, the pattern that matches most specifically). If more than one pattern rule has the shortest stem, make will choose the first one found in the makefile.

This algorithm results in more specific rules being preferred over more generic ones; for example:

%.o: %.c
        $(CC) -c $(CFLAGS) $(CPPFLAGS) $< -o $@

%.o : %.f
        $(COMPILE.F) $(OUTPUT_OPTION) $<

lib/%.o: lib/%.c
        $(CC) -fPIC -c $(CFLAGS) $(CPPFLAGS) $< -o $@
Given these rules and asked to build bar.o where both bar.c and bar.f exist, make will choose the first rule and compile bar.c into bar.o. In the same situation where bar.c does not exist, then make will choose the second rule and compile bar.f into bar.o.

> Test case 10:
> 
>     %.o: %.c
>             echo compile C-program $< into $@
>     
>     %.o : %.f
>             echo compile Fortran program $< into $@
>     
>     lib/%.o: lib/%.c
>             echo link $< into $@
> 
> 
>  a | bar.c<br>bar.f| compile C-program bar.c into bar.o<br>
>  b | bar.f| compile Fortran program bar.f into bar.o<br>

If make is asked to build lib/bar.o and both lib/bar.c and lib/bar.f exist, then the third rule will be chosen since the stem for this rule (``'bar'``) is shorter than the stem for the first rule (``'lib/bar'``). If lib/bar.c does not exist then the third rule is not eligible and the second rule will be used, even though the stem is longer.


### 10.5.5 Match-Anything Pattern Rules

When a pattern rule's target is just ``'%'``, it matches any file name whatever. We call these rules match-anything rules. They are very useful, but it can take a lot of time for make to think about them, because it must consider every such rule for each file name listed either as a target or as a prerequisite.

Suppose the makefile mentions foo.c. For this target, make would have to consider making it by linking an object file foo.c.o, or by C compilation-and-linking in one step from foo.c.c, or by Pascal compilation-and-linking from foo.c.p, and many other possibilities.

We know these possibilities are ridiculous since foo.c is a C source file, not an executable. If make did consider these possibilities, it would ultimately reject them, because files such as foo.c.o and foo.c.p would not exist. But these possibilities are so numerous that make would run very slowly if it had to consider them.

To gain speed, we have put various constraints on the way make considers match-anything rules. There are two different constraints that can be applied, and each time you define a match-anything rule you must choose one or the other for that rule.

> Test case 11:
> 
>     %: base.src
>         echo making $@
> 
>     target: base.intermediate
>         echo making $@
>
> |  Goal  | Expected result
> | ------ | ----------------
> | target | error

One choice is to mark the match-anything rule as terminal by defining it with a double colon. When a rule is terminal, it does not apply unless its prerequisites actually exist. Prerequisites that could be made with other implicit rules are not good enough. In other words, no further chaining is allowed beyond a terminal rule.

> Test case 12:
> 
>     %:: base.src
>         echo making $@
> 
>     target: base.intermediate
>         echo making $@
>
> Case |   |   Files    |  Goal  | Expected result
> ---- |---|------------|--------|-----------------
>   a  |   |      -     | target | error
>   b  |   |  base.src  | target | making base.intermediate<br>making target

For example, the built-in implicit rules for extracting sources from RCS and SCCS files are terminal; as a result, if the file foo.c,v does not exist, make will not even consider trying to make it as an intermediate file from foo.c,v.o or from RCS/SCCS/s.foo.c,v. RCS and SCCS files are generally ultimate source files, which should not be remade from any other files; therefore, make can save time by not looking for ways to remake them.

If you do not mark the match-anything rule as terminal, then it is non-terminal. A non-terminal match-anything rule cannot apply to a file name that indicates a specific type of data. A file name indicates a specific type of data if some non-match-anything implicit rule target matches it.

For example, the file name foo.c matches the target for the pattern rule ``'%.c : %.y'`` (the rule to run Yacc). Regardless of whether this rule is actually applicable (which happens only if there is a file foo.y), the fact that its target matches is enough to prevent consideration of any non-terminal match-anything rules for the file foo.c. Thus, make will not even consider trying to make foo.c as an executable file from foo.c.o, foo.c.c, foo.c.p, etc.

> Test case 13:
> 
>     target: target.intermediate
>         echo building $@ from $<
> 
>     %:
>         echo building $@ from match-all rule
>   |  Goal  | Expected result
>   | ------ | ----------------
>   | target | building target.intermediate from match-all rule<br>building target from target.intermediate


> Test case 14:
> 
>     target: target.intermediate
>         echo building $@ from $<
>     
>     %.intermediate: %.src
>         echo building $@ from $<
>         
>     %:
>         echo building $@ from match-all rule
> 
> Case |  Goal  | target.src exists? | Expected output
> -----|--------|--------------------|-----------------
>   a  | target |        yes         | building target.intermediate from match-all rule<br>building target from target.intermediate
>   b  | target |        no          | error

The motivation for this constraint is that non-terminal match-anything rules are used for making files containing specific types of data (such as executable files) and a file name with a recognized suffix indicates some other specific type of data (such as a C source file).

Special built-in dummy pattern rules are provided solely to recognize certain file names so that non-terminal match-anything rules will not be considered. These dummy rules have no prerequisites and no recipes, and they are ignored for all other purposes. For example, the built-in implicit rule

    %.p :

exists to make sure that Pascal source files such as foo.p match a specific target pattern and thereby prevent time from being wasted looking for foo.p.o or foo.p.c.

Dummy pattern rules such as the one for ``'%.p'`` are made for every suffix listed as valid for use in suffix rules (see Old-Fashioned Suffix Rules).


### 10.5.6 Canceling Implicit Rules

You can override a built-in implicit rule (or one you have defined yourself) by defining a new pattern rule with the same target and prerequisites, but a different recipe. When the new rule is defined, the built-in one is replaced. The new rule's position in the sequence of implicit rules is determined by where you write the new rule.

You can cancel a built-in implicit rule by defining a pattern rule with the same target and prerequisites, but no recipe. For example, the following would cancel the rule that runs the assembler:

    %.o : %.s

> Test case 15:
> 
>     %.o: %.src
>         echo building $@ from $<
>
> yes | foo.o | building foo.o from foo.src
> no  | foo.o | error

> Test case 16:
> 
>     %.o: %.src
>         echo building $@ from $<
>
>     %.o: %.src
>
> yes | foo.o | error
> no  | foo.o | error

