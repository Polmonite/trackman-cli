const cmd = require('commander');
const chalk = require('chalk');
const flow = require('inquirer');
const { listAllTaskNames, today, getDayDb, setDayDb, pauseTasks, unpauseAllTasks, taskFilter, paused } = require('./utils');

const unpauseTasksAndUpdate = (tasks, day, db) => {
    pauseTasks(db, tasks);

    // update db
    setDayDb(day, db);
};

cmd
    .description(
        `Unpause paused tasks; you can both provide the names of the task you want to unpause or select them when prompted.`
    )
    .option('-a, --all', 'unpause all paused tasks');

cmd.parse(process.argv);

const args = cmd.args;

const day = today();
const db = getDayDb(day);

if (cmd.all) {
    unpauseAllTasks(db);

    // update db
    setDayDb(day, db);
    return;
}

let tasks = [];
if (args.length > 0) {
    tasks = args;
}

if (tasks.length > 0) {
    unpauseTasksAndUpdate(tasks, day, db);
} else {
    const ongoingTasks = listAllTaskNames(db, taskFilter(paused()));
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
        unpauseTasksAndUpdate(answers.tasks, day, db);
    });
}