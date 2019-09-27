// data.ts - handles downloading transaction data and some decoding

export interface Log {
    op: string
    pc: number
    depth: number
    gas: number
    gasCost: number
    memory: string[]
    stack: string[]
}

export class TransactionData {
    txhash: string
    hasTrace: boolean
    hasTxInfo: boolean
    callbacks: any[]
    trace: any
    txInfo: any


    constructor(txhash: string) {
        this.txhash = txhash
        this.hasTrace = false
        this.hasTxInfo = false
        this.callbacks = []
    }

    async load() {
        const cached = window.localStorage[this.cacheKey()]
        if (cached) {
            console.log("Using cached transaction")
            this.trace = JSON.parse(cached)
            this.hasTrace = true
            this.processLogs(this.trace.result.structLogs)
            this.trigger()
            return
        }

        console.log("Fetching")
        let post = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "debug_traceTransaction",
            "params": [
                this.txhash,
                {
                    "disableStorage": true,
                    "disableMemory": false,
                    "disableStack": false,
                    "fullStorage": false
                }
            ]
        }

        let response = await fetch(
            "http://node.web3api.com:8545/",
            {
                "credentials": "omit",
                "headers": { "content-type": "application/json" },
                "referrerPolicy": "same-origin",
                "body": JSON.stringify(post),
                "method": "POST",
                "mode": "cors"
            }
        );
        let body = await response.json()
        this.hasTrace = true
        try{
            window.localStorage[this.cacheKey()] = JSON.stringify(body)
        } catch(err){

        }
        this.trace = body
        this.processLogs(this.trace.result.structLogs as Log[])
        this.trigger()
    }

    async loadTxInfo(){
        let post = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "eth_getTransactionByHash",
            "params": [
                this.txhash
            ]
        }

        let response = await fetch(
            "http://node.web3api.com:8545/",
            {
                "credentials": "omit",
                "headers": { "content-type": "application/json" },
                "referrerPolicy": "same-origin",
                "body": JSON.stringify(post),
                "method": "POST",
                "mode": "cors"
            }
        );
        this.txInfo = await response.json()
        console.log(this.txInfo)
        this.hasTxInfo = true
        this.trigger()
    }

    processLogs(logs: Log[]){
        for( const log in logs ){

        }
    }

    cacheKey() {
        return 'trace_' + this.txhash
    }

    on(fn: any) {
        this.callbacks.push(fn)
    }

    trigger() {
        this.callbacks.forEach((callback) => (callback as any)())
    }
}


export function targetAddress(log: Log) : string {
    return log.stack[log.stack.length - 2].replace(/^000000000000000000000000/, '')
}
export function callArgs(log: Log) : string {
    if(log.op == "DELEGATECALL"){
        const start = parseInt(log.stack[log.stack.length - 3], 16)
        const length = parseInt(log.stack[log.stack.length - 4], 16)
        return getMemory(log, start, length)
    } else if(log.op == "CALL"){
            const start = parseInt(log.stack[log.stack.length - 4], 16)
            const length = parseInt(log.stack[log.stack.length - 5], 16)
            return getMemory(log, start, length)
    } else {
        const start = parseInt(log.stack[log.stack.length - 4], 16)
        const length = parseInt(log.stack[log.stack.length - 5], 16)
        return getMemory(log, start, length)
    }
}

export function getMemory(log: Log, start: number, length: number): string {
    let out : string[] = []
    let remaining = length
    let slot = Math.floor(start / 32)
    let offset = start - slot * 32
    console.log('READ start', start, 'length', length, remaining, slot, offset)
    while(remaining > 0){
        const slotLen = Math.min(32 - offset, remaining)
        remaining -= slotLen
        // console.log('Slot',slot, offset, 'To read', slotLen, remaining)
        if(log.memory[slot] == undefined){
            console.log("READ PAST SLOT")
            break
        }
        out.push(log.memory[slot].substr(offset * 2, slotLen * 2))
        offset = 0
        slot += 1
    }
    return out.join("")
}

export function methodSig(log: Log){
    const args = callArgs(log)
    let methodSig = "?"
    if(args.length > 0){
        methodSig = args.substr(0,8)
    }
    return methodSig
}

function methodCache(){
    return JSON.parse(window.localStorage['_METHOD_CACHE'] || '{}')
}

function setMethodCache(key: string, value: any){
    const cache = methodCache()
    cache[key] = {value: value, date: new Date()}
    window.localStorage['_METHOD_CACHE'] = JSON.stringify(cache)
}



export async function methodName(hexSignature: string) : Promise<string[]> {
    if(hexSignature === '?'){
        return []
    }
    console.log(hexSignature)
    if(hexSignature === '00000000'){
        return ['CREATE']
    }
    
    const cache = methodCache()
    if(cache[hexSignature]){
        return cache[hexSignature].value
    }
    const url = 'https://www.4byte.directory/api/v1/signatures/?hex_signature='+hexSignature
    const request = await fetch(url)
    const body = await request.json()
    const names = body.results.map((x:any)=>x.text_signature)
    if(names.length > 0){
        setMethodCache(hexSignature, names)
    }
    return names
}