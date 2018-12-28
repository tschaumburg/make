#!/usr/bin/env node
import * as log from './makelog';
import * as exits from './return-codes';
import * as fs from 'fs';
import * as path from 'path';
import { exists } from 'fs';
import { IParseResult } from './parser';
import * as options from './options';
import { Parser } from './parser/parser';
import { Planner } from './planner/planner';
import { Runner } from './runner/runner';

var makeOptions = options.init();
log.init();

var parser = new Parser(process.env);
var planner = new Planner(parser, makeOptions);
var runner = new Runner(planner, makeOptions);

runner.run();

log.flush();

