#!/usr/bin/env node

import program from 'commander';
import path from 'path';
import getConfigsDifference from '..';

const getAbsolutePath = pathname => path.resolve(process.cwd(), pathname);

program
  .version('1.0.0', '-v, --version')
  .description('CLI utility for build and formated print the difference between two config files')
  .option('-f, --format [type]', 'Choose output format: pretty, plain or json', /^(pretty|plain|json)$/i, 'pretty')
  .arguments('<originalConfigPath> <updatedConfigPath>')
  .action((beforeConfigFilePath, afterConfigFilePath) => {
    const result = getConfigsDifference(
      getAbsolutePath(beforeConfigFilePath),
      getAbsolutePath(afterConfigFilePath),
      program.format,
    );
    console.log(result);
  })
  .parse(process.argv);
