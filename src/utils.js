const chalk = require('chalk');
const fs = require('fs');
const os = require('os');

const dbPath = os.homedir() + '/.trackman/';
const log = console.log;

const now = () => {
    return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

const today = () => {
    return now().slice(0, 10);
}

const last = (arr) => {
    return arr[arr.length - 1];
}

const initDb = () => {
    if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath);
        log(chalk.cyan("Initialized trackman db"));
        return true;
    }
    return false;
};

const getConfigDb = () => {
    const filePath = dbPath + 'config.json';
    if (!fs.existsSync(filePath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(filePath));
};

const setConfigDb = (data) => {
    const filePath = dbPath + 'config.json';
    fs.writeFileSync(filePath, JSON.stringify(data));
};

const getConfig = (key, defaultValue) => {
    const db = getConfigDb();
    defaultValue = defaultValue || null;
    return typeof db[key] === 'undefined'
        ? defaultValue
        : db[key];
};

const setConfig = (key, value) => {
    const db = getConfigDb();
    if (value === null && db[key]) {
        delete db[key];
    } else {
        db[key] = value;
    }
    setConfigDb(db);
};

const setDayDb = (day, data) => {
    const filePath = dbPath + 'd_' + day + '.json';
    fs.writeFileSync(filePath, JSON.stringify(data));
};

const getDayDb = (day) => {
    const filePath = dbPath + 'd_' + day + '.json';
    if (!fs.existsSync(filePath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(filePath));
};

const listOfDbs = () => {
    const files = fs.readdirSync(dbPath);
    return files.filter((f) => {
        return f.substr(0, 2) == 'd_';
    });
};

const _listAll = (db, filter, outputType) => {
    filter = filter || always;
    let output = [];
    for (let taskName in db) {
        const task = db[taskName];
        if (!filter(taskName, task)) {
            continue;
        }
        switch (outputType) {
            case 'task':
                output.push(task);
                break;
            case 'name':
                output.push(taskName);
                break;
            case 'pair':
                output.push({
                    name: taskName,
                    task: task,
                });
                break;
            default:
                throw(`Unknown outputType "${outputType}"`);
        }
    }
    return output;
};

const listAllTasks = (db, filter) => {
    return _listAll(db, filter, 'task');
};

const listAllTaskNames = (db, filter) => {
    return _listAll(db, filter, 'name');
};

const listAllTasksWithNames = (db, filter) => {
    return _listAll(db, filter, 'pair');
};

const identity = (i) => {
    return i;
};

const always = () => {
    return true;
};

const never = () => {
    return false;
};

//#region filters

const tf = {

    nameDifferentThan: (differentThanTask) => {
        return (taskName, _t) => {
            return taskName !== differentThanTask;
        }
    },
    
    paused: () => {
        return (_taskName, task) => {
            return task.paused;
        }
    },
    
    notPaused: () => {
        return (_taskName, task) => {
            return !task.paused;
        }
    },
    
    notStopped: () => {
        return (_taskName, task) => {
            return !(last(task.slots).end);
        }
    },

    ongoing: () => {
        return (_taskName, task) => {
            return !(last(task.slots).end);
        }
    },

    stopped: () => {
        return (_taskName, task) => {
            return !!(last(task.slots).end);
        }
    },

};

//#endregion

//#region task actions

const ta = {

    start: (taskName, task) => {
        task = task || {};
        if (!task.slots) {
            task = { slots: [ { start: now() } ] };
            log(chalk.green(`"${taskName}" started at "${now()}"`));
        } else {
            let slot = last(task.slots);
            if (slot.end) {
                task.slots.push({ start: now() });
                log(chalk.green(`"${taskName}" re-started at "${now()}"`));
            } else {
                console.error(chalk.red(`"${taskName}" is already in progress`));
            }
        }
        return task;
    },

    stop: (taskName, task) => {
        let slot = last(task.slots);
        if (!!slot.end) {
            console.error(chalk.red(`"${taskName}" is already stopped`));
        } else {
            slot.end = now();
            log(chalk.yellow(`"${taskName}" stopped at "${slot.end}"`));
        }
        return task;
    },

    pause: (taskName, task) => {
        let slot = last(task.slots);
        if (task.paused) {
            console.error(chalk.red(`"${taskName}" is already paused`));
        } else if (!!slot.end) {
            console.error(chalk.red(`"${taskName}" is stopped and can't be paused`));
        } else {
            task.paused = true;
            slot.end = now();
            log(chalk.magenta(`"${taskName}" paused at "${slot.end}"`));
        }
        return task;
    },

    unpause: (taskName, task) => {
        let slot = last(task.slots);
        if (!task.paused) {
            console.error(chalk.red(`"${taskName}" is not paused`));
        } else {
            delete task.paused;
            slot.end = now();
            log(chalk.green(`"${taskName}" un-paused at "${slot.end}"`));
        }
        return task;
    },

};

//#endregion

const taskFilter = function() {
    const filters = arguments;
    return (taskName, task) => {
        for (let i in filters) {
            if (!filters[i](taskName, task)) {
                return false;
            }
        }
        return true;
    };
};

const applyTo = (db, tasks) => {
    tasks = tasks || Object.keys(db);
    let applier = {
        _db: db,
        _tasks: tasks,
        _then: identity,
        _else: identity,
        _if: always,
        then: (fn) => {
            applier._then = fn;
            return applier;
        },
        action: (fn) => {
            applier._then = fn;
            return applier;
        },
        else: (fn) => {
            applier._else = fn;
            return applier;
        },
        if: (fn) => {
            applier._if = fn;
            return applier;
        },
        do: () => {
            for (let i in tasks) {
                const taskName = tasks[i];
                if (typeof db[taskName] === 'undefined') {
                    console.error(chalk.red(`Unknown task "${taskName}"`));
                    continue;
                } else if (applier._if(taskName, db[taskName])) {
                    applier._then(taskName, db[taskName]);
                } else {
                    applier._else(taskName, db[taskName]);
                }
            }
        },
    };
    return applier;
};

const stopAllTasks = (db, differentThanTask) => {
    differentThanTask = differentThanTask || null;
    applyTo(db)
        .if(
            taskFilter(
                tf.nameDifferentThan(differentThanTask),
                tf.notStopped()
            )
        )
        .then(ta.stop)
        .do();
}

const pauseAllTasks = (db, differentThanTask) => {
    differentThanTask = differentThanTask || null;
    applyTo(db)
        .if(
            taskFilter(
                tf.nameDifferentThan(differentThanTask),
                tf.notPaused(),
                tf.notStopped()
            )
        ) 
        .then(ta.pause)
        .do();
}

const unpauseAllTasks = (db, differentThanTask) => {
    differentThanTask = differentThanTask || null;
    applyTo(db)
        .if(
            taskFilter(
                tf.nameDifferentThan(differentThanTask),
                tf.paused()
            )
        )
        .then(ta.unpause)
        .do();
}

const stopTasks = (db, tasks) => {
    applyTo(db, tasks)
        .action(ta.stop)
        .do();
};

const pauseTasks = (db, tasks) => {
    applyTo(db, tasks)
        .action(ta.pause)
        .do();
};

const unpauseTasks = (db, tasks) => {
    applyTo(db, tasks)
        .action(ta.unpause)
        .do();
};

module.exports = {
    now,
    today,
    last,
    initDb,
    getConfigDb,
    setConfigDb,
    getConfig,
    setConfig,
    setDayDb,
    getDayDb,
    listOfDbs,
    listAllTasks,
    listAllTaskNames,
    listAllTasksWithNames,
    stopAllTasks,
    pauseAllTasks,
    unpauseAllTasks,
    stopTasks,
    pauseTasks,
    unpauseTasks,
  
    taskFilter,

    ...tf,

    startTask: ta.start,
    stopTask: ta.stop,
    pauseTask: ta.pause,
    unpauseTask: ta.unpause,
};