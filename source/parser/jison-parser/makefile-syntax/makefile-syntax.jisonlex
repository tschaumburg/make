%options multiline 
%{
const preprocessor = require("./preprocessor");
const tokens = require("./makefile-syntax-tokens");
const context = require("./parser-context");
const variables = require("../variables");
const utils = require("./makefile-syntax-utils");
const normalize = require("../../result/normalize");

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

%s INITIAL 
%s PREPROCESSOR PREPROCESSOR_LINEBREAKS PREPROCESSOR_COMMENTS PREPROCESSOR_VARIABLES 
%s PARSER PARSER_RULELINE PARSER_RULELINE_TARGETS RULETYPE TARGETPATTERNS PREREQUISITES PREREQPATTERNS ORDERONLIES PARSER_RECIPELINE ENDRULE INLINE_RECIPE INCLUDE COMMENT VAR_DEF VAR_VALUE VAR_DEF_END MACRO MACRO_VALUE INCLUDE_NAME


safechar     [^\r\n\s:#|:\\]
escapedchar  (?:\\[\x20:\t|\\])
basename	(?:(?:{safechar}|{escapedchar})+)
dirname	    (?:(?:{safechar}|{escapedchar})+)
separator   [/\\]
path        (?:{separator}*(?:{dirname}{separator}+)*)
filename    (?:{path}?{basename})

spc         [ \t]*
eol         (?:[\r]?[\n])
esc_eol     (?:[\\]{eol})
non_eol     {esc_eol}|[^\r\n]
restofline  [^\r\n]*(?={eol})

hash        [#]
esc_hash    (?:[\]{hash})
non_hash    (?:{esc_hash}|{esc_eol}|([\][\])|[^#\r\n\])

variable	(?:[^\s=:?+!])+
varname	    (?:[^\s=:?+!])+
recipe		(?:[^\n\r]*)

shared_plainchar       [^# :;|\r\n]
shared_escapedchar     (?:\\[ #%:;\\|])
shared_char            (?:{shared_plainchar}|{shared_escapedchar})
shared_terminator      (?:[#\x20:;|\r\n]|$|<<EOF>>)
shared                 {target_char}+

target_plainchar       [^# :;|\r\n]
target_escapedchar     (?:\\[ #%:;\\|])
target_char            (?:{target_escapedchar}|{target_plainchar})
target_terminator      (?:[#\x20:;\r\n]|$|<<EOF>>)
target                 {target_char}+

prereq_plainchar       [^# :;\r\n]
prereq_escapedchar     (?:\\[ #%:;\\|])
prereq_char            (?:{prereq_plainchar}|{prereq_escapedchar})
prereq_terminator      (?:[#\x20:;|\r\n]|$|<<EOF>>)
prereq                 {prereq_char}+

orderonly_plainchar       [^# :;|\r\n]
orderonly_escapedchar     (?:\\[ #%:;\\|])
orderonly_char            (?:{orderonly_plainchar}|{orderonly_escapedchar})
orderonly_terminator      (?:[#\x20:;|\r\n]|$|<<EOF>>)
orderonly                 {prereq_char}+

targetlist_terminator      (?:[#%:;|\r\n]|$)
targetlist_char            (?:{target_char}|[ ])
targetlist                 {targetlist_char}+(?={targetlist_terminator})

prereq_terminator          (?:[#%:;|\r\n]|$)
prereq_char                (?:{target_char}|[ ])
prereqlist                     {prereq_char}+(?={prereq_terminator})

orderonly_terminator      (?:[#%:;|\r\n]|$)
orderonly_char            (?:{target_char}|[ ])
orderonlylist                 {orderonly_char}+(?={orderonly_terminator})

targetpatternlist       (?:{targetlist})

targets          {targetlist}
targetpatterns   (?:{spc}[:]{spc}){targetpatternlist}
prereqs          (?:{spc}[:]{spc}){prereqlist}
orderonlies      (?:{spc}[|]{spc}){orderonlylist}
recipeline       (?:{spc}[;]{spc}){restofline}


colon                (?:{spc}[:]{spc})
pipe                 (?:{spc}[|]{spc})
semicolon            (?:{spc}[;]{spc})

defineStart  ^('define'{spc}{varname}{spc}?)
defineEnd    ([ \t]*{eol})


xruleline    {restofline}
xtargets        (?:(?:(?:\\[%:;# \\|])|[^:;#\r\n\x00|\\%])*)
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
        this.begin("PARSER");
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

<PARSER>^(?:(?:{xtargets}{colon})|(?:.{restofline}))      
    %{
        if (yytext.startsWith("\t"))
        {
            this.begin("PARSER_RECIPELINE");
            this.unput(yytext);
        }
        else
        {
            this.begin("PARSER_RULELINE");
            this.unput(yytext);
        }
    %}
    
/***************************************************************
 * Rule definitions:
 * =================
 * 
 **************************************************************/
<PARSER_RULELINE>{xruleline}                  { this.unput(resolveVariables(yytext)); this.begin("PARSER_RULELINE_TARGETS"); }
<PARSER_RULELINE_TARGETS>{xtargets}           { this.begin("RULETYPE"); return tokens.TARGETS; }
<RULETYPE>(?={colon}{xtargetpatterns}{colon}) { this.begin("TARGETPATTERNS"); }
<RULETYPE>(?={colon}{xprerequisites})         { this.begin("PREREQUISITES"); }
<TARGETPATTERNS>{colon}{xtargetpatterns}      { this.begin("PREREQPATTERNS"); trimColon(); return tokens.TARGETPATTERNS; }
<PREREQPATTERNS>(?:{colon}{xprereqpatterns})? { this.begin("ORDERONLIES"); trimColon(); return tokens.PREREQPATTERNS; }
<PREREQUISITES>{colon}{xprerequisites}        { this.begin("ORDERONLIES"); trimColon(); return tokens.PREREQUISITES; }
<ORDERONLIES>(?:{pipe}{xorderonlies})?        { this.begin("INLINE_RECIPE"); trimPipe(); return tokens.ORDERONLIES; }
<INLINE_RECIPE>((?:{semicolon}{restofline})?) { this.begin("ENDRULE"); return tokens.INLINE_RECIPE; }
<ENDRULE>{eol}                                                 { this.begin("INITIAL"); return tokens.EOL; }

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


