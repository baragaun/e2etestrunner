const fs = require('fs');
const { run } = require('./run');

let config;
let configPath = 'config/config.json';
let logLevel = 'error';

for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '-f' && i + 1 < process.argv.length) {
    configPath = process.argv[i + 1];
  } else if (process.argv[i] === '-l' && i + 1 < process.argv.length) {
    logLevel = process.argv[i + 1];
  }
}

if (configPath) {
  const json = fs.readFileSync(configPath, 'utf8');

  if (!json) {
    console.error('run: failed to load config from file.', { configPath });
    return 1;
  }

  try {
    config = JSON.parse(json.toString());
  } catch (error) {
    console.error('run: failed to parse config file.', { configPath, error });
    return 1;
  }
}

(async() => {
  const result = await run(config, logLevel || 'error');
  console.log(result);
})();
