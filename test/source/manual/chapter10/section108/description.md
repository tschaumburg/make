## Implicit Rule Search Algorithm

Here is the procedure make uses for searching for an implicit rule for a target t. This procedure is followed for each double-colon rule with no recipe, for each target of ordinary rules none of which have a recipe, and for each prerequisite that is not the target of any rule. It is also followed recursively for prerequisites that come from implicit rules, in the search for a chain of rules.

Suffix rules are not mentioned in this algorithm because suffix rules are converted to equivalent pattern rules once the makefiles have been read in.

For an archive member target of the form ‘archive(member)’, the following algorithm is run twice, first using the entire target name t, and second using ‘(member)’ as the target t if the first run found no rule.

1. Split t into a directory part, called d, and the rest, called n. For example, if t is ‘src/foo.o’, then d is ‘src/’ and n is ‘foo.o’.

2. Make a list of all the pattern rules one of whose targets matches t or n. If the target pattern contains a slash, it is matched against t; otherwise, against n.

3. If any rule in that list is not a match-anything rule, then remove all non-terminal match-anything rules from the list.

4. Remove from the list all rules with no recipe.

5. For each pattern rule in the list:

    1. Find the stem s, which is the nonempty part of t or n matched by the ‘%’ in the target pattern.

    2. Compute the prerequisite names by substituting s for ‘%’; if the target pattern does not contain a slash, append d to the front of each prerequisite name.

    3. Test whether all the prerequisites exist or ought to exist. (If a file name is mentioned in the makefile as a target or as an explicit prerequisite, then we say it ought to exist.)

        If all prerequisites exist or ought to exist, or there are no prerequisites, then this rule applies.

6. If no pattern rule has been found so far, try harder. For each pattern rule in the list:

    1. If the rule is terminal, ignore it and go on to the next rule.

    2. Compute the prerequisite names as before.

    3. Test whether all the prerequisites exist or ought to exist.

    4. For each prerequisite that does not exist, follow this algorithm recursively to see if the prerequisite can be made by an implicit rule.

    5. If all prerequisites exist, ought to exist, or can be made by implicit rules, then this rule applies.

7. If no implicit rule applies, the rule for .DEFAULT, if any, applies. In that case, give t the same recipe that .DEFAULT has. Otherwise, there is no recipe for t.

Once a rule that applies has been found, for each target pattern of the rule other than the one that matched t or n, the ‘%’ in the pattern is replaced with s and the resultant file name is stored until the recipe to remake the target file t is executed. After the recipe is executed, each of these stored file names are entered into the data base and marked as having been updated and having the same update status as the file t.

When the recipe of a pattern rule is executed for t, the automatic variables are set corresponding to the target and prerequisites. See Automatic Variables.