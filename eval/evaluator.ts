import {Integer, NullObj, ErrorObj, BoolObj, ReturnObj, FunctionObj, Obj, ObjTypes} from '../object/object';
import {Expression, Identifier, IfExpression, NodeItem, Program, ReturnStatement} from "../ast/ast";
import {Environment, NewEnclosedEnvironment} from "../object/environment";

let NULL = new NullObj();
let TRUE = new BoolObj(true);
let FALSE = new BoolObj(false);

export class Evaluator {
    constructor() {

    }

    Eval(node: any, env: Environment): Obj {
        switch (node.constructor.name) {
            case 'Program':
                return this.evalProgram(node, env);
            case 'BlockStatement':
                return this.evalBlockStatement(node, env);
            case 'ExpressionStatement':
                return this.Eval(node.Expression, env);
            case 'ReturnStatement':
                var val = this.Eval(node.ReturnValue, env);
                if (this.isError(val)) {
                    return val
                }
                return new ReturnObj(val);
            case 'LetStatement':
                var val = this.Eval(node.Value, env);
                if (this.isError(val)) {
                    return val
                }
                env.set(node.Name.Value, val);
            case 'IntegerLiteral':
                return new Integer(node.Value);
            case 'PrefixExpression':
                var right = this.Eval(node.Right, env);
                if (this.isError(right)) {
                    return right
                }
                return this.evalPrefixExpression(node.Operator, right);
            case 'InfixExpression':
                let left = this.Eval(node.Left, env);
                if (this.isError(left)) {
                    return left;
                }
                var right = this.Eval(node.Right, env);
                if (this.isError(right)) {
                    return right;
                }
                return this.evalInfixExpression(node.Operator, left, right);
            case 'IfExpression':
                return this.evalIfExpression(node, env);
            case 'Identifier':
                return this.evalIdentifier(node, env);
            case 'FunctionLiteral':
                let params = node.Parameters;
                let body = node.Body;
                return new FunctionObj(params, body, env);
            case 'CallExpression':
                let func = this.Eval(node.Function, env);
                if (this.isError(func)) {
                    return func
                }
                let args = this.evalExpressions(node.Arguments, env)
                if (args.length == 1 && this.isError(args[0])) {
                    return args[0]
                }
                return this.applyFunction(func, args);
        }
    }

    isError(obj: Obj): boolean {
        if (obj !== undefined) {
            return obj.Type() == ObjTypes.ERROR_OBJ
        }
        return false
    }

    newError(err: string) {
        return new ErrorObj(err);
    }

    evalBlockStatement(block, env) {
        let result = new Obj();
        for (let statement of block.Statements) {
            let result = this.Eval(statement, env);
            if (result) {
                let rt = result.Type();
                if (rt == ObjTypes.RETURN_VALUE_OBJ || rt == ObjTypes.ERROR_OBJ) {
                    return result
                }
            }
        }
        return result;
    }

    evalProgram(program: Program, env: Environment): Obj {
        let result = new Obj();
        for (let statement of program.Statements) {
            result = this.Eval(statement, env);
            let rt = result.Type();
            switch (rt) {
                case 'ReturnValue':
                    return result;
                case 'Error':
                    return result;
            }
        }
        return result;
    }

    evalPrefixExpression(operator: string, right: Obj): Obj {
        switch (operator) {
            case "!":
                return this.evalBangOperatorExpression(right)
            case "-":
                return this.evalMinusPrefixOperatorExpression(right)
            default:
                return this.newError(`unknown operator: ${operator}, ${right.Type()}`)
        }
    }

    evalBangOperatorExpression(right: Obj): Obj {
        switch (right) {
            case TRUE:
                return FALSE
            case FALSE:
                return TRUE
            case NULL:
                return TRUE
            default:
                return FALSE
        }
    }

    evalMinusPrefixOperatorExpression(right: any): Obj {
        if(right.Type() != ObjTypes.INTEGER_OBJ){
            return this.newError(`unknown operator: -${right.Type()}`)
        }

        let value = right.Value;
        return new Integer(-value);
    }

    evalInfixExpression(operator:string, left,right):Obj {
        if(left.Type() == ObjTypes.INTEGER_OBJ && right.Type() == ObjTypes.INTEGER_OBJ) {
            return this.evalIntegerInfixExpression(operator, left, right)
        }
        if(operator == "==") {
            return this.nativeBoolToBooleanObject(left == right)
        }
        if(operator == "!=") {
            return this.nativeBoolToBooleanObject(left != right)
        }
        if(left.Type() != right.Type()) {
            return this.newError(`type mismatch: ${left.Type()}, ${operator}, ${right.Type()}`)
        }
        return this.newError(`unknown operator:  ${left.Type()}, ${operator}, ${right.Type()}`)
    }

    evalIntegerInfixExpression(operator:string,left,right ) : Obj{
        let leftVal = left.Value;
        let rightVal = right.Value;
        switch (operator) {
            case "+":
                return new Integer(leftVal + rightVal)
            case "-":
                return new Integer(leftVal - rightVal)
            case "*":
                return new Integer(leftVal * rightVal)
            case "/":
                return new Integer(leftVal / rightVal)
            case "<":
                return this.nativeBoolToBooleanObject(leftVal < rightVal)
            case ">":
                return this.nativeBoolToBooleanObject(leftVal > rightVal)
            case "==":
                return this.nativeBoolToBooleanObject(leftVal == rightVal)
            case "!=":
                return this.nativeBoolToBooleanObject(leftVal != rightVal)
            default:
                return this.newError(`unknown operator: 
                    ${left.Type()}, ${operator}, ${right.Type()}`)
        }
    }
    evalIfExpression(ie:IfExpression, env) :Obj{
        let condition = this.Eval(ie.Condition, env);
        if(this.isError(condition)) return condition;
        if(this.isTruthy(condition)){
            return this.Eval(ie.Consequence, env);
        } else if(ie.Alternative !== null) {
            return this.Eval(ie.Alternative, env);
        }else {
            return NULL;
        }

    }
    isTruthy(obj: Obj):boolean {
        switch (obj) {
            case NULL:
                return false;
            case TRUE:
                return true;
            case FALSE:
                return false;
            default:
                return true;
        }
    }
    nativeBoolToBooleanObject(input: boolean) {
        if(input) {
            return TRUE;
        }
        return FALSE;
    }


    evalIdentifier(node:Identifier, env):Obj {
        let val = env.get(node.Value);
        if(val === undefined) {
            return this.newError(`identifier not found: ${node.Value}`);
        }
        return val;
    }

    evalExpressions(exps: [Expression], env) {
        let result = [];
        for(let e of exps) {
            let evaluated = this.Eval(e, env);
            if(this.isError(evaluated)) {
                // TODO:
                return [new Obj(evaluated)]
            }
            result.push(evaluated)
        }
        return result;
    }

    applyFunction(fn, args) {
        // TODO: 如果fn不是function
        let extendedEnv = this.extendFunctionEnv(fn, args);
        let evaluated = this.Eval(fn.Body, extendedEnv);
        return this.unwrapReturnValue(evaluated)
    }
    extendFunctionEnv(fn, args) {
        let env = NewEnclosedEnvironment(fn.Env);
        for(let i in fn.Parameters) {
            let param = fn.Parameters[i];
            env.set(param.Value, args[i])
        }
        return env;
    }
    unwrapReturnValue(obj) {
        return obj.Value !== undefined?obj.Value:obj;
    }
}