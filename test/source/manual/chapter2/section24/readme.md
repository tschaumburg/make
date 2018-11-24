## 2.4 Variables Make Makefiles Simpler

In our example, we had to list all the object files twice in
the rule for edit(repeated here):

    edit: main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o
        cc - o edit main.o kbd.o command.o display.o \
        insert.o search.o files.o utils.o

> We'll test this by...
>
> | a | b |
> |---|---|
> | a | b |
> | a | b |

Such duplication is error - prone; if a new object file 
is added to the system, we might add it to one list and 
forget the other.We can eliminate the risk and simplify 
the makefile by using a variable.Variables allow a text 
string to be defined once and substituted in multiple 
places later(see How to Use Variables).

It is standard practice for every makefile to have a variable
named objects, OBJECTS, objs, OBJS, obj, or OBJ which is a list
of all object file names.We would define such a variable objects
with a line like this in the makefile:

    objects = main.o kbd.o command.o display.o \
              insert.o search.o files.o utils.o

Then, each place we want to put a list of the object file names,
we can substitute the variable�s value by writing �$(objects) � 
(see How to Use Variables).
