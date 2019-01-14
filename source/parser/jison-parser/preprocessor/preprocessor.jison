%{
const result = require("./preprocessor-result");
%}

%start makefile



%%
makefile
 : statements EOF
 ;

statements
 : statements EOL statement
 | statement
 ;

statement
 : variable_definition
 | /**/
 ;
 
/****************************************************************************
 * VARIABLE DEFINITION:
 * ====================
 * 
 ****************************************************************************/
variable_definition
 : VARDEF_BEGIN VARDEF_NAME VARDEF_TYPE variable_definition_value 
      { result.defineSimpleVariable(yy, @2, $2, $4.trim()); }
 ;

variable_definition_value
: variable_definition_value variable_definition_item
      { $$ = $1 + $2; }
| /**/
      { $$ = ''; }
;

variable_definition_item: VARDEF_VALUE | variable_reference;



/****************************************************************************
 * VARIABLE REFERENCE:
 * ===================
 * 
 ****************************************************************************/
variable_reference
 : VARREF_BRACE VARREF_NAME RBRACE 
      { $$ = result.getVariableValue(yy, @2, $2); console.error("RETRIEVED '" + $2 + "' = '" + $$ + "'");}
 | VARREF_PAREN VARREF_NAME RPAREN
      { $$ = result.getVariableValue(yy, @2, $2); }
 | VARREF_SINGLE
      { $$ = result.getVariableValue(yy, @1, $1); }
 ;










test
 : test evt
 | /*empty*/
   }
 ;

evt
   : VARREF_PAREN
      {
	      console.error("VARREF_PAREN '" + yytext + "'");
	   }
   | VARREF_BRACE
      {
	      console.error("VARREF_BRACE '" + yytext + "'");
	   }
   | VARREF_NAME
      {
	      console.error("VARREF_NAME '" + yytext + "'");
	   }
   | RBRACE
      {
	      console.error("RBRACE '" + yytext + "'");
	   }
   | RPAREN
      {
	      console.error("RPAREN '" + yytext + "'");
	   }
   | VARREF_SINGLE
      {
	      console.error("VARREF_SINGLE '" + yytext + "'");
	   }
   | VARDEF_BEGIN
      {
	      console.error("VARDEF_BEGIN '" + yytext + "'");
	   }
   | VARDEF_NAME
      {
	      console.error("VARDEF_NAME '" + yytext + "'");
	   }
   | VARDEF_TYPE
      {
	      console.error("VARDEF_TYPE '" + yytext + "'");
	   }
   | VARDEF_VALUE
      {
	      console.error("VARDEF_VALUE '" + yytext + "'");
	   }
   | TEXT
      {
	      console.error("TEXT '" + yytext + "'");
	   }
   | EOL
      {
	      console.error("EOL '" + yytext + "'");
	   }
   | ERROR
      {
	      console.error("ERROR '" + yytext + "'");
	   }
   |  EOF
      {
	      console.error("'EOF' '" + yytext + "'");
	   }
   ;
