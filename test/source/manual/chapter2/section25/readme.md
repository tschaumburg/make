## 2.5 Letting make Deduce the Recipes

It is not necessary to spell out the recipes for compiling the individual C source files, because make can figure them out: it has an implicit rule for updating a ‘.o’ file from a correspondingly named ‘.c’ file using a ‘cc -c’ command. For example, it will use the recipe ‘cc -c main.c -o main.o’ to compile main.c into main.o. We can therefore omit the recipes from the rules for the object files. See Using Implicit Rules.

When a ‘.c’ file is used automatically in this way, it is also automatically added to the list of prerequisites. We can therefore omit the ‘.c’ files from the prerequisites, provided we omit the recipe.

Here is the entire example, with both of these changes, and a variable objects as suggested above:

```
objects = main.o kbd.o command.o display.o \
          insert.o search.o files.o utils.o

edit : $(objects)
        cc -o edit $(objects)

main.o : defs.h
kbd.o : defs.h command.h
command.o : defs.h command.h
display.o : defs.h buffer.h
insert.o : defs.h buffer.h
search.o : defs.h buffer.h
files.o : defs.h buffer.h command.h
utils.o : defs.h

.PHONY : clean
clean :
        rm edit $(objects)
```

This is how we would write the makefile in actual practice. (The complications associated with ‘clean’ are described elsewhere. See Phony Targets, and Errors in Recipes.)

Because implicit rules are so convenient, they are important. You will see them used frequently.