import { Token, TokenType, Tokens } from '../token/token';
import { Lexer } from '../lexer/lexer';
const colors = require('colors');

import {
    Program,
    Statement,
    LetStatement,
    ExpressionStatement,
    Expression,
    Identifier,
    IntegerLiteral,
    PrefixExpression,
    BooleanItem,
    IfExpression,
    BlockStatement,
    FunctionLiteral,
    InfixExpression,
    ReturnStatement,
    CallExpression
} from '../ast/ast';


enum Level {
    LOWEST,
    EQUALS,     // ==
    LESSGREATER,// > or <
    SUM,         // +
    PRODUCT,     // *
    PREFIX,      // -X or !X
    CALL,
}
const precedences = {
    [Tokens.EQ]: Level.EQUALS,
    [Tokens.NOT_EQ]: Level.EQUALS,
    [Tokens.LT]: Level.LESSGREATER,
    [Tokens.GT]: Level.LESSGREATER,
    [Tokens.PLUS]: Level.SUM,
    [Tokens.MINUS]: Level.SUM,
    [Tokens.SLASH]: Level.PRODUCT,
    [Tokens.ASTERISK]: Level.PRODUCT,
    [Tokens.LPAREN]: Level.CALL,
}
type prefixParseFn = () => {};
type infixParseFn = (Expression) => {};

export class Parser {
    l
    errors = []
    curToken
    peekToken
    prefixParseFns = {}
    infixParseFns = {}
    constructor(l: Lexer) {
        this.l = l;
        this.errors = [];
        // 前缀
        this.registerPrefix(Tokens.IDENT, this.parseIdentifier)
        this.registerPrefix(Tokens.INT, this.parseIntegerLiteral)
        this.registerPrefix(Tokens.BANG, this.parsePrefixExpression)
        this.registerPrefix(Tokens.MINUS, this.parsePrefixExpression)
        this.registerPrefix(Tokens.TRUE, this.parseBoolean)
        this.registerPrefix(Tokens.FALSE, this.parseBoolean)
        this.registerPrefix(Tokens.LPAREN, this.parseGroupedExpression)
        this.registerPrefix(Tokens.IF, this.parseIfExpression)
        this.registerPrefix(Tokens.FUNCTION, this.parseFunctionLiteral)
        // 中缀
        this.registerInfix(Tokens.PLUS, this.parseInfixExpression)
        this.registerInfix(Tokens.MINUS, this.parseInfixExpression)
        this.registerInfix(Tokens.SLASH, this.parseInfixExpression)
        this.registerInfix(Tokens.ASTERISK, this.parseInfixExpression)
        this.registerInfix(Tokens.EQ, this.parseInfixExpression)
        this.registerInfix(Tokens.NOT_EQ, this.parseInfixExpression)
        this.registerInfix(Tokens.LT, this.parseInfixExpression)
        this.registerInfix(Tokens.GT, this.parseInfixExpression)

        this.registerInfix(Tokens.LPAREN, this.parseCallExpression)
        this.nextToken();
        this.nextToken();
        return this;
    }

    public Errors() {
        return this.errors;
    }
    public nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.l.nextToken();
    }
    public curTokenIs(t: TokenType): boolean {
        return this.curToken.Type == t;
    }
    public peekTokenIs(t: TokenType): boolean {
        return this.peekToken.Type == t;
    }
    public peekError(t: TokenType) {
        const err = `expect token ${t} but got ${this.peekToken.Type}`;
        this.errors.push(err);
    }

    public expectPeek(t: TokenType): boolean {
        if (this.peekTokenIs(t)) {
            this.nextToken();
            return true;
        } else {
            this.peekError(t);
            return false;
        }
    }
    public ParseProgram() {
        let program = new Program();
        while (!this.curTokenIs(Tokens.EOF)) {
            let stmt = this.parseStatement();
            if (stmt !== null) {
                program.Statements.push(stmt);
            }
            this.nextToken();
        }
        return program;
    }

    public parseStatement() {
        switch (this.curToken.Type) {
            case Tokens.LET:
                return this.parseLetStatement();
            case Tokens.RETURN:
		        return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    public parseReturnStatement() {
        let stmt = new ReturnStatement();
        stmt.Token = this.curToken.Token;
        this.nextToken();
        stmt.ReturnValue = this.parseExpression(Level.LOWEST);
        if(!this.peekTokenIs(Tokens.SEMICOLON)){
            this.nextToken();
        }
        return stmt;
    }

    public parseLetStatement() {
        let stmt = new LetStatement();
        stmt.Token = this.curToken;
        if (!this.expectPeek(Tokens.IDENT)) {
            return null;
        }

        stmt.Name = new Identifier();
        stmt.Name.Token = this.curToken;
        stmt.Name.Value = this.curToken.Value;
        
        if (!this.expectPeek(Tokens.ASSIGN)) {
            return null;
        }

        this.nextToken();
        stmt.Value = this.parseExpression(Level.LOWEST);

        if (this.peekTokenIs(Tokens.SEMICOLON)) {
            this.nextToken()
        }

        return stmt;
    }

    public parseCallExpression(fn) {
        let exp = new CallExpression();
        exp.Token = this.curToken;
        exp.Function = fn;
        exp.Arguments = this.parseCallArguments();
        return exp
    }
    public parseCallArguments() {
        let args = [];
        if(this.peekTokenIs(Tokens.RPAREN)){
            this.nextToken();
            return args;
        }
        this.nextToken();
        args.push(this.parseExpression(Level.LOWEST));
        while(this.peekTokenIs(Tokens.COMMA)) {
            this.nextToken();
            this.nextToken();
            args.push(this.parseExpression(Level.LOWEST));
        }
        if(!this.peekTokenIs(Tokens.RPAREN)){
            return null
        }
        return args;
    }
    public parseIdentifier() {
        let identifier =  new Identifier();
        identifier.Token = this.curToken;
        identifier.Value = this.curToken.Literal;
        return identifier;
    }

    public parseIntegerLiteral() {
        let lit = new IntegerLiteral();
        lit.Token = this.curToken.Token;
        let value = Number(this.curToken.Literal);
        if (Number.isNaN(value)) {
            let err = `could not parse ${this.curToken.Literal} as integer`;
            this.errors.push(err);
            return null;
        }
        lit.Value = value;
        return lit;
    }

    public parseExpressionStatement() {
        let stmt = new ExpressionStatement();
        stmt.Expression = this.parseExpression(Level.LOWEST);
        if (this.peekTokenIs(Tokens.SEMICOLON)) {
            this.nextToken()
        }
        return stmt;
    }

    public parseExpression(precedence: number) {
        let prefix = this.prefixParseFns[this.curToken.Type];
        if (prefix === null) {
            this.noPrefixParseFnError(this.curToken.Type);
            return null;
        }
        let leftExp = prefix.call(this);
        while (!this.peekTokenIs(Tokens.SEMICOLON) && precedence < this.peekPrecedence()) {
            let infix = this.infixParseFns[this.peekToken.Type];
            if (infix === null) {
                return leftExp;
            }
            this.nextToken();
            leftExp = infix.call(this,leftExp);
        }
        return leftExp;
    }

    public parsePrefixExpression() {
        let expression = new PrefixExpression(this.curToken.Token, this.curToken.Literal);
        this.nextToken();
        expression.Right = this.parseExpression(Level.PREFIX);
        return expression;
    }

    public noPrefixParseFnError(t: TokenType) {
        const err = `no prefix parse function for ${t}`;
        this.errors.push(err);
    }

    public peekPrecedence() {
        if (precedences.hasOwnProperty(this.peekToken.Type)) {
            return precedences[this.peekToken.Type];
        }
        return Level.LOWEST;
    }

    public curPrecedence() {
        if (precedences.hasOwnProperty(this.curToken.Type)) {
            return precedences[this.curToken.Type];
        }
        return Level.LOWEST;
    }
    public parseBoolean() {
        return new BooleanItem(this.curToken.Token, this.curToken.Literal);
    }

    public registerPrefix(t: TokenType, fn: prefixParseFn) {
        this.prefixParseFns[t] = fn;
    }
    public registerInfix(t: TokenType, fn: infixParseFn) {
        this.infixParseFns[t] = fn;
    }
    public parseGroupedExpression() {
        this.nextToken();
        let exp = this.parseExpression(Level.LOWEST);
        if(!this.expectPeek(Tokens.RPAREN)) {
            return null;
        }
        return exp;
    }
    public parseIfExpression() {
        let expression = new IfExpression(this.curToken.Token);
        if(!this.expectPeek(Tokens.LPAREN)){
            return null;
        }
        this.nextToken();
        expression.Condition = this.parseExpression(Level.LOWEST);
        if(!this.expectPeek(Tokens.RPAREN)){
            return null;
        }
        if(!this.expectPeek(Tokens.LBRACE)){
            return null;
        }
        expression.Consequence = this.parseBlockStatement()
    }
    public parseBlockStatement() {
        let block = new BlockStatement();
        block.Token = this.curToken.Token;
        block.Statements = [];
        this.nextToken();
        while(!this.curTokenIs(Tokens.RBRACE) && !this.curTokenIs(Tokens.EOF)){
            let stmt = this.parseStatement();
            if(stmt !== null) {
                block.Statements.push(stmt);
            }
            this.nextToken();
        }
        return block;
    }
    
    public parseFunctionLiteral() {
        let lit = new FunctionLiteral();
        if(!this.expectPeek(Tokens.LPAREN)) {
            return null;
        }
        lit.Parameters = this.parseFunctionParameters();
        if(!this.expectPeek(Tokens.LBRACE)) {
            return null;
        }
        lit.Body =  this.parseBlockStatement();
        return lit;
    }

    public parseFunctionParameters() {
        let identifiers = [];
        if(this.peekTokenIs(Tokens.RPAREN)){
            this.nextToken();
            return identifiers;
        }
        this.nextToken();
        let ident = new Identifier();
        ident.Token = this.curToken.Token;
        ident.Value = this.curToken.Literal;
        identifiers.push(ident);
        while(this.peekTokenIs(Tokens.COMMA)) {
            this.nextToken();
            this.nextToken();
            let ident = new Identifier();
            ident.Token = this.curToken.Token;
            ident.Value = this.curToken.Literal;
            identifiers.push(ident)
        }
        if(this.expectPeek(Tokens.RPAREN)){
            return null;
        }
        return identifiers;
    }
    public parseInfixExpression(left) {
        let expression = new InfixExpression();
        expression.Token = this.curToken.Token;
        expression.Operator = this.curToken.Literal;
        expression.Left = left;
        let precedence = this.curPrecedence();
        this.nextToken();
        expression.Right = this.parseExpression(precedence);
        return expression;
    }
}