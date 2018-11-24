2.7 Rules for Cleaning the Directory
Compiling a program is not the only thing you might want to write rules for. Makefiles commonly tell how to do a few other things besides compiling a program: for example, how to delete all the object files and executables so that the directory is ‘clean’.

Here is how we could write a make rule for cleaning our example editor:

clean:
        rm edit $(objects)
In practice, we might want to write the rule in a somewhat more complicated manner to handle unanticipated situations. We would do this:

.PHONY : clean
clean :
        -rm edit $(objects)
This prevents make from getting confused by an actual file called clean and causes it to continue in spite of errors from rm. (See Phony Targets, and Errors in Recipes.)

A rule such as this should not be placed at the beginning of the makefile, because we do not want it to run by default! Thus, in the example makefile, we want the rule for edit, which recompiles the editor, to remain the default goal.

Since clean is not a prerequisite of edit, this rule will not run at all if we give the command ‘make’ with no arguments. In order to make the rule run, we have to type ‘make clean’. See How to Run make.