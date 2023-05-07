const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const input = path.join(__dirname, 'styles');
const output = path.join(__dirname, 'project-dist');

async function mergeStyles(inputFolder, outputFolder) {
  const outputFile = path.join(outputFolder, 'bundle.css');
  await fsPromises.rm(outputFile, { recursive: true, force: true });
  const output = fs.createWriteStream(outputFile);

  (await fsPromises.readdir(inputFolder)).forEach(file => {
    if (path.extname(file) === '.css') {
      const inputStream = fs.createReadStream(path.join(inputFolder, file), 'utf-8');
      inputStream.on('data', data => {
        output.write(data.toString() + '\n');
      });
    }
  });
}

mergeStyles(input, output);