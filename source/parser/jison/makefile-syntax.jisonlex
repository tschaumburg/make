%{
const tokens = require("./tokens");
const variables = require("./variables");
%}

%s INITIAL RULEDEF VAR_DEF MULTI_VAR_DEF IRECIPE

safechar     [^\s:=;|\\]
escapedchar  (?:\\[\x20:\t|\\])
target		(?:(?:{safechar}|{escapedchar})+)
spc         [ \t]*
ltargets    (?:{target}{spc})+
targets     (?:{spc}{ltargets})
variable	(?:[^\s=:?+!])+
recipe		(?:[^\n\r]*)
eol         (?:[\r]?[\n])
%%

[$][{]\w*[}]                            {
                                            if (!!this.preprocessor) 
                                                this.unput(this.preprocessor.expandVariables(yytext));
                                        }
                                        
/***************************************************************
 * Line-continuation:
 * ==================
 **************************************************************/
/*{spc}[\\]{eol}{spc}							{ return tokens.SPC; } */


/***************************************************************
 * Comments:
 * =========
 **************************************************************/
/*[#][^\n]*{eol}							this.begin("INITIAL");*/


/***************************************************************
 * Rule lines:
 * ===========
 **************************************************************/
<INITIAL>(?={ltargets}[:])   	    	{ console.error("ruledef"); this.begin("RULEDEF"); }
<RULEDEF>[:]        					{ return tokens.COLON; }
<RULEDEF>[|]        					{ return tokens.PIPE; }
<RULEDEF>[;]        					{ this.begin("IRECIPE"); return tokens.SEMICOLON; }
<RULEDEF>(?:{target})		    		{ return tokens.TARGET; }
<IRECIPE>{recipe}			    		{ this.begin("RULEDEF"); return tokens.INLINE_RECIPE; }    
<RULEDEF>[ \t]+							{ /* Do nothing */ }
<RULEDEF>{eol}							{ this.begin("INITIAL"); return tokens.EOL; }


/***************************************************************
 * Recipe lines:
 * =============
 **************************************************************/
<INITIAL>^\t{recipe}[\n]				{ return tokens.RECIPE_LINE; }


/***************************************************************
 * Handling whitespace:
 * ====================
 **************************************************************/
<INITIAL>{eol}					{ return tokens.EOL; }
<INITIAL>[ \t]+				{ return tokens.SPC; }
<<EOF>>						{ return tokens.EOF; }


/***************************************************************
 * Single-line variable definitions:
 * =================================
 **************************************************************/
<INITIAL>{variable}\s*'='			{ this.begin("VAR_DEF"); return tokens.VARIABLE_SET; }
<INITIAL>{variable}\s*'?='			{ this.begin("VAR_DEF"); return tokens.VARIABLE_SET; }
<INITIAL>{variable}\s*':='			{ this.begin("VAR_DEF"); return tokens.VARIABLE_SET; }
<INITIAL>{variable}\s*'+='			{ this.begin("VAR_DEF"); return tokens.VARIABLE_SET; }
<INITIAL>{variable}\s*'!='			{ this.begin("VAR_DEF"); return tokens.VARIABLE_SET; }
<VAR_DEF>[^\n]*						{ return tokens.VARIABLE_VALUE; }
<VAR_DEF>{eol}						{ this.begin("INITIAL"); return tokens.EOL; }
<VAR_DEF>[ \t]+					{ /* Do nothing */ }


/***************************************************************
 * Multi-line variable definitions:
 * =================================
 **************************************************************/
<INITIAL>'define'[ \t]+{variable}[ \t]*[\n]				{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET; }
<INITIAL>'define'[ \t]+{variable}[ \t]*'='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET; }
<INITIAL>'define'[ \t]+{variable}[ \t]*'?='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET; }
<INITIAL>'define'[ \t]+{variable}[ \t]*':='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET; }
<INITIAL>'define'[ \t]+{variable}[ \t]*'+='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET; }
<INITIAL>'define'[ \t]+{variable}[ \t]*'!='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET; }
<MULTI_VAR_DEF>^(?!enddef)[^\n]*\n						{ return tokens.MULTILINE_VARIABLE_VALUE; }
<MULTI_VAR_DEF>'enddef'\s*\n							{ this.begin("INITIAL"); return tokens.MULTILINE_VARIABLE_END; }

