const mergeHeaders = (
  headers1: { [key: string]: string } | undefined,
  headers2: { [key: string]: string } | undefined,
): { [key: string]: string } | undefined => {
  if (!headers1) {
    return headers2;
  }
  if (!headers2) {
    return headers1;
  }
  const result = { ...headers1 };

  Object.keys(headers2).forEach((key) => {
    result[key] = headers2[key];
  });

  return result;
};

export default mergeHeaders;
