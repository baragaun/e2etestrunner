const mergeVars = (
  vars1: { [key: string]: string } | undefined,
  vars2: { [key: string]: string } | undefined,
): { [key: string]: string } | undefined => {
  if (!vars1) {
    return vars2;
  }
  if (!vars2) {
    return vars1;
  }
  const result = { ...vars1 };

  Object.keys(vars2).forEach((key) => {
    result[key] = vars2[key];
  });

  return result;
};

export default mergeVars;
