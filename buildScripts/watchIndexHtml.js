const fs = require('fs');
const path = require('path');
const moveIndexHtml = require('./moveIndexHtml');

let isMoveRequested = false;

function watchIndexHtml() {
    const filePath = path.join(__dirname, '../src.frontend/index.html');

    fs.watch(filePath, (event) => {
        if (isMoveRequested) {
            return;
        }

        isMoveRequested = true;

        setTimeout(() => { // timeout for vscode save operation
            moveIndexHtml();
            isMoveRequested = false;
        }, 10);
    });
}

module.exports = watchIndexHtml();

if (require.main === module) {
    watchIndexHtml();
}
