%{
const tokens = require("./makefile-syntax-tokens");
const variables = require("../variables");

function trimVarname(src)
{
    //console.error("VAR " + src);
    return src.replace(/^[\s]*/, "").replace(/[ =\r\n]*$/, "");
}

function trimVarvalue(src)
{
    //console.error("VAL " + src);
    return src.replace(/^[\s]*/, "").replace(/[ =\r\n]*$/, "");
}

function trimText(src, regex1, regex2)
{
    if (!src)
        return src;

    if (!!regex1)
        src = src.replace(regex1, "");

    if (!!regex2)
        src = src.replace(regex2, "");

    return src;
}
%}

%s INITIAL RULE INCLUDE COMMENT VAR_DEF VAR_VALUE MULTI_VAR_DEF IRECIPE

safechar     [^\s\\]
escapedchar  (?:\\[\x20:\t|\\])
target		(?:(?:{safechar}|{escapedchar})+)
spc         [ \t]*
ltargets    (?:(?:{target}{spc})*{spc})
targets     (?:{spc}{ltargets})
variable	(?:[^\s=:?+!])+
recipe		(?:[^\n\r]*)
eol         (?:[\r]?[\n])

%%










/***************************************************************
 * Replacing variable references:
 * ==============================
 **************************************************************/

[$][(]\w+[)]        {
                        if (!!yy.preprocessor) 
                        {
                            var varName = trimText(yytext, /^[$][(]/, /[)]$/);
                            var varValue = yy.preprocessor.expandVariables(yytext);
                            this.unput(varValue);
                            //yytext = "";
                        }
                    }
                                        
[$][{]\w+[}]        {
                        if (!!yy.preprocessor) 
                        {
                            var varName = trimText(yytext, /^[$][{]/, /[}]$/);
                            var varValue = yy.preprocessor.expandVariables(yytext);
                            this.unput(varValue);
                            //yytext = "";
                        }
                    }
                                        
/***************************************************************
 * Line-continuation:
 * ==================
 **************************************************************/
/*{spc}[\\]{eol}{spc}							{ return tokens.SPC; } */



/***************************************************************
 * Makefile lines:
 * ===============
 **************************************************************/
<INITIAL>'#'				        { this.begin("COMMENT");                          }
<INITIAL>'include'\s+   	        { this.begin("INCLUDE"); }
<INITIAL>(?=({ltargets}[:]))        { this.begin("RULE");    return tokens.RULESTART; }
<INITIAL>[ \t]+{recipe}				{ return tokens.RECIPE_LINE; }
<INITIAL>(?={variable}\s*.?.?'=')	{ this.begin("VAR_DEF"); }
<INITIAL>{eol}				        { return tokens.EOL; }

/***************************************************************
 * Comments:
 * =========
 **************************************************************/
<COMMENT>[^\n\r]*$			{ this.begin("INITIAL"); return tokens.EOL; }

/***************************************************************
 * Includes:
 * =========
 **************************************************************/
/*
<INCLUDE>{filename}         {                        return tokens.INCLUDE; }
<INCLUDE>\"{filename}\"     {                        return tokens.INCLUDE; }
<INCLUDE>\'{filename}\'     {                        return tokens.INCLUDE; }
<INCLUDE>{spc}$             { this.begin("INITIAL"); return tokens.EOL; }
*/

/***************************************************************
 * Rule definitions:
 * =================
 **************************************************************/
<RULE>[#].*{eol}		    { this.begin("INITIAL"); return tokens.EOL; }
<RULE>[:]        			{                        return tokens.COLON; }
<RULE>[|]        			{                        return tokens.PIPE; }
<RULE>[;]        			{ this.begin("IRECIPE"); return tokens.SEMICOLON; }
<RULE>(?:{target})		    {                        return tokens.TARGET; }
<IRECIPE>{recipe}			    { this.begin("RULE"); return tokens.INLINE_RECIPE; }    
<RULE>{eol}					{ this.begin("INITIAL"); return tokens.EOL; }
<RULE>[ \t]+                  {}

/***************************************************************
 * Recipe lines:
 * =============
 **************************************************************/

/***************************************************************
 * Handling whitespace:
 * ====================
 **************************************************************/
<<EOF>>						{ return tokens.EOF2; }
<RULE><<EOF>>						{ return tokens.EOF2; }
<IRECIPE><<EOF>>						{ return tokens.EOF2; }
<MULTI_VAR_DEF><<EOF>>						{ return tokens.EOF2; }
<VAR_DEF><<EOF>>						{ return tokens.EOF2; }


/***************************************************************
 * Single-line variable definitions:
 * =================================
 **************************************************************/
<VAR_DEF>{variable}\s*'='			{ this.begin("VAR_VALUE"); yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_RECURSIVE; }
<VAR_DEF>{variable}\s*'?='			{ this.begin("VAR_VALUE"); yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_CONDITIONAL; }
<VAR_DEF>{variable}\s*':='			{ this.begin("VAR_VALUE"); yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_SIMPLE; }
<VAR_DEF>{variable}\s*'::='			{ this.begin("VAR_VALUE"); yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_SIMPLE; }
<VAR_DEF>{variable}\s*'+='			{ this.begin("VAR_VALUE"); yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_APPEND; }
<VAR_DEF>{variable}\s*'!='			{ this.begin("VAR_VALUE"); yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_SHELL; }
<VAR_VALUE>[^\r\n]*(?={eol})		{ this.begin("INITIAL");   yytext = trimVarvalue(yytext); return tokens.VARIABLE_VALUE; }


/***************************************************************
 * Multi-line variable definitions:
 * =================================
 **************************************************************/
<INITIAL>'define'[ \t]+{variable}[ \t]*[\n]				{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET_RECURSIVE; }
<INITIAL>'define'[ \t]+{variable}[ \t]*'='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET_RECURSIVE; }
<INITIAL>'define'[ \t]+{variable}[ \t]*'?='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET_CONDITIONAL; }
<INITIAL>'define'[ \t]+{variable}[ \t]*':='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET_SIMPLE; }
<INITIAL>'define'[ \t]+{variable}[ \t]*'::='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET_SIMPLE; }
<INITIAL>'define'[ \t]+{variable}[ \t]*'+='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET_APPEND; }
<INITIAL>'define'[ \t]+{variable}[ \t]*'!='[ \t]*[\n]	{ this.begin("MULTI_VAR_DEF"); return tokens.MULTILINE_VARIABLE_SET_SHELL; }
<MULTI_VAR_DEF>^(?!enddef)[^\n]*\n						{ return tokens.MULTILINE_VARIABLE_VALUE; }
<MULTI_VAR_DEF>'enddef'\s*\n							{ this.begin("INITIAL"); console.error("MultiVar enddef => INITIAL"); return tokens.MULTILINE_VARIABLE_END; }

.   { console.error("MISMATCH: '" + yytext + "', state: " + this.topState()); }


