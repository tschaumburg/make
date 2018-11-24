## 2.2 A Simple Makefile

<style type="text/css"> @import url("../../testnote.css")  </style>

Here is a straightforward makefile that describes the way an executable file called edit depends on eight object files which, in turn, depend on eight C source and three header files.

In this example, all the C files include defs.h, but only those defining editing commands include command.h, and only low level files that change the editor buffer include buffer.h.

```
edit : main.o kbd.o command.o display.o \
       insert.o search.o files.o utils.o
        cc -o edit main.o kbd.o command.o display.o \
                   insert.o search.o files.o utils.o

main.o : main.c defs.h
        cc -c main.c
kbd.o : kbd.c defs.h command.h
        cc -c kbd.c
command.o : command.c defs.h command.h
        cc -c command.c
display.o : display.c defs.h buffer.h
        cc -c display.c
insert.o : insert.c defs.h buffer.h
        cc -c insert.c
search.o : search.c defs.h buffer.h
        cc -c search.c
files.o : files.c defs.h buffer.h command.h
        cc -c files.c
utils.o : utils.c defs.h
        cc -c utils.c
clean :
        rm edit main.o kbd.o command.o display.o \
           insert.o search.o files.o utils.o
```

We split each long line into two lines using backslash/newline; this is like using one long line, but is easier to read. See Splitting Long Lines.

<div class="testnote" data-title="Test case 22A">
</div>

To use this makefile to create the executable file called edit, type:

    make

To use this makefile to delete the executable file and all the object files from the directory, type:

    make clean

In the example makefile, the targets include the executable file `edit`, and the object files `main.o` and `kbd.o`. The prerequisites are files such as `main.c` and `defs.h`. In fact, each `.o` file is both a target and a prerequisite. Recipes include `cc -c main.c` and `cc -c kbd.c`.

When a target is a file, it needs to be recompiled or relinked if any of its prerequisites change. In addition, any prerequisites that are themselves automatically generated should be updated first. In this example, edit depends on each of the eight object files; the object file main.o depends on the source file main.c and on the header file defs.h.

A recipe may follow each line that contains a target and prerequisites. These recipes say how to update the target file. A tab character (or whatever character is specified by the .RECIPEPREFIX variable; see Special Variables) must come at the beginning of every line in the recipe to distinguish recipes from other lines in the makefile. (Bear in mind that make does not know anything about how the recipes work. It is up to you to supply recipes that will update the target file properly. All make does is execute the recipe you have specified when the target file needs to be updated.)

The target `clean` is not a file, but merely the name of an action. Since you normally do not want to carry out the actions in this rule, `clean` is not a prerequisite of any other rule. Consequently, make never does anything with it unless you tell it specifically. Note that this rule not only is not a prerequisite, it also does not have any prerequisites, so the only purpose of the rule is to run the specified recipe. Targets that do not refer to files but are just actions are called phony targets. See Phony Targets, for information about this kind of target. See Errors in Recipes, to see how to cause make to ignore errors from rm or any other command.

