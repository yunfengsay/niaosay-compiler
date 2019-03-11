import { Token, Tokens } from '../token/token';
const colors = require('colors');

export class Lexer {
    input: string;
    position: number;
    readPosition: number;
    ch: string;

    constructor(input) {
        this.input = input;
        this.readPosition = 0;
        this.readChar();
        return this;
    }

    public readChar() {
        if (this.readPosition > this.input.length) {
            this.ch = 'EOF';
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    }
    private isLetter(ch: string): boolean {
        if(ch === 'EOF') return false;
        return /[a-zA-Z-]/.test(ch)
    }

    private isDigit(ch: string): boolean {
        return /[0-9]/.test(ch)
    }

    public peekChar() {
        if (this.readPosition > this.input.length) {
            return "EOF";
        } else {
            return this.input[this.readPosition];
        }
    }

    public newToken(tokenType: string, ch: string): Token {
        return <Token>{ Type: tokenType, Literal: ch }
    }

    public readIdentifier(): string {
        let position = this.position
        while (this.isLetter(this.ch)) {
            this.readChar()
        }
        return this.input.slice(position, this.position)
    }

    public readNumber(): string {
        let position = this.position
        while (this.isDigit(this.ch)) {
            this.readChar()
        }
        return this.input.slice(position, this.position)
    }

    public nextToken() {
        let tok: Token;
        this.skipWhiteSpace();
        switch (this.ch) {
            case '=':
                if (this.peekChar() == '=') {
                    this.readChar();
                    let literal = '==';
                    tok = <Token>{ Type: Tokens.EQ, Literal: literal }
                } else {
                    tok = this.newToken(Tokens.ASSIGN, this.ch)
                }
                break
            case '+':
                tok = this.newToken(Tokens.PLUS, this.ch)
                break
            case '-':
                if (this.peekChar() == '=') {
                    this.readChar();
                    let literal = '!=';
                    tok = <Token>{ Type: Tokens.NOT_EQ, Literal: literal }
                } else {
                    tok = this.newToken(Tokens.BANG, this.ch)
                }
                break
            case '/':
                tok = this.newToken(Tokens.SLASH, this.ch)
                break
            case '*':
                tok = this.newToken(Tokens.ASTERISK, this.ch)
                break
            case '<':
                tok = this.newToken(Tokens.LT, this.ch)
                break
            case '>':
                tok = this.newToken(Tokens.GT, this.ch)
                break
            case ';':
                tok = this.newToken(Tokens.SEMICOLON, this.ch)
                break
            case ',':
                tok = this.newToken(Tokens.COMMA, this.ch)
                break
            case '{':
                tok = this.newToken(Tokens.LBRACE, this.ch)
                break
            case '}':
                tok = this.newToken(Tokens.RBRACE, this.ch)
                break
            case '(':
                tok = this.newToken(Tokens.LPAREN, this.ch)
                break
            case ')':
                tok = this.newToken(Tokens.RPAREN, this.ch)
                break
            case 'EOF':
                tok = this.newToken(Tokens.EOF, "EOF")
                break
            default:
                if (this.isLetter(this.ch)) {
                    let type = Token.LookupIdent(this.ch)
                    let literal = this.readIdentifier()
                    tok = this.newToken(type, literal)
                    return tok
                } else if (this.isDigit(this.ch)) {
                    let type = Tokens.INT
                    let literal = this.readNumber()
                    tok = this.newToken(type, literal)
                    return tok
                } else {
                    if(this.ch === 'EOF') {
                        tok = this.newToken(Tokens.EOF, this.ch)

                    }else {
                        tok = this.newToken(Tokens.ILLEGAL, this.ch)
                    }
                }
        }

        this.readChar()
        return tok
    }
    private skipWhiteSpace() {
        while (this.ch == ' ' || this.ch == '\t' || this.ch == '\n' || this.ch == '\r') {
            this.readChar()
        }
    }
}

