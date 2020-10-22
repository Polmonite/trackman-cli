const cmd = require('commander');
const chalk = require('chalk');
const { today, getDayDb, listAllTasks } = require('./utils');

const log = console.log;

cmd
    .description(
        `Shows the list of ongoing tasks.`
    )
    .option('-a, --all', 'print all task, even stopped one')
    .option('-l, --long', 'print task name and if the task is ongoing or stopped');

cmd.parse(process.argv);

const args = cmd.args;

const refDay = args[0] || today();
const db = getDayDb(refDay);

const tasks = listAllTasks(db, cmd.all, cmd.long);
if (tasks.length > 0) {
    log(tasks.join("\n"));
} else {
    log("There are no tasks");
}