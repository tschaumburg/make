## 4.4 Using Wildcard Characters in File Names
A single file name can specify many files using wildcard characters. The wildcard characters in make are ‘*’, ‘?’ and ‘[…]’, the same as in the Bourne shell. For example, *.c specifies a list of all the files (in the working directory) whose names end in ‘.c’.

The character ‘~’ at the beginning of a file name also has special significance. If alone, or followed by a slash, it represents your home directory. For example ~/bin expands to /home/you/bin. If the ‘~’ is followed by a word, the string represents the home directory of the user named by that word. For example ~john/bin expands to /home/john/bin. On systems which don’t have a home directory for each user (such as MS-DOS or MS-Windows), this functionality can be simulated by setting the environment variable HOME.

Wildcard expansion is performed by make automatically in targets and in prerequisites. In recipes, the shell is responsible for wildcard expansion. In other contexts, wildcard expansion happens only if you request it explicitly with the wildcard function.

The special significance of a wildcard character can be turned off by preceding it with a backslash. Thus, foo\*bar would refer to a specific file whose name consists of ‘foo’, an asterisk, and ‘bar’.

- **Wildcard Examples:**	  	Several examples.
- **Wildcard Pitfall:**	  	Problems to avoid.
- **Wildcard Function:**	  	How to cause wildcard expansion where it does not normally take place.

### 4.4.1 Wildcard Examples
Wildcards can be used in the recipe of a rule, where they are expanded by the shell. For example, here is a rule to delete all the object files:

    clean:
        rm -f *.o

Wildcards are also useful in the prerequisites of a rule. With the following rule in the makefile, ‘make print’ will print all the ‘.c’ files that have changed since the last time you printed them:

    print: *.c
        lpr -p $?
        touch print

This rule uses print as an empty target file; see Empty Target Files to Record Events. (The automatic variable ‘$?’ is used to print only those files that have changed; see Automatic Variables.)

Wildcard expansion does not happen when you define a variable. Thus, if you write this:

    objects = *.o

then the value of the variable objects is the actual string ‘*.o’. However, if you use the value of objects in a target or prerequisite, wildcard expansion will take place there. If you use the value of objects in a recipe, the shell may perform wildcard expansion when the recipe runs. To set objects to the expansion, instead use:

    objects := $(wildcard *.o)

See Wildcard Function.

### 4.4.2 Pitfalls of Using Wildcards
Now here is an example of a naive way of using wildcard expansion, that does not do what you would intend. Suppose you would like to say that the executable file foo is made from all the object files in the directory, and you write this:

    objects = *.o
    
    foo : $(objects)
        cc -o foo $(CFLAGS) $(objects)

The value of objects is the actual string ‘*.o’. Wildcard expansion happens in the rule for foo, so that each existing ‘.o’ file becomes a prerequisite of foo and will be recompiled if necessary.

But what if you delete all the ‘.o’ files? When a wildcard matches no files, it is left as it is, so then foo will depend on the oddly-named file *.o. Since no such file is likely to exist, make will give you an error saying it cannot figure out how to make *.o. This is not what you want!

Actually it is possible to obtain the desired result with wildcard expansion, but you need more sophisticated techniques, including the wildcard function and string substitution. See The Function wildcard.

Microsoft operating systems (MS-DOS and MS-Windows) use backslashes to separate directories in pathnames, like so:

      c:\foo\bar\baz.c

This is equivalent to the Unix-style c:/foo/bar/baz.c (the c: part is the so-called drive letter). When make runs on these systems, it supports backslashes as well as the Unix-style forward slashes in pathnames. However, this support does not include the wildcard expansion, where backslash is a quote character. Therefore, you must use Unix-style slashes in these cases.


### 4.4.3 The Function wildcard
Wildcard expansion happens automatically in rules. But wildcard expansion does not normally take place when a variable is set, or inside the arguments of a function. If you want to do wildcard expansion in such places, you need to use the wildcard function, like this:

    $(wildcard pattern…)

This string, used anywhere in a makefile, is replaced by a space-separated list of names of existing files that match one of the given file name patterns. If no existing file name matches a pattern, then that pattern is omitted from the output of the wildcard function. Note that this is different from how unmatched wildcards behave in rules, where they are used verbatim rather than ignored (see Wildcard Pitfall).

One use of the wildcard function is to get a list of all the C source files in a directory, like this:

    $(wildcard *.c)

We can change the list of C source files into a list of object files by replacing the ‘.c’ suffix with ‘.o’ in the result, like this:

    $(patsubst %.c,%.o,$(wildcard *.c))

(Here we have used another function, patsubst. See Functions for String Substitution and Analysis.)

Thus, a makefile to compile all C source files in the directory and then link them together could be written as follows:

    objects := $(patsubst %.c,%.o,$(wildcard *.c))

    foo : $(objects)
        cc -o foo $(objects)

(This takes advantage of the implicit rule for compiling C programs, so there is no need to write explicit rules for compiling the files. See The Two Flavors of Variables, for an explanation of ‘:=’, which is a variant of ‘=’.)