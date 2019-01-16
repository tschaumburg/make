%options multiline
%{
const tokens = require("./makefile-syntax-tokens");
const variables = require("../variables");

function trimVarname(src)
{
    let res = src;                        // ' myvar ::= '
    //res = res.replace(/^[\s]*/, "");      // => 'myvar ::= '

    res = res.replace(/[:][:][=]$/, ""); // => 'myvar'
    res = res.replace(/[:?!+]?[=]$/, "");
    res = res.trim()

    return res;
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

const debugStates = false;

this.gotoState = 
    function(state) 
    {
        var pre = this.topState(); 

        this.popState(); 
        this.pushState(state); 

        var post = this.topState(); 
        if (debugStates)
            console.error("...gotoState(): " + pre + " => " + post); 
    };

initDebugDone: true;
this.initDebug = function initDebug() {
    if (!!this.initDebugDone)
        return;

    this.initDebugDone = true;
    
    this.popState = 
        function() 
        {
            var pre = this.topState(); 

            if (this.conditionStack.length > 1)
            {
                this.conditionStack.pop(); 
            } 
            else 
            {
                console.error("WARNING: you tried to popState() beyond the state stack. The operation is being ignored, so no harm done - but we though you should know");
            }

            var post = this.topState(); 
            if (debugStates)
                console.error("...popState():  " + pre + " => " + post); 
        };
    
    this.pushState = 
        function(s) 
        {
            var pre = this.topState(); 

            this.conditionStack.push(s); 

            var post = this.topState(); 
            if (debugStates)
                console.error("...pushState(): " + pre + " => " + post); 
        };

}
%}

%s INITIAL PREPROCESSED RULE RECIPE INCLUDE COMMENT VAR_DEF VAR_VALUE VAR_DEF_END MULTI_VAR_DEF MULTI_VAR_DEF_VALUE IRECIPE INCLUDE_NAME

safechar     [^\r\n\s:#|:\\]
escapedchar  (?:\\[\x20:\t|\\])
basename	(?:(?:{safechar}|{escapedchar})+)
dirname	    (?:(?:{safechar}|{escapedchar})+)
separator   [/\\]
path        (?:{separator}*(?:{dirname}{separator}+)*)
filename    (?:{path}?{basename})
target		(?:(?:{safechar}|{escapedchar})+)
spc         [ \t]*
ltargets    (?:(?:{target}{spc})*{spc})
targets     (?:{spc}{ltargets})
variable	(?:[^\s=:?+!])+
varname	(?:[^\s=:?+!])+
recipe		(?:[^\n\r]*)
eol         (?:[\r]?[\n])
noeol       [^\r\n]

%%

/***************************************************************
 * Preprocessor-like conversions:
 * ==============================
 *
 * NOTE: This should be the first rules in the lexer!
 **************************************************************/


// Line-continuation:
// ==================
/*{spc}[\\]{eol}{spc}							{ return tokens.SPC; } */


// Replacing variable references:
// ==============================

<INITIAL>^[^\r\n]*{eol}     { 
                                this.initDebug();
                                var varValue = yy.makefileParserContext.resultBuilder.expandVariables(yytext);
                                //console.error("...preprocessor: " + JSON.stringify(yytext) + " ==> " + JSON.stringify(varValue)); 
                                this.unput(varValue);
                                this.pushState("PREPROCESSED");
                            }
<INITIAL>^.*{eol}           { 
                                //this.initDebug();
                                console.error("...preprocessor: " + JSON.stringify(yytext) + " => unchanged"); 
                                this.unput(yytext);
                                this.pushState("PREPROCESSED"); 
                            }

/***************************************************************
 * Makefile lines:
 * ===============
 **************************************************************/
<PREPROCESSED>(?=^'#')			          { this.gotoState("COMMENT");                          }
<PREPROCESSED>(?=^'include')   	          { this.gotoState("INCLUDE"); }
<PREPROCESSED>(?=^{varname}{spc}?'::=')   { this.gotoState("VAR_DEF"); }
<PREPROCESSED>(?=^{varname}{spc}?':=')    { this.gotoState("VAR_DEF"); }
<PREPROCESSED>(?=^{varname}{spc}?'+=')    { this.gotoState("VAR_DEF"); }
<PREPROCESSED>(?=^{varname}{spc}?'?=')    { this.gotoState("VAR_DEF"); }
<PREPROCESSED>(?=^{varname}{spc}?'!=')    { this.gotoState("VAR_DEF"); }
<PREPROCESSED>(?=^{varname}{spc}?'=')     { this.gotoState("VAR_DEF"); }
<PREPROCESSED>(?=^'define'{spc})          { this.gotoState("MULTI_VAR_DEF"); }
<PREPROCESSED>(?=^{ltargets}{spc}?':')    { this.gotoState("RULE");           return tokens.RULESTART; }
<PREPROCESSED>(?=^[ \t]+{recipe}{eol})	  { this.gotoState("RECIPE"); }
<PREPROCESSED>{eol}				          { this.popState(); return tokens.EOL; }

/***************************************************************
 * Recipes:
 * ========
 **************************************************************/
<RECIPE>^[ \t]+{recipe}(?={eol})		  {                  return tokens.RECIPE_LINE; }
<RECIPE>{eol}			 	              { this.popState(); return tokens.EOL; }
                                
/***************************************************************
 * Comments:
 * =========
 **************************************************************/
<COMMENT>^'#'[^\n\r]*{eol}			{ this.popState(); return tokens.EOL; }

/***************************************************************
 * Includes:
 * =========
 **************************************************************/
<INCLUDE>^'include'{spc}      { this.gotoState("INCLUDE_NAME"); }
<INCLUDE_NAME>{filename}       { return tokens.INCLUDE; }
<INCLUDE_NAME>\'{filename}\'   { return tokens.INCLUDE; }
<INCLUDE_NAME>\"{filename}\"   { return tokens.INCLUDE; }
<INCLUDE_NAME>{spc}?{eol}      { this.popState(); return tokens.EOL; }


/***************************************************************
 * Single-line variable definitions:
 * =================================
 **************************************************************/
<VAR_DEF>^{variable}\s*'?='			{ this.gotoState("VAR_VALUE");   yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_CONDITIONAL; }
<VAR_DEF>^{variable}\s*'::='		{ this.gotoState("VAR_VALUE");   yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_SIMPLE; }
<VAR_DEF>^{variable}\s*':='			{ this.gotoState("VAR_VALUE");   yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_SIMPLE; }
<VAR_DEF>^{variable}\s*'+='			{ this.gotoState("VAR_VALUE");   yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_APPEND; }
<VAR_DEF>^{variable}\s*'!='			{ this.gotoState("VAR_VALUE");   yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_SHELL; }
<VAR_DEF>^{variable}\s*'='			{ this.gotoState("VAR_VALUE");   yytext = trimVarname(yytext);  return tokens.VARIABLE_SET_RECURSIVE; }
<VAR_VALUE>[^\r\n]*(?={eol})		{ this.gotoState("VAR_DEF_END"); yytext = trimVarvalue(yytext); return tokens.VARIABLE_VALUE; }
<VAR_DEF_END>{eol}            		{ this.popState();                                              return tokens.EOL; }


/***************************************************************
 * Multi-line variable definitions:
 * =================================
 **************************************************************/
<MULTI_VAR_DEF>^'define'[ \t]+{variable}{spc}?[\n]				{ this.gotoState("MULTI_VAR_DEF_VALUE"); return tokens.MULTILINE_VARIABLE_SET_RECURSIVE; }
<MULTI_VAR_DEF>^'define'[ \t]+{variable}{spc}?'='[ \t]*[\n] 	{ this.gotoState("MULTI_VAR_DEF_VALUE"); return tokens.MULTILINE_VARIABLE_SET_RECURSIVE; }
<MULTI_VAR_DEF>^'define'[ \t]+{variable}{spc}?'?='[ \t]*[\n]	{ this.gotoState("MULTI_VAR_DEF_VALUE"); return tokens.MULTILINE_VARIABLE_SET_CONDITIONAL; }
<MULTI_VAR_DEF>^'define'[ \t]+{variable}{spc}?':='[ \t]*[\n]	{ this.gotoState("MULTI_VAR_DEF_VALUE"); return tokens.MULTILINE_VARIABLE_SET_SIMPLE; }
<MULTI_VAR_DEF>^'define'[ \t]+{variable}{spc}?'::='[ \t]*[\n]	{ this.gotoState("MULTI_VAR_DEF_VALUE"); return tokens.MULTILINE_VARIABLE_SET_SIMPLE; }
<MULTI_VAR_DEF>^'define'[ \t]+{variable}{spc}?'+='[ \t]*[\n]	{ this.gotoState("MULTI_VAR_DEF_VALUE"); return tokens.MULTILINE_VARIABLE_SET_APPEND; }
<MULTI_VAR_DEF>^'define'[ \t]+{variable}{spc}?'!='[ \t]*[\n]	{ this.gotoState("MULTI_VAR_DEF_VALUE"); return tokens.MULTILINE_VARIABLE_SET_SHELL; }
<MULTI_VAR_DEF_VALUE>^(?!enddef)[^\n]*\n						{ return tokens.MULTILINE_VARIABLE_VALUE; }
<MULTI_VAR_DEF_VALUE>'enddef'\s*\n						    	{ this.popState(); return tokens.MULTILINE_VARIABLE_END; }


/***************************************************************
 * Rule definitions:
 * =================
 **************************************************************/
<RULE>[:]        			{                            return tokens.COLON; }
<RULE>[|]        			{                            return tokens.PIPE; }
<RULE>[;]        			{ this.gotoState("IRECIPE"); return tokens.SEMICOLON; }
<RULE>(?:{target})		    {                            return tokens.TARGET; }
<RULE>[#].*{eol}		    { this.popState();           return tokens.EOL; }
<RULE>{eol}					{ this.popState();           return tokens.EOL; }
<RULE>[ \t]+                {}

/***************************************************************
 * Recipe lines:
 * =============
 **************************************************************/
<IRECIPE>{recipe}			    { this.popState(); return tokens.INLINE_RECIPE; }    

/***************************************************************
 * Handling whitespace:
 * ====================
 **************************************************************/
<INITIAL><<EOF>>						{ return tokens.EOF2; }
<PREPROCESSED><<EOF>>						{ return tokens.EOF2; }
<<EOF>>						{ return tokens.EOF2; }
<RULE><<EOF>>						{ return tokens.EOF2; }
<IRECIPE><<EOF>>						{ return tokens.EOF2; }
<MULTI_VAR_DEF><<EOF>>						{ return tokens.EOF2; }
<VAR_DEF><<EOF>>						{ return tokens.EOF2; }

.   { /*console.error("MISMATCH: '" + yytext + "', state: " + this.topState());*/ }


