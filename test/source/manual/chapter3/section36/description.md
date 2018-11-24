3.6 Overriding Part of Another Makefile
Sometimes it is useful to have a makefile that is mostly just like another makefile. You can often use the ‘include’ directive to include one in the other, and add more targets or variable definitions. However, it is invalid for two makefiles to give different recipes for the same target. But there is another way.

In the containing makefile (the one that wants to include the other), you can use a match-anything pattern rule to say that to remake any target that cannot be made from the information in the containing makefile, make should look in another makefile. See Pattern Rules, for more information on pattern rules.

For example, if you have a makefile called Makefile that says how to make the target ‘foo’ (and other targets), you can write a makefile called GNUmakefile that contains:

foo:
        frobnicate > foo

%: force
        @$(MAKE) -f Makefile $@
force: ;
If you say ‘make foo’, make will find GNUmakefile, read it, and see that to make foo, it needs to run the recipe ‘frobnicate > foo’. If you say ‘make bar’, make will find no way to make bar in GNUmakefile, so it will use the recipe from the pattern rule: ‘make -f Makefile bar’. If Makefile provides a rule for updating bar, make will apply the rule. And likewise for any other target that GNUmakefile does not say how to make.

The way this works is that the pattern rule has a pattern of just ‘%’, so it matches any target whatever. The rule specifies a prerequisite force, to guarantee that the recipe will be run even if the target file already exists. We give the force target an empty recipe to prevent make from searching for an implicit rule to build it—otherwise it would apply the same match-anything rule to force itself and create a prerequisite loop!