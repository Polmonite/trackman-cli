const cmd = require('commander');
const chalk = require('chalk');
const flow = require('inquirer');
const { listAllTaskNames, today, getDayDb, setDayDb, stopTasks, stopAllTasks, taskFilter, ongoing } = require('./utils');

const stopTasksAndUpdate = (tasks, day, db) => {
    stopTasks(db, tasks);

    // update db
    setDayDb(day, db);
};

cmd
    .description(
        `Stop ongoing tasks; you can both provide the names of the task you want to stop or select them when prompted.`
    )
    .option('-a, --all', 'stop all ongoing tasks');

cmd.parse(process.argv);

const args = cmd.args;

const day = today();
const db = getDayDb(day);

if (cmd.all) {
    stopAllTasks(db);

    // update db
    setDayDb(day, db);
    return;
}

let tasks = [];
if (args.length > 0) {
    tasks = args;
}

if (tasks.length > 0) {
    stopTasksAndUpdate(tasks, day, db);
} else {
    const ongoingTasks = listAllTaskNames(db, taskFilter(ongoing()));
    flow.prompt([
        {
            type: 'checkbox',
            message: chalk.cyan('Select which tasks to stop:'),
            name: 'tasks',
            choices: ongoingTasks.map((t) => {
                return { name: t };
            })
        }
    ]).then((answers) => {
        stopTasksAndUpdate(answers.tasks, day, db);
    });
}