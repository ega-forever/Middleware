const fs = require('fs-extra'),
  path = require('path');

module.exports = async (dir) => {


  await fs.ensureDir(path.join(dir, 'core'));
  await fs.copy(path.join(__dirname, '../template'), dir);

};
