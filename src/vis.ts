import { Log } from './data'

export enum Color {
    write = 'write',
    read = 'read',
    move = 'move',
    
    compute = 'compute',
    
    environment = 'environment',
    stack = 'stack',
    control = 'control',
    jump = 'jump',
    standard = 'standard',
    writeStorage = 'writeStorage'
};

export enum Shape {
    standard = 'standard',
    stack = 'stack',
    memory = 'memory',
    storage = 'storage',
    jump = 'jump',
    log = 'log',
    jumpdest = 'jumpdest',
    control = 'control',
    environment = 'environment'
};


export  interface DrawObject{
    x : number,
    y : number,
    op: string,
    opShort: string, // PUSH for all PUSH3, PUSH4
    label : string,
    stackDepth: number,
    color: Color,
    shape: Shape,
    callstack: number
    log: Log
}

const opcodeDB = {
    PUSH : {
        color: Color.read,
        shape: Shape.stack
    },
    STOP : {
        color: Color.control,
        shape: Shape.control,
        callstack: -1
    },
    ADDRESS : {
        color: Color.environment,
        shape: Shape.standard
    },
    BALANCE : {
        color: Color.environment,
        shape: Shape.standard
    },
    ORIGIN : {
        color: Color.environment,
        shape: Shape.standard
    },
    CALLER : {
        color: Color.environment,
        shape: Shape.standard
    },
    CALLVALUE : {
        color: Color.environment,
        shape: Shape.standard
    },
    CALLDATALOAD : {
        color: Color.environment,
        shape: Shape.standard
    },
    CALLDATASIZE : {
        color: Color.environment,
        shape: Shape.standard
    },
    CALLDATACOPY : {
        color: Color.environment,
        shape: Shape.standard
    },
    CODESIZE : {
        color: Color.environment,
        shape: Shape.standard
    },
    CODECOPY : {
        color: Color.environment,
        shape: Shape.standard
    },
    GASPRICE : {
        color: Color.environment,
        shape: Shape.standard
    },
    EXTCODESIZE : {
        color: Color.environment,
        shape: Shape.standard
    },
    EXTCODECOPY : {
        color: Color.environment,
        shape: Shape.standard
    },
    RETURNDATASIZE : {
        color: Color.environment,
        shape: Shape.standard
    },
    RETURNDATACOPY : {
        color: Color.environment,
        shape: Shape.standard
    },
    BLOCKHASH : {
        color: Color.environment,
        shape: Shape.standard
    },
    COINBASE : {
        color: Color.environment,
        shape: Shape.standard
    },
    TIMESTAMP : {
        color: Color.environment,
        shape: Shape.standard
    },
    NUMBER : {
        color: Color.environment,
        shape: Shape.standard
    },
    DIFFICULTY : {
        color: Color.environment,
        shape: Shape.standard
    },
    GASLIMIT : {
        color: Color.environment,
        shape: Shape.standard
    },
    POP : {
        color: Color.stack,
        shape: Shape.stack
    },
    DUP : {
        color: Color.stack,
        shape: Shape.stack
    },
    SWAP : {
        color: Color.stack,
        shape: Shape.stack
    },
    LOG : {
        color: Color.write,
        shape: Shape.log
    },
    CREATE : {
        color: Color.control,
        shape: Shape.control,
        callstack: 1
    },
    CREATE2 : {
        color: Color.control,
        shape: Shape.control,
        callstack: 1
    },
    CALL : {
        color: Color.control,
        shape: Shape.control,
        callstack: 1
    },
    CALLCODE : {
        color: Color.control,
        shape: Shape.control,
        callstack: 1
    },
    RETURN : {
        color: Color.control,
        shape: Shape.control,
        callstack: -1
    },
    DELEGATECALL : {
        color: Color.control,
        shape: Shape.control,
        callstack: 1
    },
    STATICCALL : {
        color: Color.control,
        shape: Shape.control,
        callstack: 1
    },
    REVERT : {
        color: Color.control,
        shape: Shape.control,
        callstack: -1
    },
    SELFDESTRUCT : {
        color: Color.control,
        shape: Shape.control,
        callstack: -1
    },
    MLOAD : {
        color: Color.standard,
        shape: Shape.memory,
    },
    MSTORE : {
        color: Color.standard,
        shape: Shape.memory,
    },
    MSTORE8 : {
        color: Color.standard,
        shape: Shape.memory,
    },
    SLOAD : {
        color: Color.standard,
        shape: Shape.storage,
    },
    SSTORE : {
        color: Color.writeStorage,
        shape: Shape.storage,
    },
    JUMP : {
        color: Color.jump,
        shape: Shape.jump,
    },
    JUMPI : {
        color: Color.jump,
        shape: Shape.jump,
    },
    PC : {
        color: Color.standard,
        shape: Shape.standard,
    },
    MSIZE : {
        color: Color.standard,
        shape: Shape.standard,
    },
    GAS : {
        color: Color.standard,
        shape: Shape.environment,
    },
    JUMPDEST : {
        color: Color.standard,
        shape: Shape.jumpdest,
    },
}


export function drawObjects(logs: Log[]){
    return logs.map((log)=>{
        const opShort = log.op.replace(/[0-9]/,'')
        let base = (opcodeDB as any)[log.op] as DrawObject
        if(!base){
            base = (opcodeDB as any)[opShort] as DrawObject
        }
        if(!base){
            base = {
                color: Color.standard,
                shape: Shape.standard, 
            } as DrawObject
        }
        let obj = Object.assign({}, base)
        obj.op = log.op
        obj.opShort = opShort
        obj.log = log
        obj.label = log.op
        return obj
    })
}


export function layout(objs: DrawObject[]){
    let xStart = 20
    let yStart = 20
    let xSpacing = 70
    let ySpacing = 16
    let x = xStart
    let y = yStart
    for(const obj of objs){
        obj.x = x
        obj.y = y
        y += ySpacing

        if(obj.label === "JUMP" || obj.label === "JUMPI" ){
            y += ySpacing
        }
        if(obj.callstack === -1){
            x += xSpacing * 2
            yStart -= ySpacing * 3
            y = yStart
        } else if(obj.callstack === 1){
            x += xSpacing * 2
            yStart += ySpacing * 3
            y = yStart
        } else if (y > yStart + 800){
            y = yStart
            x += xSpacing
        }
    }
}
