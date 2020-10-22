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

const listAllTasks = (db, all, long) => {
    all = all || false;
    long = long || false;
    let output = [];
    for (let task in db) {
        let slot = last(db[task].slots);
        if (!slot.end || all) {
            if (long) {
                let status = (!slot.end)
                    ? chalk.green("Ongoing ")
                    : chalk.yellow("Stopped ");
                output.push(status + "\t" + task);
            } else {
                output.push(task);
            }
        }
    }
    return output;
};

const stopAllTasks = (db, differentThanTask) => {
    differentThanTask = differentThanTask || null;
    for (let otherTask in db) {
        if (otherTask === differentThanTask) {
            continue;
        }
        let slot = last(db[otherTask].slots);
        if (!slot.end) {
            slot.end = now();
            log(chalk.yellow(`"${otherTask}" ended at "${slot.end}"`));
        }
    }
};

const stopTasks = (db, tasks) => {
    for (let taskIndex in tasks) {
        const task = tasks[taskIndex];
        if (typeof db[task] === 'undefined') {
            console.error(chalk.red(`Unknown task "${task}"`));
        }
        let slot = last(db[task].slots);
        if (!slot.end) {
            slot.end = now();
            log(chalk.yellow(`"${task}" ended at "${slot.end}"`));
        }
    }
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
    stopAllTasks,
    stopTasks,
};