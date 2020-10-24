const cmd = require('commander');
const chalk = require('chalk');
const flow = require('inquirer');
const {
    now,
    last,
    today,
    listAllTaskNames,
    getDayDb,
    setDayDb,
    stopAllTasks,
    startTask,
    taskFilter,
    ongoing,
} = require('./utils');

const log = console.log;

const startAndUpdate = (taskName, day, db) => {
    // start or re-start task
    db[taskName] = startTask(taskName);

    // update db
    setDayDb(day, db);
};

cmd
    .description(
`Start a new tasks; by default when working on a new task, the ongoing task(s) should be stopped, but it is possible to have multiple ongoing tasks.
It is also possible to re-start an ended task.`
    )
    .option('-p, --parallel', 'don\'t stop ongoing tasks, if present')
    .option('-f, --force', 'force stopping of all other ongoing tasks without prompting for a confirmation');

cmd.parse(process.argv);

const args = cmd.args;

if (!args.length) {
    console.error(chalk.red('task required'));
    process.exit(1);
}

const task = args[0];

const day = today();
const db = getDayDb(day);

if (cmd.parallel) {
    startAndUpdate(task, day, db);
    return;
}

const ongoingTasks = listAllTaskNames(db, taskFilter(ongoing()));

if (ongoingTasks.length == 0) {
    startAndUpdate(task, day, db);
} else if (cmd.force) {
    stopAllTasks(db, task);
    startAndUpdate(task, day, db);
} else {
    log(chalk.cyan("Currently ongoing tasks:"));
    const output = ongoingTasks.map((t) => {
        return " - " + t;
    }).join("\n")
    log(output);
    flow.prompt([
        {
            type: 'confirm',
            message: chalk.cyan('Do you want to stop all ongoing tasks?'),
            name: 'stopAllTask'
        }
    ]).then((answers) => {
        if (answers.stopAllTask) {
            stopAllTasks(db, task);
        }
        startAndUpdate(task, day, db);
    });
}