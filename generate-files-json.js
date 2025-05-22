const fs = require('fs');
const path = require('path');

function walk(dir) {
  return fs.readdirSync(dir).map(name => {
    const fullPath = path.join(dir, name);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      return {
        name,
        type: 'folder',
        children: walk(fullPath)
      };
    } else {
      return {
        name,
        type: 'file'
      };
    }
  });
}

const structure = walk(path.join(__dirname, 'files'));
fs.writeFileSync('files.json', JSON.stringify(structure, null, 2));
