const path = require('path');
const dockerCompose = require('docker-compose');
const { execSync } = require('child_process');

module.exports = async () => {
  console.time('global-teardown');
  await dockerCompose.down({
    cwd: path.join(__dirname),
    log: true,
  });
  await execSync('rm -rf ../prisma/migrations');
  console.timeEnd('global-teardown');
};
