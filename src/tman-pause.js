const cmd = require('commander');
const chalk = require('chalk');
const flow = require('inquirer');
const { listAllTaskNames, today, getDayDb, setDayDb, pauseTasks, pauseAllTasks, taskFilter, ongoing } = require('./utils');

const pauseTasksAndUpdate = (tasks, day, db) => {
    pauseTasks(db, tasks);

    // update db
    setDayDb(day, db);
};

cmd
    .description(
        `Pause ongoing tasks; you can both provide the names of the task you want to pause or select them when prompted.`
    )
    .option('-a, --all', 'pause all ongoing tasks');

cmd.parse(process.argv);

const args = cmd.args;

const day = today();
const db = getDayDb(day);

if (cmd.all) {
    pauseAllTasks(db);

    // update db
    setDayDb(day, db);
    return;
}

let tasks = [];
if (args.length > 0) {
    tasks = args;
}

if (tasks.length > 0) {
    pauseTasksAndUpdate(tasks, day, db);
} else {
    const ongoingTasks = listAllTaskNames(db, taskFilter(ongoing()));
    flow.prompt([
        {
            type: 'checkbox',
            message: chalk.cyan('Select which tasks to pause:'),
            name: 'tasks',
            choices: ongoingTasks.map((t) => {
                return { name: t };
            })
        }
    ]).then((answers) => {
        pauseTasksAndUpdate(answers.tasks, day, db);
    });
}