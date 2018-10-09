import path from 'path';
import fs from 'fs';
import generateDiff from '../src';

const pathToExpectedResult = path.resolve(__dirname, '__fixtures__/result.txt');
const expected = fs.readFileSync(pathToExpectedResult, 'UTF-8');

test('Generating diff between .json and .yml config files with absolute paths', () => {
  const pathToConfigBefore = path.resolve(__dirname, '__fixtures__/before.json');
  const pathToConfigAfter = path.resolve(__dirname, '__fixtures__/after.yml');

  const actual = generateDiff(pathToConfigBefore, pathToConfigAfter);
  expect(actual).toBe(expected);
});

test('Generating diff between yml. and .json config files with related paths', () => {
  const pathToConfigBefore = '__tests__/__fixtures__/before.yml';
  const pathToConfigAfter = '__tests__/__fixtures__/after.json';

  const actual = generateDiff(pathToConfigBefore, pathToConfigAfter);
  expect(actual).toBe(expected);
});
