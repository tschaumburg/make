#!/usr/bin/env node
import * as log from './makelog';
import * as options from './options';
import * as parser from './parser';
import { Planner } from './planner/planner';
import { Runner } from './runner/runner';

var makeOptions = options.init();
log.init();

var _parser = parser.create(process.env);
var planner = new Planner(_parser, makeOptions);
var runner = new Runner(planner, makeOptions);

runner.run();

log.flush();

