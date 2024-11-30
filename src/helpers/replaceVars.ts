import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

import { E2eTestVar, E2eVarDataType } from '../definitions';
import isArrayDataType from './isArrayDataType';
import computedVars from './computedVars';
import logger from './logger';

const replaceVars = (
  text: string,
  vars: E2eTestVar[],
  iterationIndex?: number,
): string => {
  if (!text) {
    return text;
  }

  let newText = text;

  // Resolving references to other files:
  while(true) {
    const pattern = `\\$\\{file:.*\\}`;
    const regExp = new RegExp(pattern)
    try {
      const startIndex = newText.search(regExp);
      if (startIndex < 0) {
        break;
      }
      const endIndex = newText.indexOf('}', startIndex + 7);
      const path = newText.substring(startIndex + 7, endIndex)
      let content = fs.readFileSync(path, 'utf8');
      if (content) {
        content = content.replace(/[\n\r]/g, ' ');
        content = replaceVars(content, vars, iterationIndex);
        newText = newText.substring(0, startIndex) +
          content +
          newText.substring(endIndex + 1);
      }
    } catch (error) {
      logger.error('replaceVars: error', { error })
    }
  }

  if (
    iterationIndex !== undefined &&
    !isNaN(iterationIndex) &&
    newText.includes('${idx}')
  ) {
    newText = newText.replace(/\$\{idx\}/g, ((iterationIndex || 0) + 1).toString());
  }

  // Replacing environment variables, i.e.:
  // "The red ${env:FOX} jumps" will have "${env:FOX} replaced with process.env.FOX.
  while(true) {
    const pattern = `\\$\\{env:[\\w_]*\\}`;
    const regExp = new RegExp(pattern)
    const startIndex = newText.search(regExp);
    if (startIndex < 0) {
      break;
    }
    const endIndex = newText.indexOf('}', startIndex + 6);
    const varName = newText.substring(startIndex + 6, endIndex)
    newText = newText.substring(0, startIndex) +
      (process.env[varName] || '') +
      newText.substring(endIndex + 1);
  }

  // Replacing UUID variables:
  // "This is an UUID: ${:uuid}!" will be: "This is an a6b6292fc8a1fae1b016ecc4453ab3b1!"
  while(true) {
    const startIndex = newText.indexOf('${rand:uuid}');
    if (startIndex < 0) {
      break;
    }
    newText = newText.substring(0, startIndex) +
      uuidv4().replace(/-/g, '') +
      newText.substring(startIndex + 12);
  }

  for (const randVar of computedVars) {
    const newValue = randVar.func();

    while(true) {
      const startIndex = newText.indexOf(randVar.varName);
      if (startIndex < 0) {
        break;
      }
      newText = newText.substring(0, startIndex) +
        newValue +
        newText.substring(startIndex + randVar.varName.length);
    }
  }

  if (
    !vars ||
    !Array.isArray(vars) ||
    vars.length < 1
  ) {
    return newText;
  }

  const replaceWithVariable = (
    text: string,
    variable: E2eTestVar,
  ): { found: boolean, newText: string } => {
    let newText = text;
    const pattern = `\\$\\{${variable.name}(\\[\\d*\\])*\\}`;
    const regExp = new RegExp(pattern, 'g');

    const patternNumber = `"\\$\\{${variable.name}(\\[\\d*\\])*\\}"`;
    const regExpNumber = new RegExp(patternNumber, 'g');

    if (!newText.match(regExp)) {
      return { found: false, newText };
    }

    if (isArrayDataType(variable.dataType)) {
      if (Array.isArray(variable.value)) {
        let arrayIdx = iterationIndex;

        // Reading out the array index, if it was supplied like: userId[2]
        const startIndex = newText.search(regExp);
        const startIndexOfArrayIdx = newText.indexOf('[', startIndex);
        if (startIndexOfArrayIdx > -1) {
          let idx = newText.substring(startIndexOfArrayIdx + 1);
          const endIndex = idx.indexOf(']')
          idx = idx.substring(0, endIndex)
          if (idx !== 'idx' && !isNaN(Number(idx))) {
            arrayIdx = Number.parseInt(idx);
          }
        }

        if (
          (arrayIdx || arrayIdx === 0) &&
          Number.isInteger(arrayIdx) &&
          arrayIdx > -1 &&
          arrayIdx < variable.value.length
        ) {
          const patternWithIndex = `\\$\\{${variable.name}(\\[${arrayIdx}\\])*\\}`;
          const regExpWithIndex = new RegExp(patternWithIndex, 'g')

          const value = variable.value[arrayIdx];
          newText = newText.replace(regExpWithIndex, value ? value.toString() : '');
        }
      }
    } else if (variable.dataType === E2eVarDataType.string) {
      newText = newText.replace(regExp, variable.value ? variable.value.toString() : '');
    } else if (variable.dataType === E2eVarDataType.number) {
      newText = newText.replace(regExpNumber, variable.value ? variable.value.toString() : '');
    }

    return { found: newText !== text, newText };
  }

  for (const variable of vars) {
    // `replaceWithVariable` can only replace a reference with a single array index.
    // If `text` contains multiple references to this variable using different indexes,
    // they have to be replaced with a separate call to `replaceWithVariable`.
    // Example: `text = 'This is the first reference: ${userIds[0]}, now another one: ${userIds[1]}'`
    let found = false;
    do {
      ({ found, newText } = replaceWithVariable(newText, variable));
    } while (found)
  }

  // Variables can contain reference other variables:
  if (newText.includes('${') && newText !== text) {
    return replaceVars(newText, vars, iterationIndex);
  }

  return newText;
};

export default replaceVars;
