const cmd = require('commander');
const chalk = require('chalk');
const flow = require('inquirer');
const { now, last, today, listAllTasks, getDayDb, setDayDb, stopAllTasks } = require('./utils');

const log = console.log;

const startAndUpdate = (task, day, db, rightNow) => {
    // start or re-start task
    if (!db[task]) {
        db[task] = { slots: [ { start: rightNow } ] };
        log(chalk.green(`"${task}" started at "${rightNow}"`));
    } else {
        let slot = last(db[task].slots);
        if (slot.end) {
            db[task].slots.push({ start: rightNow });
            log(chalk.green(`"${task}" re-started at "${rightNow}"`));
        } else {
            console.error(chalk.red(`"${task}" is already in progress`));
        }
    }

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
const rightNow = now();
const db = getDayDb(day);

if (cmd.parallel) {
    startAndUpdate(task, day, db, rightNow);
} else if (listAllTasks(db).length == 0) {
    startAndUpdate(task, day, db, rightNow);
} else if (cmd.force) {
    stopAllTasks(db, task);
    startAndUpdate(task, day, db, rightNow);
} else {
    log(chalk.cyan("Currently ongoing tasks:"));
    log(listAllTasks(db).map((t) => { return " - " + t; }).join("\n"));
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
        startAndUpdate(task, day, db, rightNow);
    });
}