import _ from 'lodash';

const standardIndentSize = 4;

const getIndent = depth => _.repeat(' ', depth * standardIndentSize);

const formatCharacters = {
  added: '+',
  removed: '-',
  unmodified: ' ',
};

const blockCharacters = {
  opened: '{',
  closed: '}',
};

const getValueType = (value) => {
  if (_.isObject(value)) {
    return 'map';
  }
  return 'primitive';
};

const valueRenderMethods = {
  primitive: _.identity,

  map: (value, depth) => {
    const indent = getIndent(depth);
    const renderKeyValuePair = key => `${indent}    ${key}: ${value[key]}`;
    const renderedKeyValuePairs = _.keys(value).map(renderKeyValuePair);
    return [blockCharacters.opened, ...renderedKeyValuePairs, `${indent}${blockCharacters.closed}`].join('\n');
  },
};

const getValueString = (name, value, depth, formatCharacter) => {
  const valueType = getValueType(value);
  const renderedValue = valueRenderMethods[valueType](value, depth + 1);
  const indent = getIndent(depth);
  return `${indent}  ${formatCharacter} ${name}: ${renderedValue}`;
};

const astNodesRenderMethods = {
  added: (
    { name, valueAfter },
    depth,
  ) => getValueString(name, valueAfter, depth, formatCharacters.added),

  removed: (
    { name, valueBefore },
    depth,
  ) => getValueString(name, valueBefore, depth, formatCharacters.removed),

  modified: ({ name, valueAfter, valueBefore }, depth) => {
    const valueBeforeString = getValueString(name, valueBefore, depth, formatCharacters.removed);
    const valueAfterString = getValueString(name, valueAfter, depth, formatCharacters.added);

    return [valueBeforeString, valueAfterString];
  },

  unmodified: (
    { name, valueBefore },
    depth,
  ) => getValueString(name, valueBefore, depth, formatCharacters.unmodified),

  composited: ({ name, children }, depth, renderAst) => {
    const indent = getIndent(depth);
    return `${indent}    ${name}: ${renderAst(children, depth + 1)}`;
  },
};

const renderAst = (ast, depth = 0) => {
  const renderAstNode = astNode => astNodesRenderMethods[astNode.type](astNode, depth, renderAst);
  const renderedAst = _.flatten(ast.map(renderAstNode));

  const indent = getIndent(depth);
  return [blockCharacters.opened, ...renderedAst, `${indent}${blockCharacters.closed}`].join('\n');
};

export default renderAst;
