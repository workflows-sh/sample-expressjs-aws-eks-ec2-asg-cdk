const path = require('path');
const dockerCompose = require('docker-compose');
const { execSync } = require('child_process');


module.exports = async () => {
  console.time('global-setup');
  await dockerCompose.upAll({
    cwd: path.join(__dirname),
    log: true,
  });

  await dockerCompose.exec(
    'pgDB',
    ['sh', '-c', 'until pg_isready ; do sleep 1; done'],
    {
      cwd: path.join(__dirname),
    }
  );

  await execSync('npx prisma migrate dev --name init && npx prisma db seed');

  // 👍🏼 We're ready
  console.timeEnd('global-setup');
};
