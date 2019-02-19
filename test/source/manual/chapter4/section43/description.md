## 4.3 Types of Prerequisites
There are actually two different types of prerequisites understood by GNU make: normal prerequisites such as described in the previous section, and order-only prerequisites. A normal prerequisite makes two statements: first, it imposes an order in which recipes will be invoked: the recipes for all prerequisites of a target will be completed before the recipe for the target is run. Second, it imposes a dependency relationship: if any prerequisite is newer than the target, then the target is considered out-of-date and must be rebuilt.

>     A: B C D
>
> Means that to update A, make should
>
> - Update B, C and D
> - If any of (B, C, D) have changed, A is out-of-date, and its recipe should be run

Normally, this is exactly what you want: if a target’s prerequisite is updated, then the target should also be updated.

Occasionally, however, you have a situation where you want to impose a specific ordering on the rules to be invoked without forcing the target to be updated if one of those rules is executed. In that case, you want to define order-only prerequisites. Order-only prerequisites can be specified by placing a pipe symbol (|) in the prerequisites list: any prerequisites to the left of the pipe symbol are normal; any prerequisites to the right are order-only:

    targets : normal-prerequisites | order-only-prerequisites

> To clarify, given
>
>     A: B C | X Y
> Means that to update A, make should
>
> - Update (B, C, X, Y)
> - If any of (B, C) have changed, A is out-of-date, and its recipe should be run

The normal prerequisites section may of course be empty. Also, you may still declare multiple lines of prerequisites for the same target: they are appended appropriately (normal prerequisites are appended to the list of normal prerequisites; order-only prerequisites are appended to the list of order-only prerequisites).

>     A: | X
>     A: | Y
>     A: B
>     A: C
>
> are identical to
>
>     A: B C | X Y

Note that if you declare the same file to be both a normal and an order-only prerequisite, the normal prerequisite takes precedence (since they have a strict superset of the behavior of an order-only prerequisite).

>     A: B
>     A: | B
>
> are identical to
>
>     A: B

Consider an example where your targets are to be placed in a separate directory, and that directory might not exist before make is run. In this situation, you want the directory to be created before any targets are placed into it but, because the timestamps on directories change whenever a file is added, removed, or renamed, we certainly don’t want to rebuild all the targets whenever the directory’s timestamp changes. 

One way to manage this is with order-only prerequisites: make the directory an order-only prerequisite on all the targets:

    OBJDIR := objdir
    OBJS := $(addprefix $(OBJDIR)/,foo.o bar.o baz.o)
    
    $(OBJDIR)/%.o : %.c
        $(COMPILE.c) $(OUTPUT_OPTION) $<
    
    all: $(OBJS)
    
    $(OBJS): | $(OBJDIR)
    
    $(OBJDIR):
            mkdir $(OBJDIR)

Now the rule to create the objdir directory will be run, if needed, before any ‘.o’ is built, but no ‘.o’ will be built because the objdir directory timestamp changed.

>     # Building foo.o and bar.o:
>     # =========================
>     obj/foo.o: foo.c
>             echo building $@
>             echo. > $@
>     
>     obj/bar.o: bar.c
>             echo building $@
>             echo. > $@
>     
>     # Managing the obj/ directory:
>     #=============================
>     obj/foo.o obj/bar.o: | obj
>
>     obj:
>             echo creating obj
>             mkdir obj
>
> | Files and directories<br>(oldest first)          | Goal | Expected | Comment |
> | :----------------------------------------------: | :--: | :---------------------------------------------: | ---
> | foo.c<br>bar.c                                   | all  | creating obj<br>building obj/foo.o<br>building obj/bar.o| __*Normal:*__ *obj/ is not there, so make creates it before building foo.o and bar.o*
> | obj/<br>foo.c<br>bar.c<br>obj/foo.o<br>obj/bar.o | all  |                    | __*Normal:*__ *obj/ is present, so make doesn't need to create it. Both .o files are up-to-date too*
> | foo.c<br>obj/foo.o<br>bar.c<br>obj/bar.o<br>obj/ | all  |                    | __*Changed:*__ *Normally, everything would need rebuilding because obj/ is newer - but since obj/ is an order-only prerequisite this doesn't trigger a rebuild.*
> | foo.o<br>bar.c<br>obj/bar.o<br>obj/<br>foo.c     | all  | building obj/foo.o | __*Changed:*__ *Building obj/foo.o will update the last-modified timestamp on obj/. Witha normal prerequisite, this would cause bar.c to be rebuilt. - but since obj/ is an order-only prerequisite this doesn't trigger a rebuild.*
