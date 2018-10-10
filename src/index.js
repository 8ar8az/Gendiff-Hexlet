import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import getParser from './parsers';
import renderAst from './render';

const valuesTypewriters = [
  {
    check: value => _.isObject(value),
    typify: value => ({ type: 'map', value }),
  },
  {
    check: value => !_.isObject(value),
    typify: value => ({ type: 'primitive', value }),
  },
];

const typifyValue = (value) => {
  const { typify } = valuesTypewriters.find(({ check }) => check(value));
  return typify(value);
};

const astNodesBuilders = [
  {
    check: (configBefore, configAfter, key) => _.has(configBefore, key) && !_.has(configAfter, key),
    build: valueBefore => ({ type: 'removed', valueBefore: typifyValue(valueBefore), valueAfter: null }),
  },

  {
    check: (configBefore, configAfter, key) => !_.has(configBefore, key) && _.has(configAfter, key),
    build: (valueBefore, valueAfter) => ({ type: 'added', valueBefore: null, valueAfter: typifyValue(valueAfter) }),
  },

  {
    check: (configBefore, configAfter, key) => configBefore[key] === configAfter[key],
    build: valueBefore => ({ type: 'unmodified', valueBefore: typifyValue(valueBefore), valueAfter: typifyValue(valueBefore) }),
  },

  {
    check: (configBefore, configAfter, key) => {
      const valueBefore = configBefore[key];
      const valueAfter = configAfter[key];
      return _.isObject(valueBefore) && _.isObject(valueAfter);
    },
    build: (valueBefore, valueAfter, buildDiffAst) => {
      const children = buildDiffAst(valueBefore, valueAfter);
      return {
        type: 'composited',
        children,
        valueBefore: null,
        valueAfter: null,
      };
    },
  },

  {
    check: (configBefore, configAfter, key) => configBefore[key] !== configAfter[key],
    build: (valueBefore, valueAfter) => ({ type: 'modified', valueBefore: typifyValue(valueBefore), valueAfter: typifyValue(valueAfter) }),
  },
];

const buildDiffAst = (configBefore, configAfter) => {
  const keysInConfigs = _.union(_.keys(configBefore), _.keys(configAfter));

  const buildAstNode = (key) => {
    const { build } = astNodesBuilders.find(({ check }) => check(configBefore, configAfter, key));
    const astNode = build(configBefore[key], configAfter[key], buildDiffAst);

    return { ...astNode, name: key };
  };

  return keysInConfigs.map(buildAstNode);
};

const getFileData = pathname => fs.readFileSync(pathname, 'UTF-8');

export default (beforeConfigFilePath, afterConfigFilePath) => {
  const beforeConfigExtension = path.extname(beforeConfigFilePath);
  const afterConfigExtension = path.extname(afterConfigFilePath);

  const configBefore = getParser(beforeConfigExtension)(getFileData(beforeConfigFilePath));
  const configAfter = getParser(afterConfigExtension)(getFileData(afterConfigFilePath));

  const diffAST = buildDiffAst(configBefore, configAfter);

  return renderAst(diffAST);
};
