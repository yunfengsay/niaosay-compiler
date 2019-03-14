import { Lexer } from '../lexer/lexer';
import { expect } from 'chai';
import 'mocha';

describe('Lexer Token', () => {
    it('should return token list', () => {
        const input = "let id = 1;";
        const resultSouldBe = [
            { Type: 'LET', Literal: 'let' },
            { Type: 'IDENT', Literal: 'id' },
            { Type: 'ASSIGN', Literal: '=' },
            { Type: 'INT', Literal: '1' },
            { Type: 'SEMICOLON', Literal: ';' },
            { Type: 'EOF', Literal: 'EOF' },
        ];
        let lexer = new Lexer(input);
        let current_token = null;
        let result = [];
        while (current_token = lexer.nextToken()) {
            result.push(current_token);
            if (current_token.Literal == 'EOF') break;
        }
        expect(JSON.stringify(result)).to.equal(JSON.stringify(resultSouldBe));
    });
});