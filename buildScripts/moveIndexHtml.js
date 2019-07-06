const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const srcFrontendPath = path.join(__dirname, '../dist/frontend');

if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
}

if (!fs.existsSync(srcFrontendPath)) {
    fs.mkdirSync(srcFrontendPath);
}

function moveIndexHtml() {
    const filePath = path.join(__dirname, '../src/frontend/index.html');
    const destination = path.join(__dirname, '../dist/frontend/index.html');

    try {
        fs.copyFileSync(filePath, destination);
    } catch (err) {
        console.error(err);
        return;
    }

    console.log('index.html updated');
}

module.exports = moveIndexHtml;


if (require.main === module) {
    moveIndexHtml();
}
