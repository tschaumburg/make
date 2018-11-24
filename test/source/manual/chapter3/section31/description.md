
// 3.1.1 Splitting Long Lines:
// ===========================
// Makefiles use a “line - based” syntax in which the 
// newline character is special and marks the end of 
// a statement.
// 
// However, it is difficult to read lines which are 
// too long to display without wrapping or scrolling.
// So, you can format your makefiles for readability 
// by adding newlines into the middle of a statement: 
// you do this by escaping the internal newlines with 
// a backslash(\) character.
// 
// Outside of recipe lines, backslash / newlines are 
// converted into a single space character. Once that 
// is done, all whitespace around the backslash/newline 
// is condensed into a single space: this includes all 
// whitespace preceding the backslash, all whitespace 
// at the beginning of the line after the backslash / 
// newline, and any consecutive backslash / newline 
// combinations.
// 
// If the.POSIX special target is defined then backslash/ 
// newline handling is modified slightly to conform to 
// POSIX.2: first, whitespace preceding a backslash is 
// not removed and second, consecutive backslash / newlines 
// are not condensed.

