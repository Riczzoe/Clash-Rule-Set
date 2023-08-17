module.exports.parse = (raw, { yaml }) => {
  const rawObj = yaml.parse(raw)
  const groups = []
  const rules = []
  return yaml.stringify({ ...rawObj, 'proxy-groups': groups, rules })
} 
