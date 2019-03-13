### Defining Last-Resort Default Rules

You can define a last-resort implicit rule by writing a terminal match-anything pattern rule with no prerequisites (see Match-Anything Rules). This is just like any other pattern rule; the only thing special about it is that it will match any target. So such a rule’s recipe is used for all targets and prerequisites that have no recipe of their own and for which no other implicit rule applies.

> #### Test case 17:
> 
>     %::
>         echo building $@ using last-resort implicit rule
> 
>     foo1:
>     foo2: bar
>     foo3: bar
>       echo building $@ using explicit rule
> 
>     fiz1: foo1
>     fiz2: foo2
>     fiz3: foo3
>
> Case | Target | Expected output
> -----|--------|-----------------------------------------------
>   a  |  foo1  | building foo1 using last-resort implicit rule
>   b  |  foo2  | building foo2 using last-resort implicit rule
>   c  |  foo3  | building foo3 using explicit rule
>   d  |  fiz1  | building foo1 using last-resort implicit rule
>   e  |  fiz2  | building foo2 using last-resort implicit rule
>   f  |  fiz3  | building foo3 using explicit rule

For example, when testing a makefile, you might not care if the source files contain real data, only that they exist. Then you might do this:

    %::
            touch $@

to cause all the source files needed (as prerequisites) to be created automatically.

You can instead define a recipe to be used for targets for which there are no rules at all, even ones which don’t specify recipes. You do this by writing a rule for the target .DEFAULT. Such a rule’s recipe is used for all prerequisites which do not appear as targets in any explicit rule, and for which no implicit rule applies. Naturally, there is no .DEFAULT rule unless you write one.

If you use .DEFAULT with no recipe or prerequisites:

.DEFAULT:
the recipe previously stored for .DEFAULT is cleared. Then make acts as if you had never defined .DEFAULT at all.

If you do not want a target to get the recipe from a match-anything pattern rule or .DEFAULT, but you also do not want any recipe to be run for the target, you can give it an empty recipe (see Defining Empty Recipes).

You can use a last-resort rule to override part of another makefile. See Overriding Part of Another Makefile.