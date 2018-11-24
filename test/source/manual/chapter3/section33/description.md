
// 3.3 Including Other Makefiles:
// ==============================
// The include directive tells make to suspend reading 
// the current makefile and read one or more other 
// makefiles before continuing. The directive is a line 
// in the makefile that looks like this:
// 
//    include filenames…
// 
// filenames can contain shell file name patterns.
// 
//* case 1:
//* 
//* Makefile:
//* ==========
//*    first:
//*       echo first
//*    second:
//*       echo second
//*    third:
//*       echo third
//* 
//*    run: first
//*    include Makefile2
//*    run: third
//* 
//* Makefile2:
//* ==========
//*    run: second
//*
// If filenames is empty, nothing is included and no
// error is printed.
// 
// 
//* case 2:
//* 
//* Makefile:
//* ==========
//* include
//* run:
//*    echo OK
// 
// 
// Extra spaces are allowed and ignored at the beginning
// of the line, but the first character must not be a 
// tab (or the value of .RECIPEPREFIX) —if the line begins 
// with a tab, it will be considered a recipe line.
// Whitespace is required between include and the file 
// names, and between file names; extra whitespace is 
// ignored there and at the end of the directive.
// 
//* case 3:
//* 
// A comment starting with ‘#’ is allowed at the end of 
// the line.
// 
//* case 4:
//* 
// If the file names contain any variable or function 
// references, they are expanded.See How to Use Variables.
// 
// For example, if you have three.mk files, a.mk, b.mk, 
// and c.mk, and $(bar) expands to bish bash, then the 
// following expression
// 
//    include foo *.mk $(bar)
// 
// is equivalent to
// 
//    include foo a.mk b.mk c.mk bish bash
// 
// 
//* case 5:
//* 
//* makefile
//*    bar = bish bash
//*    include foo *.mk $(bar)
//* 
//* expected
//*   npm-make run
//*   foo
//*   a
//*   b
//*   c
//*   bish
//*   bash
//
// 
// When make processes an include directive, it suspends
// reading of the containing makefile and reads from each 
// listed file in turn.When that is finished, make resumes 
// reading the makefile in which the directive appears.
//* 
//* case 6:
//* 
//*    .
//*    ./sub
//*    .
//* 
//* 
//* 
// If the specified name does not start with a slash, and the
// file is not found in the current directory, several other 
// directories are searched.
// 
// First, any directories you have 
// specified with the ‘-I’ or ‘--include - dir’ option are 
// searched(see Summary of Options).

//* case 7:
//* 
// 
//* npm-make                     Makefile
//*                              Makefile2
//* npm-make -I sub1
//*                              sub1/Makefile2
//* npm-make --include sub2  =>  Makefile
//*                              sub2/Makefile2
//* npm-make -dir sub3       =>  Makefile
//*                              sub3/Makefile2
//
// If an included makefile cannot be found in any of these 
// directories, a warning message is generated..
// 
//* 
//* 
//* 
//* 
//* 
// Only after it has tried to find a way to remake a makefile
// and failed, will make diagnose the missing makefile as a 
// fatal error.
//* 
//* 
//* 
//* 
//* 

// If you want make to simply ignore a makefile which does 
// not exist or cannot be remade, with no error message, 
// use the - include directive instead of include, like 
// this:

//    -include filenames…
// 
// This acts like include in every way except that there 
// is no error(not even a warning) if any of the filenames
// (or any prerequisites of any of the filenames) do not 
// exist or cannot be remade.
//* 
//* //* case 9:
//* 

//* 
//* 
//* 
//* 
//* 

// For compatibility with some other make implementations, 
// sinclude is another name for -include.

//    Footnotes
//    (1) GNU Make compiled for MS-DOS and MS-Windows behaves 
//        as if prefix has been defined to be the root of the 
//        DJGPP tree hierarchy.


