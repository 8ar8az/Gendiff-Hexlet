import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import getParser from './parsers';

const astNodesFormatingMethods = {
  added: node => `  + ${node.name}: ${node.valueAfter}`,
  removed: node => `  - ${node.name}: ${node.valueBefore}`,
  modified: node => `  + ${node.name}: ${node.valueAfter}\n  - ${node.name}: ${node.valueBefore}`,
  unmodified: node => `    ${node.name}: ${node.valueAfter}`,
};

const formatingAst = (ast) => {
  const formatingAstNode = astNode => astNodesFormatingMethods[astNode.type](astNode);
  return ['{', ...ast.map(formatingAstNode), '}'].join('\n');
};

const astNodesTypewriters = [
  {
    check: (configBefore, configAfter, key) => _.has(configBefore, key) && !_.has(configAfter, key),
    typify: node => ({ ...node, type: 'removed' }),
  },
  {
    check: (configBefore, configAfter, key) => !_.has(configBefore, key) && _.has(configAfter, key),
    typify: node => ({ ...node, type: 'added' }),
  },
  {
    check: (configBefore, configAfter, key) => configBefore[key] !== configAfter[key],
    typify: node => ({ ...node, type: 'modified' }),
  },
  {
    check: (configBefore, configAfter, key) => configBefore[key] === configAfter[key],
    typify: node => ({ ...node, type: 'unmodified' }),
  },
];

const buildDiffAST = (configBefore, configAfter) => {
  const keysInConfigs = _.union(_.keys(configBefore), _.keys(configAfter));

  const makeAstNode = (key) => {
    const valueBefore = configBefore[key];
    const valueAfter = configAfter[key];

    const node = { valueBefore, valueAfter, name: key };

    const { typify } = astNodesTypewriters
      .find(({ check }) => check(configBefore, configAfter, key));

    return typify(node);
  };

  return keysInConfigs.map(makeAstNode);
};

const getFileData = pathname => fs.readFileSync(pathname, 'UTF-8');

export default (beforeConfigFilePath, afterConfigFilePath) => {
  const beforeConfigExtension = path.extname(beforeConfigFilePath);
  const afterConfigExtension = path.extname(afterConfigFilePath);

  const configBefore = getParser(beforeConfigExtension)(getFileData(beforeConfigFilePath));
  const configAfter = getParser(afterConfigExtension)(getFileData(afterConfigFilePath));

  const diffAST = buildDiffAST(configBefore, configAfter);

  return formatingAst(diffAST);
};
