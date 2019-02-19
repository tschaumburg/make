/***************************************************************
 * Rule definitions:
 * =================
 * The syntax for a rule line is:
 *
 *    targets ':' [prerequisites] ['|' orderonlies] [';' recipe] <eol>?
 *
 * or
 *
 *    targets ':' targetpatterns ':' [prereqpatterns] ['|' orderonlies] [';' recipe] <eol>?
 * 
 * All attempts to write a stateless tokenizer have led to
 * horribly complex regular expressions - so instead we have
 * thrown statelessnes aside and embraced states fully: every
 * term and decision point have been given its own lexer state.
 * 
 * 
 * 
 *                        |
 *                        | next inpur: full rule line 
 *                        |             w/ variable refs
 *                        V
 *              +-------------------+
 *              |     RULELINE      |
 *              |-------------------|
 *              | resolve variables |
 *              | and unput() result|
 *              +-------------------+
 *                        |
 *                        | next input: full rule line 
 *                        |             w/o variable refs:
 *                        |               targets ...
 *                        v
 *              +-------------------+
 *              |     TARGETS       |
 *              |-------------------|
 *              | resolve variables |
 *              +-------------------+
 *                        |
 *                        | yytext: full rule line w/o variable refs
 *                        |
 *                        v
 *           +------------------------+
 *           |        RULETYPE        |
 *           |------------------------|
 *           | use regexp look-ahead  |
 *           | to determine rule type |
 *           +------------------------+
 *                       |
 *           +-----------+------------+
 *           |                        |
 *           |                        v
 *           |             +--------------------+
 *           |             |   TARGETPATTERNS   |
 *           |             |--------------------|
 *           |             | '.' targetpatterns |
 *           v             +--------------------+
 * +-------------------+             |
 * |   PREREQUISITES   |             |
 * | ':' prerequisites |             |
 * +-------------------+             V
 *           |             +--------------------+
 *           |             |   PREREQPATTERNS   |
 *           |             |--------------------|
 *           |             | ':' prereqpatterns |
 *           |             +--------------------+
 *           |                       |
 *           +-------+   +-----------+
 *                   |   |
 *                   V   V
 *              +-------------+
 *              | ORDERONLIES |
 *              +-------------+
 *
 *
 *            +-------------+
 *              INLINE_RECIPE
 *            +-------------+
 *
 *
 *            +-------------+
 *                ENDRULE
 *            +-------------+
 **************************************************************/
