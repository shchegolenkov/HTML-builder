const path = require('path');
const fs = require('fs');

const source = path.join(__dirname, 'secret-folder');

fs.readdir(source, { withFileTypes: true }, (err, data) => {
  if (err) throw err;
  data.forEach(file => {
    if (file.isFile()) {
      fs.stat(path.join(source, file.name), (err, stats) => {
        if (err) throw err;
        console.log(`${path.parse(file.name).name} - ${path.extname(file.name).slice(1)} - ${stats.size}b`);
      });
    }
  });
});
