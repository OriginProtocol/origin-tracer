import { TransactionData } from "./data";
import { drawTrace } from "./html";

window.onload = function(){
    const txHash = window.location.hash.replace("#","")
    document.getElementById('txHash').setAttribute('value', txHash)
    if(txHash!==""){
        const txData = new TransactionData(txHash)
        txData.on(()=>drawTrace(txData))
        txData.load()
    }
}

