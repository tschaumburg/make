%{
const os = require("os");
const result = require("../../result");
const resultb = require("./makefile-syntax-result");
%}

%start makefile



%%





makefile
 : statements EOF2
     { 
        resultb.end(yy);
      }
 ;

statement
 : rulestatement        { resultb.startRule(yy, @1, $1); }
 | RECIPE_LINE          { resultb.recipeLine(yy, @1, $1); }
 | INCLUDE              {  resultb.include(yy, @1, $1); }
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
 : RULESTART target_prereq orderonlies inline_recipe_definition//targetlist COLON targetlist targets2 
   {
      $$ = {};

      $$.targets = $2.targets;
      $$.prerequisites = $2.prerequisites;
      $$.targetPattern = $2.targetPattern;
      $$.prereqPattern = $2.prereqPattern;
      $$.orderOnlies = $3.orderOnlies;
      $$.irecipe = $4.irecipe;
	}
 ;

 target_prereq
  : TARGET_PREREQ
    {
      var target_prereq = $1.split(':');
       $$ = {};
      $$.targets = target_prereq[0];
      $$.prerequisites = target_prereq[1];
    }
    |TARGET_PATTERN_PATTERN
    {
       $$ = {};
      var target_pattern_pattern = $1.split(':');
      $$.targets = target_pattern_pattern[0];
      $$.targetPattern = target_pattern_pattern[1];
      $$.prereqPattern = target_pattern_pattern[2];
    }
  ;

 orderonlies
  : ORDERONLIES
    {
       $$ = {};
       $$.orderOnlies = $1;
    }
  | /* empty */
    {
       $$ = {};
       $$.orderOnlies = null;
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
  : INLINE_RECIPE
    {
       $$ = {};
      $$.irecipe = $2;
	 }
   | /* empty */
    {
       $$ = {};
      $$.irecipe = "";
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
 : MULTILINE_VARIABLE_SET_SIMPLE multiline_values MULTILINE_VARIABLE_END
   {
      $$ = { kind: 'simple', name: $1, value: $2.join(os.EOL) }
      //console.log("parser assign " + JSON.stringify($$, null, 3));
   }
 | MULTILINE_VARIABLE_SET_RECURSIVE multiline_values MULTILINE_VARIABLE_END
   {
      $$ = { kind: 'recursive', name: $1, value: $2.join(os.EOL) }
      //console.log("parser assign " + JSON.stringify($$, null, 3));
   }
 | MULTILINE_VARIABLE_SET_APPEND multiline_values MULTILINE_VARIABLE_END
   {
      $$ = { kind: 'append', name: $1, value: $2.join(os.EOL) }
      //console.log("parser assign " + JSON.stringify($$, null, 3));
   }
 | MULTILINE_VARIABLE_SET_CONDITIONAL multiline_values MULTILINE_VARIABLE_END
   {
      $$ = { kind: 'conditional', name: $1, value: $2.join(os.EOL) }
      //console.log("parser assign " + JSON.stringify($$, null, 3));
   }
 | MULTILINE_VARIABLE_SET_SHELL multiline_values MULTILINE_VARIABLE_END
   {
      $$ = { kind: 'shell', name: $1, value: $2.join(os.EOL) }
      //console.log("parser assign " + JSON.stringify($$, null, 3));
   }
 ;

multiline_values
 : multiline_values MULTILINE_VARIABLE_VALUE
   {
      $1.push($2.replace(/\r?\n$/, ""));
      $$ = $1;
   }
 | /* empty*/
   { 
      $$ = []; 
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
%include "test.jison"

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
	     console.error("INLINE_RECIPE (" + JSON.stringify(yytext) + ")");
	  }
   |INCLUDE
      {
	     console.error("INCLUDE (" + JSON.stringify(yytext) + ")");
	  }
   |TARGET
      {
	     console.error("TARGET (" + JSON.stringify(yytext) + ")");
	  }
   |RULESTART
      {
	     console.error("RULESTART (" + JSON.stringify(yytext) + ")");
	  }
   |VARSTART
      {
	     console.error("VARSTART (" + JSON.stringify(yytext) + ")");
	  }
   |RECIPE_LINE
      {
	     console.error("RECIPE_LINE (" + JSON.stringify(yytext) + ")");
	  }
   |INLINE_RECIPE
      {
	     console.error("INLINE_RECIPE (" + JSON.stringify(yytext) + ")");
	  }
   |TARGET_PREREQ
      {
	     console.error("TARGET_PREREQ (" + JSON.stringify(yytext) + ")");
	  }
     |TARGET_PATTERN_PATTERN
     {
	     console.error("TARGET_PATTERN_PATTERN (" + JSON.stringify(yytext) + ")");
     }
   |PIPE
      {
	     console.error("PIPE (" + JSON.stringify(yytext) + ")");
	  }
   |COLON_TARGETS
      {
	     console.error("COLON_TARGETS (" + JSON.stringify(yytext) + ")");
	  }
   |TARGETS
      {
	     console.error("TARGETS (" + JSON.stringify(yytext) + ")");
	  }
   |PIPE_TARGETS
      {
	     console.error("PIPE_TARGETS (" + JSON.stringify(yytext) + ")");
	  }
   |EOL
      {
	     console.error("EOL (" + JSON.stringify(yytext) + ")");
	  }
   |SPC
      {
	     console.error("SPC (" + JSON.stringify(yytext) + ")");
	  }
   |VARIABLE_SET_SIMPLE
      {
	     console.error("VARIABLE_SET_SIMPLE (" + JSON.stringify(yytext) + ")");
	  }
   |VARIABLE_SET_RECURSIVE
      {
	     console.error("VARIABLE_SET_RECURSIVE (" + JSON.stringify(yytext) + ")");
	  }
   |VARIABLE_SET_APPEND
      {
	     console.error("VARIABLE_SET_APPEND (" + JSON.stringify(yytext) + ")");
	  }
   |VARIABLE_SET_CONDITIONAL
      {
	     console.error("VARIABLE_SET_CONDITIONAL (" + JSON.stringify(yytext) + ")");
	  }
   |VARIABLE_SET_SHELL
      {
	     console.error("VARIABLE_SET_SHELL (" + JSON.stringify(yytext) + ")");
	  }
   |VARIABLE_VALUE
      {
	     console.error("VARIABLE_VALUE (" + JSON.stringify(yytext) + ")");
	  }
   |MULTILINE_VARIABLE_SET_SIMPLE
      {
	     console.error("MULTILINE_VARIABLE_SET_SIMPLE (" + JSON.stringify(yytext) + ")");
	  }
   |MULTILINE_VARIABLE_SET_RECURSIVE
      {
	     console.error("MULTILINE_VARIABLE_SET_RECURSIVE (" + JSON.stringify(yytext) + ")");
	  }
   |MULTILINE_VARIABLE_SET_APPEND
      {
	     console.error("MULTILINE_VARIABLE_SET_APPEND (" + JSON.stringify(yytext) + ")");
	  }
   |MULTILINE_VARIABLE_SET_CONDITIONAL
      {
	     console.error("MULTILINE_VARIABLE_SET_CONDITIONAL (" + JSON.stringify(yytext) + ")");
	  }
   |MULTILINE_VARIABLE_SET_SHELL
      {
	     console.error("MULTILINE_VARIABLE_SET_SHELL (" + JSON.stringify(yytext) + ")");
	  }
   |MULTILINE_VARIABLE_VALUE
      {
	     console.error("MULTILINE_VARIABLE_VALUE (" + JSON.stringify(yytext) + ")");
	  }
   |MULTILINE_VARIABLE_END
      {
	     console.error("MULTILINE_VARIABLE_END (" + JSON.stringify(yytext) + ")");
	  }
   |'EOF2'
      {
	     console.error("EOF2: '" + JSON.stringify(JSON.stringify(yytext)) + "', state: " + yy.lexer.topState());
	  }
 ;
