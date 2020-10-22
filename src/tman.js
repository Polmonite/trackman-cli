#!/usr/bin/env node

const cmd = require('commander');
const pckg = require('../package.json')
const { initDb } = require('./utils');

// init db
initDb();

cmd
  .description(
`A simple cli program to record the tasks of the day.
You can:
 - "start" a task (or multiple tasks);
 - "stop" tasks;
 - "list" ongoing tasks;
 - show a "recap" of the day's tasks and how much time you spent on every task;
 - and some other small things.
Recaps are saved divided for every day, so you can also go retrieve old recaps.`)
  .version(pckg.version)
  .command('start <task>', 'start or restart working on a task').alias('s')
  .command('stop [tasks...]', 'stop working on the current task').alias('t')
  .command('list [day]', 'list all ongoing tasks').alias('ls')
  .command('recap [day]', 'show the recap of the specified day').alias('p')
  .command('report', 'show the list of available recaps').alias('re')
  .command('config [key] [value]', 'show or update configuration').alias('c');

cmd.parse(process.argv);