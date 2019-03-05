%{
const os = require("os");
const parseEvents = require("./makefile-syntax-events");
const log = require("../../../makelog");
const errors = require("../../../make-errors");
%}

%start makefile



%%





makefile
 : statements EOF2
     { 
        parseEvents.end(yy);
      }
 ;

statement
 : rulestatement        { log.info("sendStartRule call"); parseEvents.sendStartRule(yy, @1, $1); }
 | RECIPE_LINE          { log.info("sendRecipeLine call"); parseEvents.sendRecipeLine(yy, @1, $1); log.info("sendRecipeLine return"); }
 | INCLUDE              { log.info("sendInclude call"); parseEvents.sendInclude(yy, @1, $1); }
 | variable_definition  { log.info("sendDefineVariable call"); parseEvents.sendDefineVariable(yy, @1, $1); }
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
 *   target-pattern:  a target name containing exactly one ' '
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
   :   RULE_START COLON_TARGETS colon_targets_optional orderonlies2  inline_recipe
      {
         if (!$1 || $1.trim().length == 0)
         {
            console.error("" + JSON.stringify($$));
            errors.ruleMissingTarget();
         }

         if (parseEvents.isPatternList(yy, $1))
         {
            // implicit:
            if (!!$3)
            {
               console.error("" + JSON.stringify($$));
               errors.unknownRuleType(currentLine);
            }
            $$ = parseEvents.RuleParseInfo.implicit($1, $2, $4, $5, false);
         }
         else if (parseEvents.isNameList(yy, $1))
         {
            if (!$3)
            {
               // explicit
               $$ = parseEvents.RuleParseInfo.explicit($1, $2, $4, $5, false);
            }
            else
            {
               // static patterns
            }
         }
         else
         {
            console.error("" + JSON.stringify($$));
            errors.unknownRuleType(currentLine);
         }

      }
   ;

orderonlies2 
   : PIPE_TARGETS
      {
         $$ = $0;
      }
   | /* empty */
      {
         $$ = null;
      }
   ;

inline_recipe
   : INLINE_RECIPE
      {
         $$ = $0;
      }
   | /* empty */
      {
         $$ = null;
      }
   ;

colon_targets_optional
   : COLON_TARGETS
      {
         $$ = $0;
      }
   | /* empty */
      {
         $$ = null;
      }
   ;


rulestatementxxxx
 : EXPLICIT_RULE PREREQUISITES ORDERONLIES INLINE_RECIPE
   {
      $$ = new parseEvents.RuleParseInfo($1, null, $2, null, $3, $4, false);
      //console.error("parser: " + JSON.stringify($1, null, 3));
	}
 | IMPLICIT_RULE PREREQUISITES ORDERONLIES INLINE_RECIPE
   {
      //$$ = {};

      //$$.targets = $1;
      //$$.targetPattern = null;
      //$$.prerequisites = $2;
      //$$.prereqPattern = null;
      //$$.orderOnlies = $3;
      //$$.irecipe = $4;

      $$ = new parseEvents.RuleParseInfo(null, $1, null, $2, $3, $4, false);
      //console.error("parser: " + JSON.stringify($1, null, 3));
	}
 | TARGETS TARGETPATTERNS PREREQPATTERNS ORDERONLIES INLINE_RECIPE
   {
      //$$ = {};

      //$$.targets = $1;
      //$$.targetPattern = $2;
      //$$.prerequisites = null;
      //$$.prereqPattern = $3;
      //$$.orderOnlies = $4;
      //$$.irecipe = $5;

      $$ = new parseEvents.RuleParseInfo($1, $2, null, $3, $4, $5, false);
      //console.error("parser: " + JSON.stringify($1, null, 3));
	}
 ;

 target_prereq
  : targetlist COLON targetlist //TARGET_PREREQ
    {
      //var target_prereq = $1.split(':');
      $$ = {};
      $$.targets = $1;
      $$.targetPattern = null;
      $$.prereqPattern = null;
      $$.prerequisites = $3;
    }
    |targetlist COLON targetlist COLON targetlist
    {
       $$ = {};
      $$.targets = $1;
      $$.targetPattern = $3;
      $$.prereqPattern = $5;
      $$.prerequisites = null;
    }
  ;

 orderonlies
  : PIPE targetlist
    {
       $$ = {};
       $$.orderOnlies = $2;
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
      $$.push( { location: @2, targetName: $2.trim() });
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
      $$.irecipe = $1;
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
 : MACRO_SIMPLE multiline_values MACRO_END
   {
      $$ = { kind: 'simple', name: $1, value: $2.join(os.EOL) }
      //console.log("parser assign " + JSON.stringify($$, null, 3));
   }
 | MACRO_RECURSIVE multiline_values MACRO_END
   {
      $$ = { kind: 'recursive', name: $1, value: $2.join(os.EOL) }
      //console.log("parser assign " + JSON.stringify($$, null, 3));
   }
 | MACRO_APPEND multiline_values MACRO_END
   {
      $$ = { kind: 'append', name: $1, value: $2.join(os.EOL) }
      //console.log("parser assign " + JSON.stringify($$, null, 3));
   }
 | MACRO_CONDITIONAL multiline_values MACRO_END
   {
      $$ = { kind: 'conditional', name: $1, value: $2.join(os.EOL) }
      //console.log("parser assign " + JSON.stringify($$, null, 3));
   }
 | MACRO_SHELL multiline_values MACRO_END
   {
      $$ = { kind: 'shell', name: $1, value: $2.join(os.EOL) }
      //console.log("parser assign " + JSON.stringify($$, null, 3));
   }
 ;

multiline_values
 : multiline_values MACRO_VALUE
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
//include "test.jison"

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
 :  RULELINE
      {
	     console.error("RULELINE (" + JSON.stringify(yytext) + ")");
	  }
   |RULE_START
      {
	     console.error("RULE_START (" + JSON.stringify(yytext) + ")");
	  }
   |EXPLICIT_RULE
      {
	     console.error("EXPLICIT_RULE (" + JSON.stringify(yytext) + ")");
	  }
   |IMPLICIT_RULE
      {
	     console.error("IMPLICIT_RULE (" + JSON.stringify(yytext) + ")");
	  }
   |TARGETPATTERNS
     {
	     console.error("TARGETPATTERNS (" + JSON.stringify(yytext) + ")");
     }
   |PREREQUISITES
      {
	     console.error("PREREQUISITES (" + JSON.stringify(yytext) + ")");
	  }
   |PREREQPATTERNS
      {
	     console.error("PREREQPATTERNS (" + JSON.stringify(yytext) + ")");
	  }
   |ORDERONLIES
      {
	     console.error("ORDERONLIES (" + JSON.stringify(yytext) + ")");
	  }
   |RECIPE_LINE
      {
	     console.error("RECIPE_LINE (" + JSON.stringify(yytext) + ")");
	  }
   |INLINE_RECIPE
      {
	     console.error("INLINE_RECIPE (" + JSON.stringify(yytext) + ")");
	  }
   |INCLUDE
      {
	     console.error("INCLUDE (" + JSON.stringify(yytext) + ")");
	  }
   |VARSTART
      {
	     console.error("VARSTART (" + JSON.stringify(yytext) + ")");
	  }
   |PIPE
      {
	     console.error("PIPE (" + JSON.stringify(yytext) + ")");
	  }
   |COLON
      {
	     console.error("COLON (" + JSON.stringify(yytext) + ")");
	  }
   |TARGETS
      {
	     console.error("TARGETS (" + JSON.stringify(yytext) + ")");
	  }
   |PIPE_TARGETS
      {
	     console.error("PIPE_TARGETS (" + JSON.stringify(yytext) + ")");
	  }
   |COLON_TARGETS
      {
	     console.error("COLON_TARGETS (" + JSON.stringify(yytext) + ")");
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
   |MACRO_SIMPLE
      {
	     console.error("MACRO_SIMPLE (" + JSON.stringify(yytext) + ")");
	  }
   |MACRO_RECURSIVE
      {
	     console.error("MACRO_RECURSIVE (" + JSON.stringify(yytext) + ")");
	  }
   |MACRO_APPEND
      {
	     console.error("MACRO_APPEND (" + JSON.stringify(yytext) + ")");
	  }
   |MACRO_CONDITIONAL
      {
	     console.error("MACRO_CONDITIONAL (" + JSON.stringify(yytext) + ")");
	  }
   |MACRO_SHELL
      {
	     console.error("MACRO_SHELL (" + JSON.stringify(yytext) + ")");
	  }
   |MACRO_VALUE
      {
	     console.error("MACRO_VALUE (" + JSON.stringify(yytext) + ")");
	  }
   |MACRO_END
      {
	     console.error("MACRO_END (" + JSON.stringify(yytext) + ")");
	  }
   |'EOF2'
      {
	     console.error("EOF2: " + JSON.stringify(JSON.stringify(yytext)) + ", state: " + yy.lexer.topState());
	  }
 ;
