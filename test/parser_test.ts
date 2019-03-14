import {Lexer} from '../lexer/lexer';
import { Parser } from '../parser/parser';
import { expect } from 'chai';
import 'mocha';

describe('Parse Let', () => {
    it('let', () => {
        const input = "let id = 1;";
        let tokens = new Lexer(input);
        let parse = new Parser(tokens);
        let result = parse.ParseProgram();
        expect(result).to.equal();
    });
});