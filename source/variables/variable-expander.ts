
const TOKENS = "${}()";
class StringLexer
{
    private next: number = 0;
    constructor(readonly src: string)
    {}
    hasMore(...terminators: string[]): boolean
    {
        // EOF:
        if (this.next >= this.src.length)
            return false;
            
        terminators = terminators || [];
        var nextChar = this.src[this.next];

        return (terminators.indexOf(nextChar) < 0);
    }

    isToken(s: string): boolean
    {
        return (TOKENS.indexOf(s) >= 0);
    }
    nextToken(): string
    {
        if (!this.src)
            return null;
            
        // EOF:
        if (this.next >= this.src.length)
            return null;
            
        var nextChar = this.src[this.next];

        if (this.isToken(nextChar))
        {
            this.next++;
            return nextChar
        }

        var textStart = this.next;
        for (var nextToken = textStart+1; nextToken<this.src.length; nextToken++)
        {
            if (this.isToken(this.src[nextToken]))
            {
                this.next = nextToken;
                return this.src.substring(textStart, nextToken);
            }
        }

        this.next = this.src.length;
        return this.src.substring(textStart, this.next);
    }
    nextChar(): string
    {
        if (!this.src)
            return null;
            
        // EOF:
        if (this.next >= this.src.length)
            return null;
            
        return this.src[this.next++];
    }
}

export function resolveString(
    value: string, 
    getValue: (variableName: string) => string,
    invokeFunction: (functionName: string, params: string[]) => string
): string
{
    if (value===null || value===undefined)
    {
        return null;
    }

    if (value.indexOf('$') < 0)
    {
        return value;
    }
    var self = this;
    var lexer = new StringLexer(value);
    var res= expandString(lexer, getValue);
    //log.info("EXPAND '" + value + "' => '" + res + "'");
    return res;
}

/**
 * 'xxxx${var1}xxxx{var2}xxxx...'
 * @param src 
 * 
 */
function expandString(src: StringLexer, getValue: (string) => string, ...terminators: string[]): string
{
    //_traceenter("Resolving '" + src.src + "'...");
    var res = "";
    while (src.hasMore(...terminators))
    {
        var token = src.nextToken();

        if (token==='$')
        {
            res += expandVariable(src, getValue);
        }
        else
        {
            res += token;
        }
    }

    return res;
}
/**
 * 'abc$(myvar)def'
 *      ^
 * next token
 * @param src 'abc$(myvar)def'
 * @param getValue 
 */
function expandVariable(src: StringLexer, getValue: (string) => string): string
{
    var token = src.nextChar();

    if (token === '$')
    {
        return '$';
    }

    if (token === '{')
    {
        var name = expandString(src, getValue, '}', ')');
        var terminator = src.nextToken();

        if (terminator === ')')
        {
            // warn about mismatch?
        }
        else if (terminator !== '}')
        {
            // error
        }

        return getValue(name) || '';
    }

    if (token === '(')
    {
        var name = expandString(src, getValue, ')', '}');
        var terminator = src.nextToken();

        if (terminator === '}')
        {
            // warn about mismatch?
        }
        else if (terminator !== ')')
        {
            // error
        }

        return getValue(name) || '';
    }

    return getValue(token) || '';
}
