import * as fs from 'fs';
import * as options from './options';
import { format } from 'util';
const chalk  = require('chalk');
const npmlog = require('npmlog');
var logfile = require('npmlog-file')
//import * as npmlog from "npmlog";
import * as logsymbols from 'log-symbols';
//npmlog.heading = prefix;
var devnull = require('dev-null');

export function flush(): void
{
    // write everything npmlog has logged thus far to log.txt
    logfile.write(npmlog, '.makelog');
}

var n = 0;
export function autoflush(): void
{
    //if (n++ < 20)
    //    return;

    //n = 0;

    flush();
}

function prefix(): string
{
    return '[' + process.pid + '] [' + new Date(Date.now()).toISOString() + ']';
}

// Few logsymbols log helper
export function success(...args: string[]): void
{
    let msg = format.apply(null, args);
    npmlog.success(prefix(), msg);
};

export function warning(...args: string[]): void
{
    let msg = format.apply(null, args);
    npmlog.warn(prefix(), msg);
    autoflush();
};

// let _info = log.info;
export function info(...args: string[]): void
{
    let msg = format.apply(null, args);
    npmlog.info(prefix(), msg);
    autoflush();
};

export function locateFiles(args: () => string): void
{
    if (options.logLocateFiles)
    {
        this.info(args());
    }
};

export function error(...args: string[]): void
{
    let msg = format.apply(null, args);
    npmlog.error(prefix(), msg);
    flush();
};

export function fatal(...args: string[]): void
{
    let msg = format.apply(null, args);
    npmlog.error(prefix(), msg);
    flush();
};

export function init(): void
{
    //npmlog.stream = devnull();
    npmlog.stream = fs.createWriteStream('.makelog', { flags: 'a' });
    this.info("Log opened");
//    flush();
}
