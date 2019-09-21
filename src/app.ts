import { TransactionData } from "./data";
import { drawTrace } from "./html";


const inputEl = document.getElementById('txHash') as HTMLInputElement

function redrawDiagram(){
    const txHash = window.location.hash.replace("#","")
    inputEl.value = txHash
    if(txHash!==""){
        const txData = new TransactionData(txHash)
        txData.on(()=>{
            console.log(txData.hasTrace, txData.hasTxInfo)
            if(txData.hasTrace && txData.hasTxInfo){
                drawTrace(txData)
            }
        })
        txData.load()
        txData.loadTxInfo()
    }
}

document.getElementById('txHashForm').onsubmit = function(){
    window.location.hash = '#'+inputEl.value
    return false
}


window.onload = function(){
    redrawDiagram()
}

window.onhashchange = () => {
    redrawDiagram()
}

