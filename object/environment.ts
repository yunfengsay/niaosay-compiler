
export function NewEnclosedEnvironment(outer: Environment):Environment{
    let env = NewEnvironment();
    env.outer = outer;
    return env
}

export function NewEnvironment() :Environment{
    return new Environment();
}


export class  Environment {
    store: object
    outer: Environment
    constructor() {
        this.store = {};
        this.outer = null;
    }
    get(name: string) {
        return this.store[name];
    }
    set(name: string, val: Object) {
        this.store[name] = val;
        return val;
    }
}