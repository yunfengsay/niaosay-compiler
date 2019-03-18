import {Lexer} from '../lexer/lexer';
import { Parser } from '../parser/parser';
import { expect } from 'chai';
import 'mocha';
const fs = require('fs');

describe('Parse Let', () => {
    it('let', () => {
        const input = "let id = 1;id;print()";
        let tokens = new Lexer(input);
        let parse = new Parser(tokens);
        let result = parse.ParseProgram();
        fs.writeFile('./result/parse_test.json', JSON.stringify(result), () => {});
        // expect(result).to.equal();
    });
});