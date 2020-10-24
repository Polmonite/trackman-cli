const cmd = require('commander');
const chalk = require('chalk');
const {
    today,
    last,
    getDayDb,
    listAllTasksWithNames,
    taskFilter,
    ongoing,
} = require('./utils');

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

const filter = cmd.all
    ? null
    : taskFilter(ongoing());

const taskPairs = listAllTasksWithNames(db, filter);

let output = [];
for (let i in taskPairs) {
    const { name: taskName, task } = taskPairs[i];
    const slot = last(task.slots);
    if (cmd.long) {
        let status;
        if (!slot.end) {
            status = chalk.green("Ongoing ");
        } else if (task.paused) {
            status = chalk.magenta("Paused  ");
        } else {
            status = chalk.yellow("Stopped ");
        }
        output.push(status + "\t" + taskName);
    } else {
        output.push(taskName);
    }
}

if (output.length > 0) {
    log(output.join("\n"));
} else {
    log("There are no tasks");
}