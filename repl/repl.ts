import readline from 'readline-promise';
import {Lexer} from '../lexer/lexer';
import { Parser } from '../parser/parser';
const colors = require('colors');
const keypress = require('keypress');
const cp = require('child_process');
const child = cp.spawn('bash');
const stdin = process.stdin; 
// keypress(stdin); 
// stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
// stdin.on('keypress', function (ch, key) {
//     console.log('got "keypress"', key);
//     if (key && key.ctrl && key.name == 'c') {
//       process.stdin.pause();
//     }
// });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async function(line){
    await line;
})

const PROMPT = '>> ';

export async function  Start() {
    while(1){
        try{
            let input = await rl.questionAsync(PROMPT);
            let lexer = new Lexer(input);
            let parser = new Parser(lexer);
            let program = parser.ParseProgram();
            console.log(program);
            if(parser.Errors().length !== 0 ) {
                printParserErrors(parser.Errors())
                continue;
            }  
    
        }catch(e){
            throw(e)
            continue;
        }

        // let current_token = null;
        // while(current_token = lexer.nextToken()) {
        //     console.log(current_token);
        //     if(current_token.Literal == 'EOF') break;
        // }
    }
}


function printParserErrors(errors = []) {
    while(errors.length){
        console.log(colors.red(errors.pop()))
    }
}