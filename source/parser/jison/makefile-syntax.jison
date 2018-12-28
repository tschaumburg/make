
%{
const builder = require("./builder");
%}

%start makefile

%% /* language grammar */

makefile
 : statements EOF
     { 
        $$.end();
      }
 ;

statements
 : statements rulestatement
     { $1.beginRule($2.targets0, $2.targets1, $2.targets2, $2.targets3, $2.inline_recipe); $$ = $1 }
 | statements recipeline
     { $1.recipeline($2); $$ = $1 }
 | statements variable_definition
     { $1.variableDefinition($2); $$ = $1 }
 | statements emptyline
     { $$ = $1 }
 | /* empty */
     { 
        $$ = new builder.Builder();
      yy.lexer.preprocessor = { expandVariables: function (s) { return $$.expandVariables(s); }};
      }
 ;
 
statement
 : rulestatement
     { console.error("line: " + yytext); }
   | recipeline
   | variable_definition
   | emptyline
 ;

emptyline
 : EOL
 ;

 
/****************************************************************************
 * RULES:
 * ======
 *
 *    Explicit rules (aka "normal rules" or just "rules"):
 *    ----------------------------------------------------
 *         targets: prereqs [|orderonly] [;recipe]
 *
 *    Static pattern rules:
 *    ---------------------
 *         targets: target-patterns: prereq-patterns [|orderonly] [;recipe]
 *
 *    Pattern rules (aka "implicit rules"):
 *    -------------------------------------
 *        target-patterns: prereq-patterns [|orderonly] [;recipe]
 *
 * where
 *   
 *   targets:         a whitespace-separated list of target names
 *   prereqs:         a whitespace-separated list of target names
 *   recipe:          a string that is handed to the shell when the rule
 *                    is triggered
 *   target-pattern:  a target name containing exactly one '%'
 *   target-patterns: a whitespace-separated list of target-patterns
 *   prereq-patterns: a whitespace-separated list of target-patterns
 *
 * Generalized rule syntax:
 * ------------------------
 *      targets0: targets1 [:targets2] [|targets3] [;recipe]
 * meaning
 *    IF ([:targets2] not null) THEN => static pattern rule
 *    ELSE IF (targets0 contains patterns) THEN => patternrule
 *    ELSE => explicit rule
 ***************************************************************************/ 
rulestatement
 : targetlist COLON targetlist targets2 EOL
   {
      $$ = $4;
      $$.targets0 = $1;
      $$.targets1 = $3;
	}
 ;

targets2
  : COLON targetlist targets3
     {
	   console.error("COLON_TARGETS = '" + $2 + "'");
      $$ = $3;
      $$.targets2 = $2;
	 }
   | targets3
     {
      $$ = $1;
      $$.targets2 = null;
	 }
 ;

targets3
  : PIPE targetlist inline_recipe_definition
     {
	   console.error("PIPE_TARGETS = '" + $2 + "'");
      $$ = $3;
      $$.targets3 = $2;
	 }
   | inline_recipe_definition
     {
      $$ = $1;
      $$.targets3 = null;
	 }
 ;

inline_recipe_definition
  : SEMICOLON INLINE_RECIPE
    {
	   console.error("INLINE_RECIPE = '" + $2 + "'");
      $$ = {};
      $$.inline_recipe = $2;
	 }
   | /* empty */
    {
      $$ = {};
      $$.inline_recipe = null;
	 }
 ;

targetlist
  : targetlist TARGET
     {
	   console.error("TARGET = '" + $1 + "'");
      $$.push(new builder.TargetName(@2, $2));
	 }
   | /* empty */
     {
      $$ = [];
	 }
 ;


/****************************************************************************
 * VARIABLE DEFINITIONS:
 * =====================
 *
 ***************************************************************************/ 
variable_definition
 : inline_variable_definition
   | multiline_variable_definition
 ;

inline_variable_definition
 : VARIABLE_SET VARIABLE_VALUE
 ;

multiline_variable_definition
 : MULTILINE_VARIABLE_SET MULTILINE_VARIABLE_VALUE MULTILINE_VARIABLE_END
 ;

 
/*********************************************
 * RECIPES:
 * ========
 * 
 * 
 *********************************************/
optional_recipes
 : recipes
   | /* empty */
      { $$ = []; }
 ;
 
 recipes
 : recipes RECIPE_LINE
     { $1.push($2); $$ = $1 }
 | RECIPE_LINE
     { $$ = [$1] }
 ;
/*********************************************
 * ONE-LINE VARIABLE DEFINITIONS:
 * ============================== 
 *  variable = ....
 *  variable ?= ....
 *  variable := ....
 *  variable ::= ....
 *********************************************/
test : init dotest;

dotest
 : evt
   | dotest evt
 ;

init:
   {
      yy.lexer.preprocessor = { expandVariables: function (s) { return "value_of_" + s; }}
   }
;
 
evt
 :  INLINE_RECIPE
      {
	     console.error("INLINE_RECIPE: '" + yytext + "'");
	  }
   |TARGET
      {
	     console.error("TARGET: '" + yytext + "'");
	  }
   |RULESTART
      {
	     console.error("RULESTART: '" + yytext + "'");
	  }
   |COLON
      {
	     console.error("COLON: '" + yytext + "'");
	  }
   |SEMICOLON
      {
	     console.error("SEMICOLON: '" + yytext + "'");
	  }
   |PIPE
      {
	     console.error("PIPE: '" + yytext + "'");
	  }
   |COLON_TARGETS
      {
	     console.error("COLON_TARGETS: '" + yytext + "'");
	  }
   |TARGETS
      {
	     console.error("TARGETS: '" + yytext + "'");
	  }
   |PIPE_TARGETS
      {
	     console.error("PIPE_TARGETS: '" + yytext + "'");
	  }
   |RECIPE_LINE
      {
	     console.error("RECIPE_LINE: '" + yytext + "'");
	  }
   |EOL
      {
	     console.error("EOL: '" + yytext + "'");
	  }
   |EOF
      {
	     console.error("EOF: '" + yytext + "'");
	  }
   |SPC
      {
	     console.error("SPC: '" + yytext + "'");
	  }
   |VARIABLE_SET
      {
	     console.error("VARIABLE_SET: '" + yytext + "'");
	  }
   |VARIABLE_VALUE
      {
	     console.error("VARIABLE_VALUE: '" + yytext + "'");
	  }
   |MULTILINE_VARIABLE_SET
      {
	     console.error("MULTILINE_VARIABLE_SET: '" + yytext + "'");
	  }
   |MULTILINE_VARIABLE_VALUE
      {
	     console.error("MULTILINE_VARIABLE_VALUE: '" + yytext + "'");
	  }
   |MULTILINE_VARIABLE_END
      {
	     console.error("MULTILINE_VARIABLE_END: '" + yytext + "'");
	  }
 ;
