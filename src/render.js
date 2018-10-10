import _ from 'lodash';

const standardIndentSize = 4;

const getIndent = depth => _.repeat(' ', depth * standardIndentSize);

const valueRenderMethods = {
  primitive: ({ value }) => value,

  map: ({ value }, depth) => {
    const indent = getIndent(depth);
    const renderKeyValuePair = key => `${indent}    ${key}: ${value[key]}`;
    const renderedKeyValuePairs = _.keys(value).map(renderKeyValuePair);
    return ['{', ...renderedKeyValuePairs, `${indent}}`].join('\n');
  },
};

const astNodesRenderMethods = {
  added: ({ name, valueAfter }, depth) => {
    const renderedValueAfter = valueRenderMethods[valueAfter.type](valueAfter, depth + 1);
    const indent = getIndent(depth);
    return `${indent}  + ${name}: ${renderedValueAfter}`;
  },

  removed: ({ name, valueBefore }, depth) => {
    const renderedValueBefore = valueRenderMethods[valueBefore.type](valueBefore, depth + 1);
    const indent = getIndent(depth);
    return `${indent}  - ${name}: ${renderedValueBefore}`;
  },

  modified: ({ name, valueAfter, valueBefore }, depth) => {
    const renderedValueBefore = valueRenderMethods[valueBefore.type](valueBefore, depth + 1);
    const renderedValueAfter = valueRenderMethods[valueAfter.type](valueAfter, depth + 1);
    const indent = getIndent(depth);
    return `${indent}  - ${name}: ${renderedValueBefore}\n${indent}  + ${name}: ${renderedValueAfter}`;
  },

  unmodified: ({ name, valueBefore }, depth) => {
    const renderedValueBefore = valueRenderMethods[valueBefore.type](valueBefore, depth + 1);
    const indent = getIndent(depth);
    return `${indent}    ${name}: ${renderedValueBefore}`;
  },

  composited: ({ name, children }, depth, renderAst) => {
    const indent = getIndent(depth);
    return `${indent}    ${name}: ${renderAst(children, depth + 1)}`;
  },
};

const renderAst = (ast, depth = 0) => {
  const renderAstNode = astNode => astNodesRenderMethods[astNode.type](astNode, depth, renderAst);
  const renderedAst = ast.map(renderAstNode);

  const indent = getIndent(depth);
  return ['{', ...renderedAst, `${indent}}`].join('\n');
};

export default renderAst;
