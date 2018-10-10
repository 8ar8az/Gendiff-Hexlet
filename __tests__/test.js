import path from 'path';
import fs from 'fs';
import getConfigsDifference from '../src';

let expected;

beforeAll(() => {
  const pathToExpectedResult = path.resolve(__dirname, '__fixtures__/result.txt');
  expected = fs.readFileSync(pathToExpectedResult, 'UTF-8');
});

test('Generating diff between .json and .ini config files with absolute paths', () => {
  const pathToConfigBefore = path.resolve(__dirname, '__fixtures__/before.json');
  const pathToConfigAfter = path.resolve(__dirname, '__fixtures__/after.ini');

  const actual = getConfigsDifference(pathToConfigBefore, pathToConfigAfter);
  expect(actual).toBe(expected);
});

test('Generating diff between .yml and .json config files with related paths', () => {
  const pathToConfigBefore = '__tests__/__fixtures__/before.yml';
  const pathToConfigAfter = '__tests__/__fixtures__/after.json';

  const actual = getConfigsDifference(pathToConfigBefore, pathToConfigAfter);
  expect(actual).toBe(expected);
});

test('Generating diff between .ini and .yml config files with absolute and related paths', () => {
  const pathToConfigBefore = path.resolve(__dirname, '__fixtures__/before.ini');
  const pathToConfigAfter = '__tests__/__fixtures__/after.yml';

  const actual = getConfigsDifference(pathToConfigBefore, pathToConfigAfter);
  expect(actual).toBe(expected);
});
