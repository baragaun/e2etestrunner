const replaceVarsInObject = (
  obj: { [key: string]: string } | undefined,
  vars: { [key: string]: string } | undefined,
): { [key: string]: string } | undefined => {
  if (
    !obj ||
    Object.keys(obj).length < 1 ||
    !vars ||
    Object.keys(vars).length < 1
  ) {
    return obj;
  }

  Object.keys(obj).forEach((objKey) => {
    Object.keys(vars).forEach((varKey) => {
      obj[objKey] = obj[objKey].replace(`\${${varKey}}`, vars[varKey]);
    });
  });

  return obj;
};

export default replaceVarsInObject;
