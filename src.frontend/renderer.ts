import CameraFrame from "./CameraFrame";

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

async function test() {
  const cameraFrame = new CameraFrame('10px', '20px', '480px', '320px');
  await cameraFrame.load();

  document.body.appendChild(cameraFrame.element);
}

test();
