## 4.1 Rule Example
Here is an example of a rule:

    foo.o : foo.c defs.h       # module for twiddling the frobs
            cc -c -g foo.c

Its target is `foo.o` and its prerequisites are `foo.c` and `defs.h`. It has one command in the recipe: `‘cc -c -g foo.c’`. The recipe starts with a tab to identify it as a recipe.

This rule says two things:

- How to decide whether foo.o is out of date: it is out of date if it does not exist, or if either foo.c or defs.h is more recent than it.
- How to update the file foo.o: by running cc as stated.

The recipe does not explicitly mention defs.h, but we presume that foo.c includes it, and that that is why defs.h was added to the prerequisites.

> ### **Test notes**
> The above is tested by copyig the rule above directly (except that a `echo` is prepended to the recipe, because we don't want to depend on the `cc` compiler being present):
>
> ```makefile
>    foo.o : foo.c defs.h       # module for twiddling the frobs
>            echo cc -c -g foo.c
> ```
>
> Given this Makefile, and the stated requirements that `foo.o` is out of date if 
> - *'...`foo.o` does not exist...'*, or
> - *'...either `foo.c` or `defs.h` is more recent...'*
> 
> and the logical consequence that `foo.o` is up-to-date if
>
> - *`foo.o` exists, and is newer than `defs.h` and `foo.c`*
>
> the following test cases apply:
>
> | Test ID | Files available<br>(oldest first) | Target | Expected output | Comment |
> | :-----: | :-------------------------------: |--------|-----------------|---------|
> | 41/1    | defs.h<br>foo.c                   | foo.o  | cc -c -g foo.c  | *...foo.o does not exist...* 
> | 41/2    | defs.h<br>foo.o<br>foo.c          | foo.o  | cc -c -g foo.c  | *...foo.c is more recent...*
> | 41/3    | foo.c<br>foo.o<br>defs.h          | foo.o  | cc -c -g foo.c  | *...defs.h is more recent...*
> | 41/4    | defs.h<br>foo.c<br>foo.o          | foo.o  |                 | *...foo.o is newest...*
