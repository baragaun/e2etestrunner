const replaceVars = (text: string, vars: { [key: string]: string } | undefined): string => {
  if (!text || !vars || Object.keys(vars).length < 1) {
    return text;
  }

  let newText = text;

  Object.keys(vars).forEach((key) => {
    newText = newText.replace(`\${${key}}`, vars[key]);
  });

  return newText;
};

export default replaceVars;
