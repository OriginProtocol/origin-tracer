import { TransactionData, targetAddress, methodSig, methodName } from "./data";
import { layout, drawObjects } from "./vis"

export function drawTrace(txData: TransactionData){
    console.log("DRAW")

    let nextCallMethod : string | undefined = undefined
    let nextCallAddress : string | undefined = undefined

    const nodes = drawObjects(
        txData.trace.result.structLogs
      )
    layout(nodes)

    const area = document.getElementById("traceArea")
    if(area === null) {
        console.error('No area to draw in')
        return
    }
    for(const node of nodes) {
        const el = document.createElement("div");
        el.className = 'op'
        el.innerText = node.label
        el.style.left = node.x+'px'
        el.style.top = node.y+'px'

        const icon =  document.createElement("div");
        icon.className = `icon ${node.color} ${node.shape}`
        el.insertBefore(icon, el.childNodes[0])

        area.appendChild(el)

        if( nextCallMethod){
            const callLabel = document.createElement("h1");
            callLabel.innerText = nextCallMethod as string
            callLabel.className = "callLabel"
            callLabel.style.left = node.x + 'px'
            callLabel.style.top = (node.y - 64) + 'px'
            area.appendChild(callLabel);

            (async () => {
                const names = (await methodName(nextCallMethod as string))
                const firstName = names[0].replace(/\(.+/,'')
                if(names.length === 1) {
                    callLabel.innerText = firstName

                }
                if(names.length > 1) {
                    callLabel.innerText = firstName+"*"
                }
                callLabel.setAttribute('title', names.join(' / ')) 
            } )()
            
            const addressMini = document.createElement("div");
            addressMini.innerText = nextCallAddress as string
            addressMini.className = "callAddress"
            addressMini.style.left = node.x + 'px'
            addressMini.style.top = (node.y - 24) + 'px'
            area.appendChild(addressMini)

            nextCallAddress = undefined
            nextCallMethod = undefined
        }

        if( node.callstack === 1) {
            console.log(node)
            nextCallMethod = methodSig(node.log)
            nextCallAddress = '0x'+targetAddress(node.log)
        }

    }
    
}


