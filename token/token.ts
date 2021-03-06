// type TokenType string;

export enum Tokens {
    ILLEGAL = "ILLEGAL",
    EOF     = "EOF",
    
	// Identifiers + literals
	IDENT = "IDENT", // add, foobar, x, y, ...
	INT   = "INT",   // 1343456

	// Operators
	ASSIGN   = "=",
	PLUS     = "+",
	MINUS    = "-",
	BANG     = "!",
	ASTERISK = "*",
	SLASH    = "/",

	LT = "<",
	GT = ">",

	EQ     = "==",
	NOT_EQ = "!=",

	// Delimiters
	COMMA     = ",",
	SEMICOLON = ";",

	LPAREN = "(",
	RPAREN = ")",
	LBRACE = "{",
	RBRACE = "}",
	LBRACKET = "[",
	RBRACKET = "]",

	// Keywords
	FUNCTION = "FUNCTION",
	LET      = "LET",
	TRUE     = "TRUE",
	FALSE    = "FALSE",
	IF       = "IF",
	ELSE     = "ELSE",
	RETURN   = "RETURN",
}
export type TokenType = string;
export type Literal = string;
// type Token = {
// 	Type,
// 	Literal
// }

export class Token {
    public static Type: TokenType;
	public static Literal: Literal;
	public static LookupIdent(ident:string):TokenType {
		if(keywords[ident]) {
			return keywords[ident]
		}
		return Tokens.IDENT
	}
}
var keywords = {
    'fn':   Tokens.FUNCTION,
    "let":    Tokens.LET,
	"true":   Tokens.TRUE,
	"false":  Tokens.FALSE,
	"if":     Tokens.IF,
	"else":   Tokens.ELSE,
	"return": Tokens.RETURN,
}

type LetStatement = {
	Token: Token;
	Name: string
}