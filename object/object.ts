

export enum ObjTypes {
    NULL_OBJ  = "NULL",
    ERROR_OBJ = "ERROR",
    INTEGER_OBJ = "INTEGER",
    BOOLEAN_OBJ = "BOOLEAN",
    RETURN_VALUE_OBJ = "RETURN_VALUE",
    FUNCTION_OBJ = "FUNCTION",
}


export class Obj {
    type: string
    constructor(val?){

    }
    Type():string {
        return this.type
    }
}

export class Integer extends Obj{
    type = ObjTypes.INTEGER_OBJ;
    public Value: number;
    constructor(val) {
        super();
        this.Value = val;
    }
}
export class NullObj extends Obj{
    type = ObjTypes.NULL_OBJ;
}
export class ErrorObj extends Obj{
    type = ObjTypes.ERROR_OBJ;
    Message
    constructor(err) {
        super();
        this.Message = err;
    }
}
export class BoolObj extends Obj{
    type = ObjTypes.BOOLEAN_OBJ;
    public Value
    constructor(val) {
        super();
        this.Value = val;
    }
}
export class ReturnObj extends Obj{
    public Value: Obj;
    constructor(val) {
        super();
        this.Value = val;
    }
    type = ObjTypes.RETURN_VALUE_OBJ;
}
export class FunctionObj extends Obj{
    type = ObjTypes.FUNCTION_OBJ;
    Parameters
    Body
    Env
    constructor(params, body, env) {
        super();
        this.Parameters = params;
        this.Body = body;
        this.Env = env;
    }
}
