const parseArrayIndex = (
  varNameWithIndex: string,
  iterationIndex: number | null | undefined,
  startIndex?: number,
): { varName: string, arrayIndex: number } => {
  let arrayIndex = -1;
  const openBracketIndex = varNameWithIndex.indexOf('[', startIndex);

  if (openBracketIndex < 0) {
    return { varName: varNameWithIndex, arrayIndex: -1 };
  }

  const varName = varNameWithIndex.substring(0, openBracketIndex);
  let indexString = varNameWithIndex.substring(openBracketIndex + 1);
  const closedBracketIndex = indexString.indexOf(']');

  if (closedBracketIndex < 0) {
    return { varName, arrayIndex: -1 };
  }

  indexString = indexString.substring(0, closedBracketIndex)

  if (
    indexString === 'idx' &&
    (iterationIndex || iterationIndex === 0) &&
    !isNaN(iterationIndex)
  ) {
    arrayIndex = iterationIndex;
  } else if (!isNaN(Number(indexString))) {
    arrayIndex = Number.parseInt(indexString);
  }

  return { varName, arrayIndex };
}

export default parseArrayIndex;

