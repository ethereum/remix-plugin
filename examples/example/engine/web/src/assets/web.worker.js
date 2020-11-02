addEventListener('message', ({ data }) => {
  console.log(data)
  data.action = 'response'
  postMessage(data);
});