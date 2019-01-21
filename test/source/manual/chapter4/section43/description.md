## 4.3 Types of Prerequisites
There are actually two different types of prerequisites understood by GNU make: normal prerequisites such as described in the previous section, and order-only prerequisites. A normal prerequisite makes two statements: first, it imposes an order in which recipes will be invoked: the recipes for all prerequisites of a target will be completed before the recipe for the target is run. Second, it imposes a dependency relationship: if any prerequisite is newer than the target, then the target is considered out-of-date and must be rebuilt.

Normally, this is exactly what you want: if a target’s prerequisite is updated, then the target should also be updated.

Occasionally, however, you have a situation where you want to impose a specific ordering on the rules to be invoked without forcing the target to be updated if one of those rules is executed. In that case, you want to define order-only prerequisites. Order-only prerequisites can be specified by placing a pipe symbol (|) in the prerequisites list: any prerequisites to the left of the pipe symbol are normal; any prerequisites to the right are order-only:

    targets : normal-prerequisites | order-only-prerequisites
The normal prerequisites section may of course be empty. Also, you may still declare multiple lines of prerequisites for the same target: they are appended appropriately (normal prerequisites are appended to the list of normal prerequisites; order-only prerequisites are appended to the list of order-only prerequisites). Note that if you declare the same file to be both a normal and an order-only prerequisite, the normal prerequisite takes precedence (since they have a strict superset of the behavior of an order-only prerequisite).

Consider an example where your targets are to be placed in a separate directory, and that directory might not exist before make is run. In this situation, you want the directory to be created before any targets are placed into it but, because the timestamps on directories change whenever a file is added, removed, or renamed, we certainly don’t want to rebuild all the targets whenever the directory’s timestamp changes. One way to manage this is with order-only prerequisites: make the directory an order-only prerequisite on all the targets:

    OBJDIR := objdir
    OBJS := $(addprefix $(OBJDIR)/,foo.o bar.o baz.o)
    
    $(OBJDIR)/%.o : %.c
        $(COMPILE.c) $(OUTPUT_OPTION) $<
    
    all: $(OBJS)
    
    $(OBJS): | $(OBJDIR)
    
    $(OBJDIR):
            mkdir $(OBJDIR)

Now the rule to create the objdir directory will be run, if needed, before any ‘.o’ is built, but no ‘.o’ will be built because the objdir directory timestamp changed.