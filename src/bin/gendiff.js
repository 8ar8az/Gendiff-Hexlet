#!/usr/bin/env node

import program from 'commander';
import generateDiff from '..';

program
  .version('0.2.0', '-v, --version')
  .description('CLI utility for build and formated print the difference between two config files')
  .option('-f, --format [type]', 'Choose output format')
  .arguments('<originalConfigPath> <updatedConfigPath>')
  .action((beforeConfigFilePath, afterConfigFilePath) => {
    const result = generateDiff(beforeConfigFilePath, afterConfigFilePath);
    console.log(result);
    process.exit(0);
  })
  .parse(process.argv);
