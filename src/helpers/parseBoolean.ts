const parseBoolean = (
  text: string | null | undefined,
  defaultValue?: boolean,
): boolean | undefined => {
  if (!text) {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'y', 't', 'on'].includes(text.toLowerCase())
};

export default parseBoolean;
