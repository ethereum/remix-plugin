/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  console.log(data)
  const response = `worker response to ${data}`;
  postMessage(response);
});