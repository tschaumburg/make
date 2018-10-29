
const chalk  = require('chalk');
const npmlog = require('npmlog');
const prefix = 'make';
const { format } = require('util');

const { error, info, success, warning } = require('log-symbols');

export let log = npmlog;
log.heading = prefix;

// Automatic silent prefix
Object.keys(log.levels).forEach((lvl) => {
  log[lvl] = log[lvl].bind(log, '');
});

// Few logsymbols log helper
log.success = (...args: string[]) => {
  let msg = format.apply(null, args);
  let level = chalk.green('info');
  let symbol = success;
  console.error(`${log.heading} ${symbol} ${level} ${msg}`);
};

log.warning = (...args: string[]) => {
  let msg = format.apply(null, args);
  let level = chalk.yellow('warn');
  let symbol = warning;
  console.error(`${log.heading} ${symbol} ${level} ${msg}`);
};

// let _info = log.info;
log.info = (...args: string[]) => {
  let msg = format.apply(null, args);
  let level = chalk.green('info');
  let symbol = info;
  console.error(`${log.heading} ${symbol} ${level} ${msg}`);
};

log.error = (...args: string[]) => {
  let msg = format.apply(null, args);
  let level = chalk.red('ERR ');
  let symbol = error;
  console.error(`${log.heading} ${symbol} ${level} ${msg}`);
};
