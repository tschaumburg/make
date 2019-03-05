## 10.4 Chains of Implicit Rules

Sometimes a file can be made by a sequence of implicit rules. For example, a file n.o could be made from n.y by running first Yacc and then cc. Such a sequence is called a chain.

If the file n.c exists, or is mentioned in the makefile, no special searching is required: make finds that the object file can be made by C compilation from n.c; later on, when considering how to make n.c, the rule for running Yacc is used. Ultimately both n.c and n.o are updated.

However, even if n.c does not exist and is not mentioned, make knows how to envision it as the missing link between n.o and n.y! 

In this case, n.c is called an intermediate file. Once make has decided to use the intermediate file, it is entered in the data base as if it had been mentioned in the makefile, along with the implicit rule that says how to create it.

> ### Case 1: Chains of implicit rules 
> 
> Given a rule chain
>
> ```makefile
>     %.target:       %.intermediate; echo making $@ from $< && touch $@
>     %.intermediate: %.src;          echo making $@ from $< && touch $@
>     clean:                        ; del foo.* && touch foo.src
> ```
>
> Now making `clean` and `foo.target` should print
>
> ```
> making foo.target from foo.intermediate
> making foo.intermediate from foo.src
> ```
>
> and `dir /b foo.*` should list `foo.target` (chaining)

Intermediate files are remade using their rules just like all other files. But intermediate files are treated differently in two ways.

The first difference is what happens if the intermediate file does not exist. If an ordinary file b does not exist, and make considers a target that depends on b, it invariably creates b and then updates the target from b. But if b is an intermediate file, then make can leave well enough alone. It won’t bother updating b, or the ultimate target, unless some prerequisite of b is newer than that target or there is some other reason to update that target.

> ### Case 2: Intermediate skipping
>
> If the target is newer than the prerequisites:
>
> ```
> del foo.*
> touch foo.src
> touch foo.target
> ```
>
> make should skip building the intermediates

The second difference is that if make does create b in order to update something else, it deletes b later on after it is no longer needed. Therefore, an intermediate file which did not exist before make also does not exist after make. make reports the deletion to you by printing a ‘rm -f’ command showing which file it is deleting.

> ### Case 3: Intermediate deletion
>
> and `dir /b foo.intermediate*` should list no matches (intermediate deletion)

Ordinarily, a file cannot be intermediate if it is mentioned in the makefile as a target or prerequisite. However, you can explicitly mark a file as intermediate by listing it as a prerequisite of the special target .INTERMEDIATE. This takes effect even if the file is mentioned explicitly in some other way.

> ### Case 4: Using `.INTERMEDIATE`.

You can prevent automatic deletion of an intermediate file by marking it as a secondary file. To do this, list it as a prerequisite of the special target .SECONDARY. When a file is secondary, make will not create the file merely because it does not already exist, but make does not automatically delete the file. Marking a file as secondary also marks it as intermediate.

> ### Case 5: Intermediate preservation using `.SECONDARY`
>
> Adding
>
> ```
> .SECONDARY: %.intermediate
> ```
> to the makefile should preserve `foo.intermediate`.

You can list the target pattern of an implicit rule (such as ‘%.o’) as a prerequisite of the special target .PRECIOUS to preserve intermediate files made by implicit rules whose target patterns match that file’s name; see Interrupts.

> ### Case 6: Intermediate preservation using `.PRECIOUS`
>
> Adding
>
> ```
> .PRECIOUS: %.target
> ```
> to the makefile should preserve `foo.intermediate`.

A chain can involve more than two implicit rules. For example, it is possible to make a file foo from RCS/foo.y,v by running RCS, Yacc and cc. Then both foo.y and foo.c are intermediate files that are deleted at the end.

> ### Case 7: Multi-chains
> 
> Given a rule chain
>
> ```makefile
>     %.target:        %.intermediate2; echo making $@ from $< && touch $@
>     %.intermediate2: %.intermediate1; echo making $@ from $< && touch $@
>     %.intermediate1: %.src;           echo making $@ from $< && touch $@
>     clean:                          ; del foo.* && touch foo.src
> ```
>
> Now making `clean` and `foo.target` should print
>
> ```
> making foo.target from foo.intermediate2
> making foo.intermediate2 from foo.intermediate1
> making foo.intermediate1 from foo.src
> ```
>
> and `dir /b foo.*` should list `foo.target` (chaining), but no `foo.intermediate*` (intermediate deletion).

No single implicit rule can appear more than once in a chain. This means that make will not even consider such a ridiculous thing as making foo from foo.o.o by running the linker twice. This constraint has the added benefit of preventing any infinite loop in the search for an implicit rule chain.

There are some special implicit rules to optimize certain cases that would otherwise be handled by rule chains. For example, making foo from foo.c could be handled by compiling and linking with separate chained rules, using foo.o as an intermediate file. But what actually happens is that a special rule for this case does the compilation and linking with a single cc command. The optimized rule is used in preference to the step-by-step chain because it comes earlier in the ordering of rules.

> ### Test note: Interactions between implicit intermediates, `.INTERMEDIATE`, `.SECONDARY` and `.PRECIOUS`
>
> To summarize the above: whether a target is subject to intermediate skipping or intermediate deletion is determined by four factors:
> factors: whether it's an intermediate in a chain of implicit rules (an *implicit intermediate*), and whether it has been marked
> with `.INTERMEDIATE` (an *explicit intermediate*), `.SECONDARY` or `.PRECIOUS`. 
>
> ### Case 8: Interactions between implicit intermediates, `.INTERMEDIATE`, `.SECONDARY` and `.PRECIOUS`
>
> For an implicit intermediate, `.INTERMEDIATE`, `.SECONDARY` and `.PRECIOUS` has the following 
> effect on intermediate deletion and skipping:
>
> |   `.INTERMEDIATE`  |     `.SECONDARY`     |   `.PRECIOUS`    | Intermediate deletion | Intermediate skipping
> | ------------------ | -------------------- | ---------------- | --------------------- | ---------------------
> |                    |                      |                  |          yes          |   yes
> |                    |                      | `%.intermediate` |          no           |   yes
> |                    |  `foo.intermediate`  |                  |          no           |   yes
> |                    |  `foo.intermediate`  | `%.intermediate` |          no           |   yes 
> | `foo.intermediate` |                      |                  |          yes          |   yes
> | `foo.intermediate` |                      | `%.intermediate` |          no           |   yes
> | `foo.intermediate` |  `foo.intermediate`  |                  |          no           |   yes
> | `foo.intermediate` |  `foo.intermediate`  | `%.intermediate` |          no           |   yes
> To test the behaviour of implcit intermediates, use the following makefile:
>```makefile
>    %.target:       %.intermediate; echo making $@ from $< && touch $@
>    %.intermediate: %.src;          echo making $@ from $< && touch $@
>
>    skip-clean:                   ; del foo.* && touch foo.src && touch foo.target
>    delete-clean:                   ; del foo.* && touch foo.src
>
>    #.INTERMEDIATE: foo.intermediate
>    #.SECONDARY:    foo.intermediate
>    #.PRECIOUS:     %.intermediate
> ```
> 
> natural intermediates:

xx

>
>   `.INTERMEDIATE`  |     `.SECONDARY`     | `.PRECIOUS` | Intermediate deletion | Intermediate skipping
> ------------------ | -------------------- | ----------- | --------------------- | --------------------- |
>                    |                      |             |          no           |   no
>                    |                      |  `%.target` |          no           |   no
>                    |  `foo.intermediate`  |             |          no           |   yes
>                    |  `foo.intermediate`  |  `%.target` |          no           |   yes
> `foo.intermediate` |                      |             |          yes          |   yes
> `foo.intermediate` |                      |  `%.target` |          no           |   yes
> `foo.intermediate` |  `foo.intermediate`  |             |          no           |   yes
> `foo.intermediate` |  `foo.intermediate`  |  `%.target` |          no           |   yes
