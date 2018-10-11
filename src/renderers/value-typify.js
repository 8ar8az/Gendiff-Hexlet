import { isObject, isString } from 'lodash';

const valueTypes = [
  {
    type: 'string',
    check: value => isString(value),
  },
  {
    type: 'map',
    check: value => isObject(value),
  },
  {
    type: 'primitive',
    check: value => !isObject(value),
  },
];

export default (value) => {
  const { type } = valueTypes.find(({ check }) => check(value));
  return type;
};
