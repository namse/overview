const fs = require('fs-extra');
const path = require('path');
const copyResource = require('./copyResource');

async function getFiles(dir) {
  const entities = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  await Promise.all(entities.map(async (entity) => {
    const resolvedPath = path.resolve(dir, entity.name);
    if (!entity.isDirectory()) {
      files.push(resolvedPath);
      return;
    }
    const entityFiles = await getFiles(resolvedPath);
    files.push(...entityFiles);
  }));

  return files;
}

async function copyAllResources() {
  const srcPath = path.join(__dirname, '../src');

  const files = await getFiles(srcPath);

  const notTsFiles = files.filter(file => !file.endsWith('.ts'));

  await Promise.all(notTsFiles.map((file) => {
    return copyResource(file);
  }));
}

module.exports = copyAllResources;

if (require.main === module) {
  (async () => {
    await copyAllResources();
    console.log("done");
    process.exit(0);
  })();
}
