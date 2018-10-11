import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import getParser from './parsers';
import renderers from './renderers';

const astNodesBuilders = [
  {
    check: (configBefore, configAfter, key) => _.has(configBefore, key) && !_.has(configAfter, key),
    build: valueBefore => ({ type: 'removed', valueBefore }),
  },

  {
    check: (configBefore, configAfter, key) => !_.has(configBefore, key) && _.has(configAfter, key),
    build: (valueBefore, valueAfter) => ({ type: 'added', valueAfter }),
  },

  {
    check: (configBefore, configAfter, key) => configBefore[key] === configAfter[key],
    build: valueBefore => ({ type: 'unmodified', valueBefore, valueAfter: valueBefore }),
  },

  {
    check: (configBefore, configAfter, key) => {
      const valueBefore = configBefore[key];
      const valueAfter = configAfter[key];
      return _.isObject(valueBefore) && _.isObject(valueAfter);
    },
    build: (valueBefore, valueAfter, buildDiffAst) => {
      const children = buildDiffAst(valueBefore, valueAfter);
      return { type: 'composited', children };
    },
  },

  {
    check: (configBefore, configAfter, key) => configBefore[key] !== configAfter[key],
    build: (valueBefore, valueAfter) => ({ type: 'modified', valueBefore, valueAfter }),
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

export default (beforeConfigFilePath, afterConfigFilePath, renderFormat) => {
  const beforeConfigExtension = path.extname(beforeConfigFilePath);
  const afterConfigExtension = path.extname(afterConfigFilePath);

  const configBefore = getParser(beforeConfigExtension)(getFileData(beforeConfigFilePath));
  const configAfter = getParser(afterConfigExtension)(getFileData(afterConfigFilePath));

  const diffAST = buildDiffAst(configBefore, configAfter);

  return renderers[renderFormat](diffAST);
};
