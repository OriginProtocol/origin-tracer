import { TransactionData, targetAddress, methodSig, methodName } from './data'
import { layout, drawObjects, DrawObject } from './vis'

// html.ts - Renders a transaction to an HTML / div based visualization.

export function drawTrace(txData: TransactionData) {
  let nextCallMethod: string | undefined = '...'
  let nextCallAddress: string | undefined = '...'
  if (txData.txInfo) {
    nextCallMethod = txData.txInfo.result.input.substring(0, 8)
    nextCallAddress = txData.txInfo.result.to
  }

  const nodes = drawObjects(txData.trace.result.structLogs)
  layout(nodes)

  const area = document.getElementById('traceArea') as HTMLDivElement
  area.innerHTML = '' // Clear
  area.onclick = function(evt) {
    console.log(evt.target)
  }

  if (area === null) {
    console.error('No area to draw in')
    return
  }
  let infoBoxTimeout: number | undefined = undefined
  for (const node of nodes) {
    const el = document.createElement('div')
    el.className = 'op'
    el.innerText = node.label
    el.style.left = node.x + 'px'
    el.style.top = node.y + 'px'
    // This is could be a slow idea to create so many
    // click handlers, but it's fast enough
    el.onmouseover = function() {
      clearTimeout(infoBoxTimeout)
      infoBoxDelete()
      infoBoxShow(node, area)
    }
    el.onmouseout = function() {
      infoBoxTimeout = (setTimeout(infoBoxDelete, 1000) as unknown) as number
    }

    const icon = document.createElement('div')
    icon.className = `icon ${node.color} ${node.shape}`
    el.insertBefore(icon, el.childNodes[0])

    area.appendChild(el)

    if (nextCallMethod) {
      const callLabel = document.createElement('h1')
      callLabel.innerText = nextCallMethod as string
      callLabel.className = 'callLabel'
      callLabel.style.left = node.x + 'px'
      callLabel.style.top = node.y - 64 + 'px'
      area.appendChild(callLabel)

      ;(async () => {
        const names = await methodName(nextCallMethod as string)
        if (names === undefined || names.length === 0) {
          return
        }
        const firstName = names[0].replace(/\(.+/, '')
        if (names.length === 1) {
          callLabel.innerText = firstName
        }
        if (names.length > 1) {
          callLabel.innerText = firstName + '*'
        }
        callLabel.setAttribute('title', names.join(' / '))
      })()

      const addressMini = document.createElement('div')
      addressMini.innerText = nextCallAddress as string
      addressMini.className = 'callAddress'
      addressMini.style.left = node.x + 'px'
      addressMini.style.top = node.y - 24 + 'px'
      area.appendChild(addressMini)

      nextCallAddress = undefined
      nextCallMethod = undefined
    }

    if (node.callstack === 1) {
      console.log(node)
      nextCallMethod = methodSig(node.log)
      nextCallAddress = '0x' + targetAddress(node.log)
    }
  }
}

function infoBoxShow(node: DrawObject, area: HTMLDivElement) {
  const stack = ([] as string[]).concat(node.log.stack)
  stack.reverse()

  const info = document.createElement('div')
  info.className = 'infoBox'
  info.innerText = `${node.label}
PC: ${node.log.pc} 0x${node.log.pc.toString(16)}

Gas Cost: ${node.log.gasCost}
Gas: ${node.log.gas}

Stack:
${stack.join('\n')}
    
    `
  info.style.left = node.x + 40 + 'px'
  info.style.top = node.y - 9 + 'px'
  area.appendChild(info)
}

function infoBoxDelete() {
  var el = document.querySelector('.infoBox')
  if (el === null || el.parentNode === null) {
    return
  }
  el.parentNode.removeChild(el)
}
