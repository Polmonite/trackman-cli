<p align="center">
    <img src=".misc/logo.png" height="125"/>
</p>

# TrackMan-CLI

*A CLI app for tracking the time spent on activities during the day.*

## Overview

**TrackMan-CLI** (`tman`) allows you to quickly record when you started working
on a task, when you stopped and gives you a quick recap to read at the end of
the day (or whenever you want).

## Table of contents

* [Overview](#overview)
* [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [License](#license)

## Installation

Clone the repo, then launch:

```bash
$ npm install -g trackman-cli
```

And then the `tman` command will be available.

## Usage

### Commands

* [`start`](#start-task)
* [`stop`](#stop-tasks)
* [`list`](#list-tasks)
* [`recap`](#recap)
* [`report`](#report)
* [`config`](#config)
* [`help`](#help)

### Start task

Start a new tasks; by default when working on a new task, the ongoing task(s)
should be stopped, but it is possible to have multiple ongoing tasks.
It is also possible to re-start an ended task.

```bash
Options:
  -p, --parallel  don\'t stop ongoing tasks, if present
  -f, --force     force stopping of all other ongoing tasks without prompting for a confirmation
  -h, --help      display help for command
```

#### Examples

```console
$ tman start "Working on TrackMan"
"Working on TrackMan" started at "2020-10-22 17:22"

$ tman start "Working on something else"
Currently ongoing tasks:
 - Working on TrackMan
? Do you want to stop all ongoing tasks? Yes
"Working on TrackMan" ended at "2020-10-22 17:22"
"Working on something else" started at "2020-10-22 17:22"
```

### Stop tasks

Stop ongoing tasks; you can both provide the names of the task you want to stop
or select them when prompted.

```bash
Options:
  -a, --all   stop all ongoing tasks
  -h, --help  display help for command
```

#### Examples

```console
$ tman stop
? Select which tasks to stop: Working on something else
"Working on something else" ended at "2020-10-22 17:25"

$ tman stop --all
"Task-A" ended at "2020-10-22 17:26"
"Task-B" ended at "2020-10-22 17:26"
```

### List tasks

Shows the list of ongoing tasks.

```bash
Options:
  -a, --all   print all task, even stopped one
  -l, --long  print task name and if the task is ongoing or stopped
  -h, --help  display help for command
```

#### Examples

```console
$ tman list
Task-B
Task-C

$ tman list --all
Task-A
Task-B
Task-C

$ tman list --all --long
Stopped 	Task-A
Ongoing 	Task-B
Ongoing 	Task-C
```

### Recap

Shows the recap for a day; it defaults on today.
It is possible to have a light recap (only name of the task and how much time
you spent on it) or a verbose recap, with more informations.
It is also possible to sort the rows of the recap by name or by time spent on
every task.
Lastly it can be pretty-printed in a more fashionable way.

```bash
Options:
  -v, --verbose         show more details
  -p, --pretty-print    print a more readable table
  -s, --sort-by <sort>  sort table by name or time
  -h, --help            display help for command
```

#### Examples

```console
$ tman recap

 - Day: 2020-10-22

Task                            	Time
Task-A                          	0 hours and 1 minutes
Task-B                          	0 hours and 5 minutes
Task-C                          	0 hours and 4 minutes

$ tman recap --verbose

 - Day: 2020-10-22

Task                            	Time                  	From 	To   	Started
Task-A                          	0 hours and 1 minutes 	17:25	17:29	2 times
   [1]                          	0 hours and 1 minutes 	17:25	17:26
   [2]                          	0 hours and 0 minutes 	17:29	17:29
Task-B                          	0 hours and 5 minutes 	17:25	---  	2 times
   [1]                          	0 hours and 1 minutes 	17:25	17:26
   [2]                          	0 hours and 4 minutes 	17:29	---
Task-C                          	0 hours and 4 minutes 	17:29	---  	1 time
   [1]                          	0 hours and 4 minutes 	17:29	---

$ tman recap --verbose --pretty-print

 - Day: 2020-10-22

┌──────────────────────────────────┬────────────────────────┬───────┬───────┬─────────┐
│ Task                             │ Time                   │ From  │ To    │ Started │
├──────────────────────────────────┼────────────────────────┼───────┼───────┼─────────┤
│ Task-A                           │ 0 hours and 1 minutes  │ 17:25 │ 17:29 │ 2 times │
├──────────────────────────────────┼────────────────────────┼───────┼───────┼─────────┤
│    [1]                           │ 0 hours and 1 minutes  │ 17:25 │ 17:26 │         │
├──────────────────────────────────┼────────────────────────┼───────┼───────┼─────────┤
│    [2]                           │ 0 hours and 0 minutes  │ 17:29 │ 17:29 │         │
├──────────────────────────────────┼────────────────────────┼───────┼───────┼─────────┤
│ Task-B                           │ 0 hours and 6 minutes  │ 17:25 │ ---   │ 2 times │
├──────────────────────────────────┼────────────────────────┼───────┼───────┼─────────┤
│    [1]                           │ 0 hours and 1 minutes  │ 17:25 │ 17:26 │         │
├──────────────────────────────────┼────────────────────────┼───────┼───────┼─────────┤
│    [2]                           │ 0 hours and 5 minutes  │ 17:29 │ ---   │         │
├──────────────────────────────────┼────────────────────────┼───────┼───────┼─────────┤
│ Task-C                           │ 0 hours and 5 minutes  │ 17:29 │ ---   │ 1 time  │
├──────────────────────────────────┼────────────────────────┼───────┼───────┼─────────┤
│    [1]                           │ 0 hours and 5 minutes  │ 17:29 │ ---   │         │
└──────────────────────────────────┴────────────────────────┴───────┴───────┴─────────┘

$ tman recap 2020-10-21

 - Day: 2020-10-21

Task          	Time
OldTask-A       2 hours and 20 minutes
OldTask-B     	1 hours and 0 minutes
```

### Report

Shows a list of the available recaps, from most recent to oldest.

```bash
Options:
  -a, --all         show all recaps
  -n, --number <n>  show the specified number of recaps (defaults to 7)
  -h, --help        display help for command
```

#### Examples

```console
$ tman report
2020-10-22
2020-10-21
2020-10-20
2020-10-19
```

### Config

Shows the current custom configuration or set a new custom configuration
variable.

**NOTE:** right now the used configurations are:
* `default_recaps_number`: the number of reports to show by default by calling
    `tman report` (default: `7`).

```bash
Options:
  -h, --help  display help for command
```

#### Examples

```console
$ tman config default_recaps_number 2
default_recaps_number: set to "2"

$ tman config default_recaps_number
default_recaps_number: "2"

$ tman config default_recaps_number -
default_recaps_number: "null"

$ tman config
There are no custom configurations
```

### Help

Are you really reading what the help command do?

```console
$ tman help

$ tman [cmd] --help
```

## Roadmap

- [x] Learn what is a "variable";
- [x] Understand the differences between Java and JavaScript;
- [x] Forget previous point;
- [x] Implement `start`/`stop` commands;
  - [ ] Add option to start/stop task in a moment in the past
- [x] Implement `recap` command;
- [x] Implement `report` command;
- [x] Implement `list` command;
- [x] Implement `config` command;
  - [ ] Add `locale` and `display_format` configs for recorder times;
  - [ ] Add `boundaries` config (to ignore task tracked outside of a given range
  of time);
  - [ ] Add `breaks` config (to set daily time breaks, like lunch, coffee break,
  etc. which will be ignored in the daily recap);
- [x] Implement `pause`/`unpause` command (to pause/unpause ongoing tasks them);
- [ ] Implement `add` command (to add whole task, with begin and end date);
- [ ] Implement `edit` command (to edit recorded tasks);
- [ ] Implement `delete` command (to delete recorded tasks);
- [ ] Try using a sqlite db instead of json files;
- [ ] Create a gui for those who sometimes aren't inside the terminal (like me);
- [ ] Learn english language (optionale).

## License

MIT &copy; [Andrea Longo](https://github.com/polmonite)