import _ from 'lodash';
import getValueType from './value-typify';

const namespaceSeparator = '.';

const valueRenderMethods = {
  primitive: _.identity,
  map: _.constant('[complex value]'),
  string: value => `'${value}'`,
};

const getFullNodeName = (namespace, nodeName) => [...namespace, nodeName].join(namespaceSeparator);
const getRenderedValue = (value) => {
  const valueType = getValueType(value);
  return valueRenderMethods[valueType](value);
};

const astNodesRenderMethods = {
  added: ({ name, valueAfter }, namespace) => {
    const fullNodeName = getFullNodeName(namespace, name);
    const renderedValue = getRenderedValue(valueAfter);
    return `Property '${fullNodeName}' was added with value: ${renderedValue}`;
  },

  removed: ({ name }, namespace) => {
    const fullNodeName = getFullNodeName(namespace, name);
    return `Property '${fullNodeName}' was removed`;
  },

  modified: ({ name, valueAfter, valueBefore }, namespace) => {
    const fullNodeName = getFullNodeName(namespace, name);
    const renderedValueAfter = getRenderedValue(valueAfter);
    const renderedValueBefore = getRenderedValue(valueBefore);

    return `Property '${fullNodeName}' was updated. From ${renderedValueBefore} to ${renderedValueAfter}`;
  },

  unmodified: _.constant(''),

  composited: ({ name, children }, namespace, renderAst) => {
    const newNamespace = [...namespace, name];
    return renderAst(children, newNamespace);
  },
};

const renderAst = (ast, namespace = []) => {
  const renderAstNode = (astNode) => {
    const astNodeRenderMethod = astNodesRenderMethods[astNode.type];
    return astNodeRenderMethod(astNode, namespace, renderAst);
  };

  return _.compact(ast.map(renderAstNode)).join('\n');
};

export default renderAst;
