import { EthdocPlugin } from './ethdoc'

function newDoc() {
  const plugin = new EthdocPlugin()
  const doc = document.getElementById('doc') as HTMLInputElement
  if (doc) plugin.newDoc(doc.value)
}

function component() {
  const section = document.createElement('section')
  section.innerHTML = `<input id="doc" placeholder="Write something" />
  <button id="docButton">New Doc</button>`
  return section
}

document.body.appendChild(component())
const btn = document.getElementById('docButton')
if (btn) btn.addEventListener('click', newDoc)
