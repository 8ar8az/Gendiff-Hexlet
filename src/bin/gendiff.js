#!/usr/bin/env node

import program from 'commander';

program
  .version('0.1.1', '-v, --version')
  .description('CLI utility for build and formated print the difference between two config files')
  .option('-f, --format [type]', 'Choose output format')
  .arguments('<originalConfigPath> <updatedConfigPath>')
  .action((originalConfigPath, updatedConfigPath) => {
    console.log(`Path to original config file: ${originalConfigPath}`);
    console.log(`Path to updated config file: ${updatedConfigPath}`);
    console.log(`Chosen output format: ${program.format}`);
  })
  .parse(process.argv);
