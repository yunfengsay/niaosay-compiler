import { Token } from "../token/token";

export class NodeItem {
    node
    public TokenLiteral(): string {
        return this.node.Token.Literal
    }
}

export class Statement extends NodeItem {
    statementNode(){}
}


export class Expression extends NodeItem {
    expressionNode(){}
}

export class Program extends NodeItem{
    Statements = []
}

export class Identifier {
    Token:Token;
    Value:string;
}

export class IntegerLiteral {
    Token: Token;
    Value: number;
}

export class LetStatement {
	Token:Token; // the token.LET token
	Name: Identifier;
    Value: Expression;
}

export class ExpressionStatement extends Expression{
    Type:Token;
    Expression: Expression;
}

export class PrefixExpression extends Expression {
    Token:    Token // The prefix token, e.g. !
	Operator: string
    Right:    Expression
    constructor(token: Token, opearator: string) {
        super();
        this.Token = token;
        this.Operator = opearator;
    }
}

export class BooleanItem extends Expression {
    Token:    Token 
    Value: boolean
    constructor(token, value) {
        super();
        this.Token = token;
        this.Value = value;
    }
}

export class BlockStatement extends Statement {
    Token: Token
    Statements
}

export class  IfExpression extends Expression {
	Token:       Token
	Condition:   Expression
	Consequence: BlockStatement
    Alternative: BlockStatement
    constructor(token) {
        super();
        this.Token = token;
    }
}
export class FunctionLiteral extends Expression {
    Token:      Token
	Parameters // [Identifier]
	Body       // BlockStatement
}

export class InfixExpression extends Expression {
    Token: Token 
	Left:     Expression
	Operator: string
	Right:    Expression
}

export class ReturnStatement extends Expression{
	Token:      Token
	ReturnValue: Expression
}