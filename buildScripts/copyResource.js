const fs = require('fs-extra');
const path = require('path');

const distPath = path.join(__dirname, '../dist');

async function copyResource(filename) {
    const normalizedFilename = path.normalize(filename);
    const relativeFilename = normalizedFilename.substr(distPath.length);
    const destination = path.join(__dirname, '../dist/', relativeFilename);

    try {
        await fs.copy(normalizedFilename, destination);
    } catch (err) {
        console.error(err);
        return;
    }

    console.log(`${relativeFilename} updated`);
}

module.exports = copyResource;
