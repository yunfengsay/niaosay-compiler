import readline from 'readline-promise';
import {Lexer} from '../lexer/lexer';
process.stdin.resume();
process.stdin.setEncoding('utf8');

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
        let input = await rl.questionAsync(PROMPT);
        let lexer = new Lexer(input);
        // lexer.nextToken()
        let current_token = null;
        console.log(lexer.nextToken())

        while(current_token = lexer.nextToken()) {
            console.log(current_token);
            if(current_token.Literal == 'EOF') break;
        }
    }
}
