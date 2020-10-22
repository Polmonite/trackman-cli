const cmd = require('commander');
const chalk = require('chalk');
const Table = require('cli-table3');

const { now, today, getDayDb } = require('./utils');

const log = console.log;

const readableTime = (timeSpan) => {
    const seconds = (timeSpan / 1000);
    const minutes = parseInt((seconds / 60), 10);
    const hours = parseInt((minutes / 60), 10);
    const readableMinutes = minutes % 60;

    return `${hours} hours and ${readableMinutes} minutes`;
};

const verboseRecap = (data, day) => {
    const defaultEnd = (day == today())
        ? now()
        : day + ' 23:59';
    const header = [
        'Task',
        'Time',
        'From',
        'To',
        'Started',
    ];

    let rows = [];

    for (let task in data) {
        let totalTime = 0;
        let subRows = [];

        let hmSlots = data[task].slots.length;
        let taskStart = 0;
        let taskEnd = 0;

        for (let i in data[task].slots) {
            const start = new Date(data[task].slots[i].start);
            const readableStart = data[task].slots[i].start.slice(-5);
            if (taskStart == 0) {
                taskStart = readableStart;
            }
            let end = defaultEnd;
            let ended = false;
            if (data[task].slots[i].end) {
                end = data[task].slots[i].end;
                ended = true;
            }
            const readableEnd = end.slice(-5);
            end = new Date(end);
            taskEnd = (ended ? readableEnd : '---');

            const diff = Math.abs(end - start);
            totalTime += diff;

            const prefix = new Array(Math.max(task.length - 3, 0)).join(' ');
            const name = prefix + ' [' + (parseInt(i, 10) + 1) + ']';

            subRows.push([
                name,
                readableTime(diff),
                readableStart,
                (ended ? readableEnd : '---'),
                ''
            ]);
        }
        
        rows.push({
            values: [
                task,
                readableTime(totalTime),
                taskStart,
                taskEnd,
                hmSlots + ' time' + (hmSlots > 1 ? 's' : ''),
            ],
            subRows: subRows
        });
    }
    return {
        header: header,
        rows: rows
    };
}

const lightRecap = (data, day) => {
    const defaultEnd = (day == today())
        ? now()
        : day + ' 23:59';
    const header = [
        'Task',
        'Time',
    ];

    let rows = [];

    for (let task in data) {
        let totalTime = 0;

        for (let i in data[task].slots) {
            const start = new Date(data[task].slots[i].start);
            let end = data[task].slots[i].end
                ? data[task].slots[i].end
                : defaultEnd;
            end = new Date(end);

            const diff = Math.abs(end - start);
            totalTime += diff;
        }
        rows.push({
            values: [ task, readableTime(totalTime) ]
        });
    }
    return {
        header: header,
        rows: rows
    };
};


const rawPrint = (data) => {
    let maxs = Array(10).fill(0);
    for (let i in data.rows) {
        for (let j in data.rows[i].values) {
            if (data.rows[i].values[j].length > maxs[j]) {
                maxs[j] = data.rows[i].values[j].length;
            }
        }
    }
    let output = '';
    for (let i in data.header) {
        if (data.header[i].length > maxs[i]) {
            maxs[i] = data.header[i].length;
        }
        const h = data.header[i].padEnd(maxs[i]) + "\t";
        output += chalk.cyan(h);
    }
    output += "\n";
    for (let i in data.rows) {
        for (let j in data.rows[i].values) {
            output += (''+data.rows[i].values[j]).padEnd(maxs[j]) + "\t";
        }
        output += "\n";
        if (data.rows[i].subRows) {
            const subRows = data.rows[i].subRows;
            for (let k in subRows) {
                for (let j in subRows[k]) {
                    output += (''+subRows[k][j]).padEnd(maxs[j]) + "\t";
                }
                output += "\n";
            }
        }
    }
    return output;
};

const prettyPrint = (data) => {
    let tbl = new Table({
        head: data.header.map((h) => {
            return chalk.cyan(h);
        })
    });
    for (let i in data.rows) {
        tbl.push(data.rows[i].values);
        if (data.rows[i].subRows) {
            const subRows = data.rows[i].subRows;
            for (let k in subRows) {
                tbl.push(subRows[k]);
            }
        }
    }
    return tbl.toString();
};

const sortDataBy = (rows, sortBy) => {
    if (sortBy === null) {
        return rows;
    }
    const sortIndex = (sortBy === 'time')
        ? 1
        : 0;

    return rows.sort((a, b) => {
        if (a.values[sortIndex] < b.values[sortIndex]) {
            return -1;
        }
        if (a.values[sortIndex] > b.values[sortIndex]) {
            return 1;
        }
        return 0;
    });
};

cmd
    .description(
`Shows the recap for a day; it defaults on today.
It is possible to have a light recap (only name of the task and how much time you spent on it) or a verbose recap, with more informations.
It is also possible to sort the rows of the recap by name or by time spent on every task.
Lastly it can be pretty-printed in a more fashionable way.`
    )
    .option('-v, --verbose', 'show more details')
    .option('-p, --pretty-print', 'print a more readable table')
    .option('-s, --sort-by <sort>', 'sort table by name or time');

cmd.parse(process.argv);

const args = cmd.args;

const refDay = args[0] || today();
const db = getDayDb(refDay);

const recapData = (cmd.verbose)
    ? verboseRecap(db, refDay)
    : lightRecap(db, refDay);

recapData.rows = sortDataBy(recapData.rows, cmd.sortBy);

const output = (cmd.prettyPrint)
    ? prettyPrint(recapData)
    : rawPrint(recapData);

log(chalk.cyan(`\n - Day: ${refDay}\n`));
log(output);