import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import parsers from './parsers';

const formatingAst = (ast) => {
  const formatingAstNode = (astNode) => {
    if (astNode.type === 'added') {
      return `  + ${astNode.name}: ${astNode.valueAfter}`;
    }
    if (astNode.type === 'removed') {
      return `  - ${astNode.name}: ${astNode.valueBefore}`;
    }
    if (astNode.type === 'modified') {
      return `  + ${astNode.name}: ${astNode.valueAfter}\n  - ${astNode.name}: ${astNode.valueBefore}`;
    }
    return `    ${astNode.name}: ${astNode.valueBefore}`;
  };

  return ['{', ...ast.map(formatingAstNode), '}'].join('\n');
};

const buildDiffAST = (configBefore, configAfter) => {
  const keysInConfigs = _.union(_.keys(configBefore), _.keys(configAfter));

  const makeAstNode = (key) => {
    if (_.has(configBefore, key) && !_.has(configAfter, key)) {
      return {
        type: 'removed',
        valueBefore: configBefore[key],
        valueAfter: null,
        name: key,
      };
    }
    if (!_.has(configBefore, key) && _.has(configAfter, key)) {
      return {
        type: 'added',
        valueBefore: null,
        valueAfter: configAfter[key],
        name: key,
      };
    }
    if (configBefore[key] !== configAfter[key]) {
      return {
        type: 'modified',
        valueBefore: configBefore[key],
        valueAfter: configAfter[key],
        name: key,
      };
    }
    return {
      type: 'unmodified',
      valueBefore: configBefore[key],
      valueAfter: configAfter[key],
      name: key,
    };
  };

  return keysInConfigs.map(makeAstNode);
};

const getFileData = (pathname) => {
  const absolutePathname = path.resolve(process.cwd(), pathname);
  return fs.readFileSync(absolutePathname, 'UTF-8');
};

export default (beforeConfigFilePath, afterConfigFilePath) => {
  const beforeConfigExtension = path.extname(beforeConfigFilePath);
  const afterConfigExtension = path.extname(afterConfigFilePath);

  const configBefore = parsers[beforeConfigExtension](getFileData(beforeConfigFilePath));
  const configAfter = parsers[afterConfigExtension](getFileData(afterConfigFilePath));

  const diffAST = buildDiffAST(configBefore, configAfter);

  return formatingAst(diffAST);
};
