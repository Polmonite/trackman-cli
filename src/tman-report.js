const cmd = require('commander');
const { listOfDbs, getConfig } = require('./utils');

const DEFAULT_RECAPS_NUMBER = getConfig('default_recaps_number', 7);

const log = console.log;

cmd
    .description(
        `Shows a list of the available recaps, from most recent to oldest.`
    )
    .option('-a, --all', 'show all recaps')
    .option('-n, --number <n>', 'show the specified number of recaps (defaults to ' + DEFAULT_RECAPS_NUMBER + ')');

cmd.parse(process.argv);

const n = cmd.number || DEFAULT_RECAPS_NUMBER;

let output = listOfDbs().map((d) => {
    return d.replace('.json', '').replace('d_', '');
}).sort().reverse();

if (!cmd.all) {
    output = output.slice(0, n);
}

if (output.length == 0) {
    output.push("No recaps available");
}

log(output.join("\n"));