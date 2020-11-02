// cannot import plugin-webworker because I would need to be inside typescript compiler
// Angular fails at importing WebworkerPlugin for some reason

addEventListener('message', ({ data }) => {
  if (data.key === 'execute') {
    const [script] = data.payload;
    try {
      (new Function(script))()
    } catch (e) {
      this.emit('error', {
        data: [e.message]
      })
    }
  }
  if (data.key === 'handshake') {
    data.action = 'response'
    data.payload = ['execute']
    postMessage(data)
  }
});


console.log = function () {
  postMessage({ action: 'emit', key: 'log', payload: [{data: Array.from(arguments)}]});
}
