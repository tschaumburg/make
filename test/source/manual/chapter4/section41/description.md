## 4.1 Rule Example
Here is an example of a rule:

    foo.o : foo.c defs.h       # module for twiddling the frobs
            cc -c -g foo.c
Its target is foo.o and its prerequisites are foo.c and defs.h. It has one command in the recipe: ‘cc -c -g foo.c’. The recipe starts with a tab to identify it as a recipe.

This rule says two things:

- How to decide whether foo.o is out of date: it is out of date if it does not exist, or if either foo.c or defs.h is more recent than it.
- How to update the file foo.o: by running cc as stated.

The recipe does not explicitly mention defs.h, but we presume that foo.c includes it, and that that is why defs.h was added to the prerequisites.