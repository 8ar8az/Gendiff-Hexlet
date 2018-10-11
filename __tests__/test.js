import path from 'path';
import fs from 'fs';
import getConfigsDifference from '../src';

let prettyExpected;
let plainExpected;

beforeAll(() => {
  const pathToPrettyExpectedResult = path.resolve(__dirname, '__fixtures__/pretty-result.txt');
  const pathToPlainExpectedResult = path.resolve(__dirname, '__fixtures__/plain-result.txt');
  prettyExpected = fs.readFileSync(pathToPrettyExpectedResult, 'UTF-8');
  plainExpected = fs.readFileSync(pathToPlainExpectedResult, 'UTF-8');
});

test('Generating pretty diff between .json and .ini config files with absolute paths', () => {
  const pathToConfigBefore = path.resolve(__dirname, '__fixtures__/before.json');
  const pathToConfigAfter = path.resolve(__dirname, '__fixtures__/after.ini');

  const actual = getConfigsDifference(pathToConfigBefore, pathToConfigAfter, 'pretty');
  expect(actual).toBe(prettyExpected);
});

test('Generating pretty diff between .yml and .json config files with related paths', () => {
  const pathToConfigBefore = '__tests__/__fixtures__/before.yml';
  const pathToConfigAfter = '__tests__/__fixtures__/after.json';

  const actual = getConfigsDifference(pathToConfigBefore, pathToConfigAfter, 'pretty');
  expect(actual).toBe(prettyExpected);
});

test('Generating plain diff between .ini and .yml config files with absolute and related paths', () => {
  const pathToConfigBefore = path.resolve(__dirname, '__fixtures__/before.ini');
  const pathToConfigAfter = '__tests__/__fixtures__/after.yml';

  const actual = getConfigsDifference(pathToConfigBefore, pathToConfigAfter, 'plain');
  expect(actual).toBe(plainExpected);
});
