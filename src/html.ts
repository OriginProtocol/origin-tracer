import { TransactionData, targetAddress, methodSig, methodName } from "./data";
import { layout, drawObjects, DrawObject } from "./vis"

export function drawTrace(txData: TransactionData){
    console.log("DRAW")

    let nextCallMethod : string | undefined = undefined
    let nextCallAddress : string | undefined = undefined

    const nodes = drawObjects(
        txData.trace.result.structLogs
      )
    layout(nodes)

    const area = document.getElementById("traceArea") as HTMLDivElement
    area.onclick = function(evt){
        console.log(evt.target)
    }

    if(area === null) {
        console.error('No area to draw in')
        return
    }
    let infoBoxTimeout = undefined
    for(const node of nodes) {
        const el = document.createElement("div");
        el.className = 'op'
        el.innerText = node.label
        el.style.left = node.x+'px'
        el.style.top = node.y+'px'
        // This is a slow idea to create so many
        // click handlers. #lazy
        el.onmouseover =  function(){
            clearTimeout(infoBoxTimeout)
            deleteTheInfoBox()
            showInfoBox(node, area)
        }
        el.onmouseout =  function(){
            infoBoxTimeout = setTimeout(deleteTheInfoBox,1000)
        }

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
                if(names === undefined || names.length === 0){
                    return
                }
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


function showInfoBox(node: DrawObject, area: HTMLDivElement){
    const info = document.createElement("div");
    info.className = "infoBox"
    info.innerText = `${node.label}
PC: ${node.log.pc} 0x${node.log.pc.toString(16)}

Gas Cost: ${node.log.gasCost}
Gas: ${node.log.gas}

Stack:
${node.log.stack.join('\n')}
    
    
    `
    info.style.left = node.x + 40 + "px";
    info.style.top = node.y - 9 + "px";
    area.appendChild(info)
}

function deleteTheInfoBox(){
    var el = document.querySelector('.infoBox');
    if(el === null){
        return
    }
    el.parentNode.removeChild(el);
}