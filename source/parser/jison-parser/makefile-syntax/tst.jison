
%{
const result = require("../../result");
const resultb = require("./makefile-syntax-result");
%}

%start makefile

%% /* language grammar */

makefile
 : statements EOF2
     { 
        resultb.end(yy);
      }
 ;

statement
 : rulestatement        { resultb.startRule(yy, @1, $1); }
 | RECIPE_LINE          { resultb.recipeLine(yy, @1, $1); }
 | INCLUDE              { resultb.indclude(yy, @1, $1); }
 | variable_definition  { resultb.defineVariable(yy, @1, $1); }
 | emptyline
 ;
 
statements
 : statements EOL statement
 | statement
 ;

emptyline
 : /* empty */
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
/**
   Returns:
*     {
*        targets0: [ 
*           { 
*              targetName: "foo", 
*              location: {line: 1, col: 1} 
*           }, 
*           { 
*              targetName: "bar", 
*              location: {line: 1, col: 5} 
*           }
*        ]
*        targets1: [ -do- ],
*        targets2: [ -do- ],
*        targets3: [ -do- ],
*        irecipe:  "echo 'making foo and bar'"
*     }
*/
rulestatement
 : RULESTART targetlist COLON targetlist targets2 
   {
      $$ = {};
      $$.targets0 = $2;
      $$.targets1 = $4;
      $$.targets2 = $5.targets2;
      $$.targets3 = $5.targets3;
      $$.irecipe = $5.irecipe;
	}
 ;

targets2
  : COLON targetlist targets3
     {
      $$ = {};
      $$.targets2 = $2;
      $$.targets3 = $3.targets3;
      $$.irecipe = $3.irecipe;
	 }
   | targets3
     {
      $$ = {};
      $$.targets2 = [];
      $$.targets3 = $1.targets3;
      $$.irecipe = $1.irecipe;
 	 }
 ;

targets3
  : PIPE targetlist inline_recipe_definition
     {
      $$ = {};
      $$.irecipe = $3;
      $$.targets3 = $2;
	 }
   | inline_recipe_definition
     {
      $$ = {};
      $$.irecipe = $1;
      $$.targets3 = [];
	 }
 ;

targetlist
  : targetlist TARGET
     {
      $$.push({ location: @2, targetName: $2.trim() });
	 }
   | /* empty */
     {
      $$ = [];
	 }
 ;

inline_recipe_definition
  : SEMICOLON INLINE_RECIPE
    {
	   console.error("INLINE_RECIPE = '" + $2 + "'");
      $$ = $2;
	 }
   | /* empty */
    {
      $$ = "";
	 }
 ;


/****************************************************************************
 * VARIABLE DEFINITIONS:
 * =====================
 *
 ***************************************************************************/ 
variable_definition
 : inline_variable_definition    { $$ = $1; }
 | multiline_variable_definition { $$ = $1; }
 ;

inline_variable_definition
 : VARIABLE_SET_SIMPLE VARIABLE_VALUE
   {
      $$ = { kind: 'simple', name: $1, value: $2 }
   }
 | VARIABLE_SET_RECURSIVE VARIABLE_VALUE
   {
      $$ = { kind: 'recursive', name: $1, value: $2 }
   }
 | VARIABLE_SET_APPEND VARIABLE_VALUE
   {
      $$ = { kind: 'append', name: $1, value: $2 }
   }
 | VARIABLE_SET_CONDITIONAL VARIABLE_VALUE
   {
      $$ = { kind: 'conditional', name: $1, value: $2 }
   }
 | VARIABLE_SET_SHELL VARIABLE_VALUE
   {
      $$ = { kind: 'shell', name: $1, value: $2 }
   }
 ;

multiline_variable_definition
 : MULTILINE_VARIABLE_SET_SIMPLE MULTILINE_VARIABLE_VALUE MULTILINE_VARIABLE_END
   {
      $$ = { kind: 'simple', name: $1, value: $2 }
   }
 | MULTILINE_VARIABLE_SET_RECURSIVE MULTILINE_VARIABLE_VALUE MULTILINE_VARIABLE_END
   {
      $$ = { kind: 'recursive', name: $1, value: $2 }
   }
 | MULTILINE_VARIABLE_SET_APPEND MULTILINE_VARIABLE_VALUE MULTILINE_VARIABLE_END
   {
      $$ = { kind: 'append', name: $1, value: $2 }
   }
 | MULTILINE_VARIABLE_SET_CONDITIONAL MULTILINE_VARIABLE_VALUE MULTILINE_VARIABLE_END
   {
      $$ = { kind: 'conditional', name: $1, value: $2 }
   }
 | MULTILINE_VARIABLE_SET_SHELL MULTILINE_VARIABLE_VALUE MULTILINE_VARIABLE_END
   {
      $$ = { kind: 'shell', name: $1, value: $2 }
   }
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
test : dotest;

dotest
 : dotest evt
 | /*empty*/
   {
      $$ = 123;
      //console.error("REGISTERING");
      yy.preprocessor = { expandVariables: function (s) { console.error("REPLACING"); return "value_of_" + s; }}
   }
 ;

evt
 :  INLINE_RECIPE
      {
	     console.error("INLINE_RECIPE: '" + yytext + "'");
	  }
 :  INCLUDE
      {
	     console.error("INCLUDE: '" + yytext + "'");
	  }
   |TARGET
      {
	     console.error("TARGET: '" + yytext + "'");
	  }
   |RULESTART
      {
	     console.error("RULESTART: '" + yytext + "'");
	  }
   |VARSTART
      {
	     console.error("VARSTART: '" + yytext + "'");
	  }
   |RECIPE_LINE
      {
	     console.error("RECIPE_LINE: '" + yytext + "'");
	  }
   |SEMICOLON
      {
	     console.error("SEMICOLON: '" + yytext + "'");
	  }
   |COLON
      {
	     console.error("COLON: '" + yytext + "', state: " + yy.lexer.topState());
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
   |EOL
      {
	     console.error("EOL: '" + yytext + "'");
	  }
   |SPC
      {
	     console.error("SPC: '" + yytext + "'");
	  }
   |VARIABLE_SET_SIMPLE
      {
	     console.error("VARIABLE_SET_SIMPLE: '" + yytext + "'");
	  }
   |VARIABLE_SET_RECURSIVE
      {
	     console.error("VARIABLE_SET_RECURSIVE: '" + yytext + "'");
	  }
   |VARIABLE_SET_APPEND
      {
	     console.error("VARIABLE_SET_APPEND: '" + yytext + "'");
	  }
   |VARIABLE_SET_CONDITIONAL
      {
	     console.error("VARIABLE_SET_CONDITIONAL: '" + yytext + "'");
	  }
   |VARIABLE_SET_SHELL
      {
	     console.error("VARIABLE_SET_SHELL: '" + yytext + "'");
	  }
   |VARIABLE_VALUE
      {
	     console.error("VARIABLE_VALUE: '" + yytext + "'");
	  }
   |MULTILINE_VARIABLE_SET_SIMPLE
      {
	     console.error("MULTILINE_VARIABLE_SET_SIMPLE: '" + yytext + "'");
	  }
   |MULTILINE_VARIABLE_SET_RECURSIVE
      {
	     console.error("MULTILINE_VARIABLE_SET_RECURSIVE: '" + yytext + "'");
	  }
   |MULTILINE_VARIABLE_SET_APPEND
      {
	     console.error("MULTILINE_VARIABLE_SET_APPEND: '" + yytext + "'");
	  }
   |MULTILINE_VARIABLE_SET_CONDITIONAL
      {
	     console.error("MULTILINE_VARIABLE_SET_CONDITIONAL: '" + yytext + "'");
	  }
   |MULTILINE_VARIABLE_SET_SHELL
      {
	     console.error("MULTILINE_VARIABLE_SET_SHELL: '" + yytext + "'");
	  }
   |MULTILINE_VARIABLE_VALUE
      {
	     console.error("MULTILINE_VARIABLE_VALUE: '" + yytext + "'");
	  }
   |MULTILINE_VARIABLE_END
      {
	     console.error("MULTILINE_VARIABLE_END: '" + yytext + "'");
	  }
   |EOF2
      {
	     console.error("EOF2: '" + yytext + "'");
	  }
 ;
