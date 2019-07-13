const fs = require('fs');
const path = require('path');
const copyResource = require('./copyResource');
const copyAllResources = require('./copyAllResources');

const fileMoveRequestingMap = {};

function requestMoveFile(filename) {
  if (fileMoveRequestingMap[filename]) {
    return;
  }

  fileMoveRequestingMap[filename] = true;

  setTimeout(async () => { // timeout for vscode save operation
    await copyResource(filename);
    fileMoveRequestingMap[filename] = false;
  }, 10);
}

function watchResources() {
  const filePath = path.join(__dirname, '../src');

  fs.watch(filePath, { recursive: true }, (event, filename) => {
    requestMoveFile(path.resolve(filePath, filename));
  });
}

module.exports = watchResources();

if (require.main === module) {
  (async () => {
    await copyAllResources();
    watchResources();
  })();
}
