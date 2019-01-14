%{
const tokens = require("./preprocessor-tokens");
const trim = require("./regex-utils");
this.replaceState = function(state) { this.popState(); this.pushState(state); }
%}

%s INITIAL VARREF_NAME VARDEF VARDEF_NAME VARDEF_TYPE VARDEF_VALUE

safe_name_char     [^\s$:=|+#)}]
escaped_name_char     (?:\\[ \t$:=|+#)}])
variable_name       (?:[^\s$:=|+#)}]|(?:\\[ \t$:=|+#)}]))+  //(?:{safe_name_char}|{escaped_name_char})+


safechar     [^ \t\r\n\s:#|:!?*\\$/]
escapedchar  (?:\\[ \t\r\n\s:#|:!?*\\$/])
namechar     (?:{safechar}|{escapedchar})
spacechar    [ \t\r\n\s}
symbolname   (?:{namechar}+)

separator   [/\\]
basename	{symbolname}
dirname	    {symbolname}|'.'|'..'
path        (?:{separator}*(?:{dirname}{separator}+)*)
filename    (?:{path}?{basename})

spc         [ \t]*
variable	(?:[^\s=:?+!])+
eol         (?:[\r]?[\n])
assignment      (?:'='|':='|'::='|'+='|'?='|'!=')

%%
/*****************************************************************************
 * Initial state:
 * ===============
 * At the beginning of each line, determine the type of line using the regex
 * look-ahead operator (?=...):
 *
 *    'myvariable := ...': any line starting with a non-whitespace and
 *                         containing a non-escaped '=' is a variable 
 *                         definition
 * 
 *    'prog.exe: ...':     any  line starting with a non-whitespace and
 *                         containing a non-escaped ':' is a rule line
 *
 * Each type of line is handled by its own lexer state. This state is
 * responsible for returning to the INITIAL state using popState();
 *
 *****************************************************************************/
<INITIAL>^(?={variable_name}{spc}{assignment})  { this.pushState('VARDEF'); }

/*****************************************************************************
 * Variable definitions:
 * =====================
 * A typical variable definition will look like this:
 * 
 *    'myvariable := my value'
 *
 * where assignment-type operators can be '=' ':=' '::=' '+=' '?=' 'and '!='
 *
 *****************************************************************************/
<VARDEF>                        { this.replaceState('VARDEF_NAME'); return tokens.VARDEF_BEGIN; }

// Variable name:
// --------------
<VARDEF_NAME>^{variable_name}   { this.replaceState('VARDEF_TYPE'); return tokens.VARDEF_NAME; }

// Variable assignment type:
// -------------------------
<VARDEF_TYPE>{spc}{assignment}  { this.replaceState('VARDEF_VALUE'); return tokens.VARDEF_TYPE; }

// Variable definitions:
// ---------------------
<VARDEF_VALUE>[^\r\n\$\\]+      { return tokens.VARDEF_VALUE; }
<VARDEF_VALUE>'\\'[\$\\]        { yytext=yytext.substr(1);                                return tokens.VARDEF_VALUE; }
<VARDEF_VALUE>{eol}             {                          this.popState();               return tokens.EOL}

<VARDEF_VALUE>'${'              {                          this.pushState('VARREF_NAME'); return tokens.VARREF_BRACE; }
<VARDEF_VALUE>'$('              {                          this.pushState('VARREF_NAME'); return tokens.VARREF_PAREN; }
<VARDEF_VALUE>'$'.              {                                                         return tokens.VARREF_SINGLE; }




//-----------------------------------------------------------------
// Variable references:
// --------------------
// The parser stays in the VARREF_NAME state until until 
// a non-name character (including '}' and ')') is reached.
// At this point the parser returns to its original state.
//-----------------------------------------------------------------
<VARREF_NAME>{variable_name}  { yytext=trim.trimEnd(yytext, /[})]\s*$/);                  return tokens.VARREF_NAME}; }
<VARREF_NAME>')'              {                                     this.popState(); return tokens.RPAREN;       }
<VARREF_NAME>'}'              {                                     this.popState(); return tokens.RBRACE;       }
<VARREF_NAME>'lhjk'           {                                                      return tokens.ERROR};       }





// The rest:
// ---------
// ...is just passed through
<INITIAL>.+                    {                            return tokens.TEXT; }
<<EOF>>						{ return tokens.EOF; }



//-----------------------------------------------------------------
// Variable definitions:
// ---------------------
// When a line starting with a valid variable name, followed by one of
// the assignment operators ('=', ':=', '::=', '?=', '+=' and '|='),
// the rest of the line is assigned to the variable.
// Note that variable references and function calls can appear in the
// value.

//-----------------------------------------------------------------
//                               +---------+
//                               | INITIAL |
//                 +-------------| ======= |<------------+
//                 |             |         |             |
//                 |             +---------+             |
//            push |                                     | pop
//                 |                                     |
//                 V                                     |
//       +-----------------------------------------------|------+
//       |         |               VARDEF                |      |
//       | replace |               ======                |      |
//       |         v                                     |      |
//       |    +--------+         +--------+         +--------+  |
//       |    | VARDEF | replace | VARDEF | replace | VARDEF |  |
//       |    |  NAME  |-------->|  TYPE  |-------->|  VALUE |  |
//       |    |        |         |        |         |        |  |
//       |    +--------+         +--------+         +--------+  |
//       |                                                      |
//       +------------------------------------------------------+
//                                                     
