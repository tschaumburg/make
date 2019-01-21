# 4 Writing Rules
A rule appears in the makefile and says when and how to remake certain files, called the rule’s targets (most often only one per rule). It lists the other files that are the prerequisites of the target, and the recipe to use to create or update the target.

The order of rules is not significant, except for determining the default goal: the target for make to consider, if you do not otherwise specify one. The default goal is the target of the first rule in the first makefile. If the first rule has multiple targets, only the first target is taken as the default. There are two exceptions: a target starting with a period is not a default unless it contains one or more slashes, ‘/’, as well; and, a target that defines a pattern rule has no effect on the default goal. (See Defining and Redefining Pattern Rules.)

Therefore, we usually write the makefile so that the first rule is the one for compiling the entire program or all the programs described by the makefile (often with a target called ‘all’). See Arguments to Specify the Goals.

- **Rule Example:**	  	An example explained.
- **Rule Syntax:**	  	General syntax explained.
- **Prerequisite Types:**	  	There are two types of prerequisites.
- **Wildcards:**	  	Using wildcard characters such as ‘*’.
- **Directory Search:**	  	Searching other directories for source files.
- **Phony Targets:**	  	Using a target that is not a real file’s name.
- **Force Targets:**	  	You can use a target without a recipe or prerequisites to mark other targets as phony.
- **Empty Targets:**	  	When only the date matters and the files are empty.
- **Special Targets:**	  	Targets with special built-in meanings.
- **Multiple Targets:**	  	When to make use of several targets in a rule.
- **Multiple Rules:**	  	How to use several rules with the same target.
- **Static Pattern:**	  	Static pattern rules apply to multiple targets and can vary the prerequisites according to the target name.
- **Double-Colon:**	  	How to use a special kind of rule to allow several independent rules for one target.
- **Automatic Prerequisites:**	  	How to automatically generate rules giving prerequisites from source files themselves.
