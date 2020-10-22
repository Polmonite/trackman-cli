const cmd = require('commander');
const chalk = require('chalk');
const { getConfig, setConfig, getConfigDb } = require('./utils');

const DEFAULT_RECAPS_NUMBER = getConfig('default_recaps_number', 7);

const log = console.log;

cmd
    .description(
`Shows the current custom configuration or set a new custom configuration variable.`
    )

cmd.parse(process.argv);

const args = cmd.args;

if (args.length == 0) {
    const config = getConfigDb();
    if (config.length > 0) {
        for (let i in config) {
            log(chalk.cyan(`${i}`) + `: "${config[i]}"`);
        }
    } else {
        log("There are no custom configurations");
    }
} else if (args.length == 1) {
    log(chalk.cyan(`${args[0]}`) + `: "${getConfig(args[0])}"`);
} else if (args.length == 2) {
    if (args[1] === '-') {
        setConfig(args[0], null);
        log(chalk.cyan(`${args[0]}`) + `: "null"`);
    } else {
        setConfig(args[0], args[1]);
        log(chalk.cyan(`${args[0]}`) + `: set to "${args[1]}"`);
    }
} else {
    console.error(chalk.red("Too many arguments"));
}