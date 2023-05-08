const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

async function buildPage() {
  const outputMainFolder = path.join(__dirname, 'project-dist');

  await fsPromises.rm(outputMainFolder, { recursive: true, force: true });
  await fsPromises.mkdir(outputMainFolder, { recursive: true });

  async function mergeStyles(inputFolder, outputFolder) {
    const outputFile = path.join(outputFolder, 'style.css');
    const output = fs.createWriteStream(outputFile);
    const inputFiles = await fsPromises.readdir(inputFolder);
    const inputFilesFiltered = inputFiles.filter(file => path.extname(file) === '.css');

    for (const file of inputFilesFiltered) {
      const inputStream = fs.createReadStream(path.join(inputFolder, file), 'utf-8');
      await new Promise((resolve, reject) => {
        inputStream.on('data', data => {
          output.write(data.toString() + '\n');
        });
        inputStream.on('end', resolve);
        inputStream.on('error', reject);
      });
    }
  }

  async function copyDir(inputFolder, outputFolder) {
    await fsPromises.mkdir(outputFolder, { recursive: true });
    const inputFiles = await fsPromises.readdir(inputFolder, { withFileTypes: true });
    for (const file of inputFiles) {
      if (file.isDirectory()) {
        await copyDir(path.join(inputFolder, file.name), path.join(outputFolder, file.name));
      } else if (file.isFile()) {
        await fsPromises.copyFile(path.join(inputFolder, file.name), path.join(outputFolder, file.name));
      }
    }
  }

  async function parseMarkup(inputFile) {
    const stream = fs.createReadStream(inputFile, 'utf-8');
    const output = fs.createWriteStream(path.join(outputMainFolder, 'index.html'));
    let data = '';

    await new Promise((resolve, reject) => {
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve());
      stream.on('error', error => reject(error));
    });

    let components = {};
    async function parseElement(element) {
      const el = element.replace(/{{|}}/g, '').trim();
      const pathEl = path.join(__dirname, 'components', `${el}.html`);
      const streamEl = fs.createReadStream(pathEl, 'utf-8');
      let componentMarkup = '';
      await new Promise((resolve, reject) => {
        streamEl.on('data', chunk => componentMarkup += chunk);
        streamEl.on('end', () => {
          components[element] = componentMarkup;
          resolve();
        });
        streamEl.on('error', error => reject(error));
      });
    }

    const regex = /{{(.*?)}}/g;
    const matches = data.match(regex);

    try {
      await Promise.all(matches.map(el => parseElement(el)));
      const newData = data.replace(regex, (key) => components[key]);
      output.write(newData);
    } catch (err) {
      console.error(err);
    }
    
  }

  mergeStyles(path.join(__dirname, 'styles'), outputMainFolder);
  copyDir(path.join(__dirname, 'assets'), path.join(outputMainFolder, 'assets')); 
  parseMarkup(path.join(__dirname, 'template.html'));

}

buildPage();