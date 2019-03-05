%options multiline 
%{
const preprocessor = require("./makefile-preprocessor");
const tokens = require("./makefile-syntax-tokens");
const context = require("./parser-context");
const utils = require("./makefile-syntax-utils");
const log = require("../../../makelog");
const errors = require("../../../make-errors");

/*const debugStates = true;

this.begin = 
    function(state) 
    {
        var pre = this.topState(); 
        if (debugStates)
            console.error("...begin(): " + pre + " => " + state); 

        // from this.begin("INITIAL"):
        {
            var n = this.conditionStack.length - 1;
            if (n > 0) {
                return this.conditionStack.pop();
            }
            else{
                console.error("ooops..");
            }
        }

        // from this.pushState(state):
        {
            this.conditionStack.push(state);
        }
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
                console.error("...popState()):  " + pre + " => " + post); 
        };
    
    this.pushState = 
        function(s) 
        {
            var pre = this.topState(); 
            if (debugStates)
                console.error("...pushState(): " + pre + " => " + s); 

            this.conditionStack.push(s); 
        };

}

const goto = function (state)
{
     yy_.begin(state);
}
*/
const match = function (index)
{
    yytext = yy_.matches[index];
}


const resolveVariables = function (src)
{
    return context.getContext(yy).resultBuilder.expandVariables(src);
}

const trimStart = function (prefix)
{
    yytext = yytext.replace(prefix, "");
}

const trimColon = function ()
{
    trimStart(/^[ \t:]*/);
}

const trimPipe = function ()
{
    trimStart(/^[ \t|]*/);
}

const trimSemi = function ()
{
    trimStart(/^[ \t;]*/);
}

const isRecipe = function (line)
{
    var res =  line.startsWith("\t");
    //console.error("Line '" + line + "' " + (res ? "IS" : "is NOT") + " a recipe line");
    return res;
}
%}

%s INITIAL RULE RULE_START PARSER_RULE_EXPLICIT PARSER_RULE_IMPLICIT PARSER_RULE_STATICPATTERN PREPROCESSOR PREPROCESSOR_LINEBREAKS PREPROCESSOR_COMMENTS PREPROCESSOR_VARIABLES PARSER PARSER_RULELINE PARSER_RULELINE_TARGETS RULETYPE TARGETPATTERNS PREREQUISITES PREREQPATTERNS ORDERONLIES PARSER_RECIPELINE ENDRULE INLINE_RECIPE INCLUDE COMMENT VAR_DEF VAR_VALUE VAR_DEF_END MACRO MACRO_VALUE INCLUDE_NAME


safechar     [^\r\n\s:#|:\\]
escapedchar  (?:\\[\x20:\t|\\])
basename	(?:(?:{safechar}|{escapedchar})+)
dirname	    (?:(?:{safechar}|{escapedchar})+)
separator   [/\\]
path        (?:{separator}*(?:{dirname}{separator}+)*)
filename    (?:{path}?{basename})

spc         [ \t]*
eol         (?:[\r]?[\n])
restofline  [^\r\n]*(?={eol})

variable	(?:[^\s=:?+!])+
varname	    (?:[^\s=:?+!])+
recipe		(?:[^\n\r]*)



colon                (?:{spc}[:]{spc})
pipe                 (?:{spc}[|]{spc})
semicolon            (?:{spc}[;]{spc})

defineStart  ^('define'{spc}{varname}{spc}?)
defineEnd    ([ \t]*{eol})

target-part           (?:(?:(?:\\[%:;# \t\\|])|[^%:;# \t\\|\r\n\x00])*)
target-name           {target-part}
target-name-list      (?:(?:{spc}{target-name})+{spc})

target-pattern        (?:{target-part}[%]{target-part})
target-pattern-list   (?:(?:{spc}{target-pattern})+{spc})

target-mix            (?:{target-name}|{target-pattern})
target-mix-list       (?:(?:{spc}{target-mix})+{spc})

xruleline    {restofline}
xxtarget-list        (?:(?:(?:\\[%:;# \\|])|[^:;#\r\n\x00|\\])*)
xprerequisites  (?:(?:(?:\\[%:;# \\|])|[^:;#\r\n\x00|])*)
xorderonlies    (?:(?:(?:\\[%:;# \\|])|[^;#\r\n\x00|])*)

xtargetpatterns (?:[^:;#\r\n=\x00]|(?:\\[%:;# ]))+

xprereqpatterns (?:[^|#=:\r\n\x00]|(?:\\[%|# ]))*

%%

<INITIAL>^{spc}{eol}                    { this.begin("INITIAL"); return tokens.EOL; }
<INITIAL>^{spc}<<EOF>>                    { this.begin("INITIAL"); return tokens.EOF2; }

<INITIAL>^ 
    %{ 
        //console.error("pre");
        //console.error("   yytext: " + JSON.stringify(yytext));
        //console.error("   _input: " + JSON.stringify(this._input));
        this.begin("PARSER"); 
    %}

/***************************************************************
 * Preprocessor:
 * =============
 * See preprocessing.md
 * 
 * NOTE: This should be the first rules in the lexer!
 **************************************************************/
<PREPROCESSOR>.*
    %{ 
        //this.unput(/*resolveVariables*/(yytext)); 
    %}

/***************************************************************
 * Makefile lines:
 * ===============
 **************************************************************/
<PARSER>^{eol}                    { this.begin("INITIAL"); return tokens.EOL; }
<PARSER>^(?='include')            { this.begin("INCLUDE"); }
<PARSER>^(?={varname}{spc}?'::=') { this.begin("VAR_DEF"); }
<PARSER>^(?={varname}{spc}?':=')  { this.begin("VAR_DEF"); }
<PARSER>^(?={varname}{spc}?'+=')  { this.begin("VAR_DEF"); }
<PARSER>^(?={varname}{spc}?'?=')  { this.begin("VAR_DEF"); }
<PARSER>^(?={varname}{spc}?'!=')  { this.begin("VAR_DEF"); }
<PARSER>^(?={varname}{spc}?'=')   { this.begin("VAR_DEF"); }
<PARSER>^(?='define'{spc})        { this.begin("MACRO"); }
<PARSER>^(?=[\t]{restofline})     { this.begin("PARSER_RECIPELINE"); }

<PARSER>^(?:{restofline})
    %{
            // Expand any variable references before parsing:
            let preprocessedLine = resolveVariables(yytext);
            this.unput(preprocessedLine); 
            this.begin("RULE_START");
    %}
    
/***************************************************************
 * Rule definitions:
 * =================
 * 
 **************************************************************/
<RULE_START>{target-mix-list}
    %{
        this.begin("RULE");
        return tokens.RULE_START;
    %}

<RULE>[:]{target-mix-list}
    %{
        trimColon();
        return tokens.COLON_TARGETS;
    %}
    
<RULE>[|]{target-mix-list}
    %{
        trimPipe();
        return tokens.PIPE_TARGETS;
    %}
    
<RULE>[;]{restofline}
    %{
        trimSemi(); 
        return tokens.INLINE_RECIPE; 
    %}
<RULE>{eol}
    %{
        this.begin("INITIAL"); 
        return tokens.EOL; 
    %}
<PARSER_RULE_EXPLICIT>{target-name-list}{colon}
    %{
        console.error("PARSER_RULE_EXPLICIT"); 
        this.begin("PREREQUISITES"); 
        trimColon(); 
        return tokens.EXPLICIT_RULE; 
    %}
<PARSER_RULE_IMPLICIT>{target-pattern-list}{colon}
    %{ 
        console.error("PARSER_RULE_IMPLICIT"); 
        this.begin("PREREQUISITES"); 
        trimColon(); 
        return tokens.IMPLICIT_RULE; 
    %}
<PREREQUISITES>{target-mix-list}?  
    %{ 
        console.error("PREREQUISITES"); 
        this.begin("ORDERONLIES"); 
        return tokens.PREREQUISITES; 
    %}
<ORDERONLIES>(?:{pipe}{target-mix-list})?        
    %{
        console.error("ORDERONLIES"); 
        this.begin("INLINE_RECIPE"); 
        trimPipe(); 
        return tokens.ORDERONLIES; 
    %}
<INLINE_RECIPE>(?:{semicolon}{restofline})?
    %{
        console.error("INLINE_RECIPE"); 
        this.begin("ENDRULE"); 
        trimSemi(); 
        return tokens.INLINE_RECIPE; 
    %}
<ENDRULE>{eol}                                                 
    %{
        console.error("ENDRULE"); 
        this.begin("INITIAL"); return tokens.EOL; 
    %}



<TARGETPATTERNS>{colon}{xtargetpatterns}      { this.begin("PREREQPATTERNS"); trimColon(); return tokens.TARGETPATTERNS; }
<PREREQPATTERNS>(?:{colon}{xprereqpatterns})? { this.begin("ORDERONLIES"); trimColon(); return tokens.PREREQPATTERNS; }

/***************************************************************
 * Recipes:
 * ========
 **************************************************************/
<PARSER_RECIPELINE>^[\t]{restofline}	     { yytext = yytext.substr(1);  return tokens.RECIPE_LINE; }
<PARSER_RECIPELINE>{eol}			 	     { this.begin("INITIAL"); this.begin("INITIAL"); return tokens.EOL; }
<PARSER_RECIPELINE><<EOF>>					 { return tokens.EOF2; }
                                
/***************************************************************
 * Includes:
 * =========
 **************************************************************/
<INCLUDE>^'include'{spc}      { this.begin("INCLUDE_NAME"); }
<INCLUDE_NAME>{filename}       { return tokens.INCLUDE; }
<INCLUDE_NAME>\'{filename}\'   { return tokens.INCLUDE; }
<INCLUDE_NAME>\"{filename}\"   { return tokens.INCLUDE; }
<INCLUDE_NAME>{spc}?{eol}      { this.begin("INITIAL"); return tokens.EOL; }


/***************************************************************
 * Single-line variable definitions:
 * =================================
 **************************************************************/
<VAR_DEF>^{varname}\s*[?][=]		{ this.begin("VAR_VALUE");   yytext = utils.trimVarname(yytext);  return tokens.VARIABLE_SET_CONDITIONAL; }
<VAR_DEF>^{varname}\s*[:][:][=]		{ this.begin("VAR_VALUE");   yytext = utils.trimVarname(yytext);  return tokens.VARIABLE_SET_SIMPLE; }
<VAR_DEF>^{varname}\s*[:][=]		{ this.begin("VAR_VALUE");   yytext = utils.trimVarname(yytext);  return tokens.VARIABLE_SET_SIMPLE; }
<VAR_DEF>^{varname}\s*[+][=]		{ this.begin("VAR_VALUE");   yytext = utils.trimVarname(yytext);  return tokens.VARIABLE_SET_APPEND; }
<VAR_DEF>^{varname}\s*[!][=]		{ this.begin("VAR_VALUE");   yytext = utils.trimVarname(yytext);  return tokens.VARIABLE_SET_SHELL; }
<VAR_DEF>^{varname}\s*[=]			{ this.begin("VAR_VALUE");   yytext = utils.trimVarname(yytext);  return tokens.VARIABLE_SET_RECURSIVE; }
<VAR_VALUE>[^\r\n]*(?={eol})		{ this.begin("VAR_DEF_END"); yytext = utils.trimVarvalue(yytext); return tokens.VARIABLE_VALUE; }
<VAR_DEF_END>{eol}            		{ this.begin("INITIAL");                                              return tokens.EOL; }


/***************************************************************
 * Multi-line variable definitions:
 * =================================
 * "The define directive is followed on the same line by the name
 *  of the variable being defined and an (optional) assignment
 *  operator, and nothing more.
 *
 *  The value to give the variable appears on the following lines.
 *
 *  The end of the value is marked by a line containing just
 *  the word endef.
 *
 *  Aside from this difference in syntax, define works just like
 *  any other variable definition.
 *
 *  The variable name may contain function and variable references,
 *  which are expanded when the directive is read to find the actual
 *  variable name to use."
 * console.error(JSON.stringify(this.matches, null, 3)); 
 **************************************************************/
<MACRO>{defineStart}'='{defineEnd}   { match(4); this.begin("MACRO_VALUE"); return tokens.MACRO_RECURSIVE; }
<MACRO>{defineStart}'?='{defineEnd}	 { match(4); this.begin("MACRO_VALUE"); return tokens.MACRO_CONDITIONAL; }
<MACRO>{defineStart}':='{defineEnd}	 { match(4); this.begin("MACRO_VALUE"); return tokens.MACRO_SIMPLE; }
<MACRO>{defineStart}'::='{defineEnd} { match(4); this.begin("MACRO_VALUE"); return tokens.MACRO_SIMPLE; }
<MACRO>{defineStart}'+='{defineEnd}	 { match(4); this.begin("MACRO_VALUE"); return tokens.MACRO_APPEND; }
<MACRO>{defineStart}'!='{defineEnd}	 { match(4); this.begin("MACRO_VALUE"); return tokens.MACRO_SHELL; }
<MACRO>^{defineStart}{defineEnd}     { match(4); this.begin("MACRO_VALUE"); return tokens.MACRO_RECURSIVE; }
<MACRO_VALUE>^'endef'\s*(?={eol})    {           this.begin("INITIAL");     return tokens.MACRO_END; }
<MACRO_VALUE>[^\r\n]*{eol}           {                                return tokens.MACRO_VALUE; }


/***************************************************************
 * Handling whitespace:
 * ====================
 **************************************************************/
<INITIAL><<EOF>>						{ return tokens.EOF2; }
<PARSER><<EOF>>						{ return tokens.EOF2; }
<<EOF>>						{ return tokens.EOF2; }
<PARSER_RULELINE><<EOF>>						{ return tokens.EOF2; }
<PARSER_RECIPELINE><<EOF>>						{ return tokens.EOF2; }
<MACRO><<EOF>>						{ return tokens.EOF2; }
<VAR_DEF><<EOF>>						{ return tokens.EOF2; }

.   { console.error("MISMATCH: '" + yytext + "', state: " + this.topState()); 
        console.error("   yytext: " + JSON.stringify(yytext));
        console.error("   _input: " + JSON.stringify(this._input));
}


