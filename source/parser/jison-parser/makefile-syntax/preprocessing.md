
// Line-continuation:
// ==================
// Gnu manual, section 3.1.1:
//
//   "Outside of recipe lines, backslash/newlines are converted
//    into a single space character. Once that is done, all
//    whitespace around the backslash/newline is condensed into
//    a single space: this includes all whitespace preceding the
//    backslash, all whitespace at the beginning of the line
//    after the backslash/newline, and any consecutive backslash/
//    newline combinations."
//
//
// Gnu manual, section 5.1.1:
//
//   "One of the few ways in which make does interpret recipes 
//    is checking for a backslash just before the newline. As in 
//    normal makefile syntax, a single logical recipe line can 
//    be split into multiple physical lines in the makefile by 
//    placing a backslash before each newline. A sequence of lines 
//    like this is considered a single recipe line, and one 
//    instance of the shell will be invoked to run it.
//    
//    However, in contrast to how they are treated in other places 
//    in a makefile (see Splitting Long Lines), backslash/newline 
//    pairs are not removed from the recipe. Both the backslash 
//    and the newline characters are preserved and passed to the 
//    shell. How the backslash/newline is interpreted depends on 
//    your shell. If the first character of the next line after 
//    the backslash/newline is the recipe prefix character (a tab 
//    by default; see Special Variables), then that character (and 
//    only that character) is removed. Whitespace is never added 
//    to the recipe.
//
// Below this "one rule for recipes, another for everything else"
// is implemented by specifying the <RECIPE_LINE> start condition first,
// which makes it take precedence (because the jison-lex "flex"
// setting is switched off)
