const fs = require('fs/promises');
const path = require('path');

const input = path.join(__dirname, 'files');
const output = path.join(__dirname, 'files-copy');

async function copyDir(inputFolder, outputFolder) {

  await fs.rm(outputFolder, { recursive: true, force: true });
  await fs.mkdir(outputFolder, { recursive: true });
  (await fs.readdir(inputFolder, { withFileTypes: true })).forEach(file => {
    copyfile(file);
  });

  async function copyfile(item) {
    if (item.isDirectory()) copyDir(path.join(inputFolder, item.name), path.join(outputFolder, item.name));
    if (item.isFile()) await fs.copyFile(path.join(inputFolder, item.name), path.join(outputFolder, item.name));
  }
}

copyDir(input, output);
