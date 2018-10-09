import yaml from 'js-yaml';

export default {
  '.json': JSON.parse,
  '.yml': yaml.safeLoad,
};
