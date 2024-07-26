import { v4 as uuidv4 } from 'uuid'
import fs from 'fs';

import { E2eTestVar } from '../definitions';
import isArrayDataType from './isArrayDataType';
import computedVars from './computedVars';

const replaceVars = (
  text: string,
  vars: E2eTestVar[],
  iterationIndex: number | undefined,
): string => {
  if (
    !text ||
    !vars ||
    !Array.isArray(vars) ||
    vars.length < 1
  ) {
    return text;
  }

  let newText = text;

  // Resolving references to other files:
  while(true) {
    const pattern = `\\$\\{file:.*\\}`;
    const regExp = new RegExp(pattern)
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

  for (const variable of vars) {
    const pattern = `\\$\\{${variable.name}(\\[\\d*\\])*\\}`;
    const regExp = new RegExp(pattern, 'g')

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

        if (arrayIdx > -1 && arrayIdx < variable.value.length) {
          const value = variable.value[arrayIdx];
          newText = newText.replace(regExp, value ? value.toString() : '');
        }
      }
    } else {
      newText = newText.replace(regExp, variable.value ? variable.value.toString() : '');
    }
  }

  // Variables can contain reference other variables:
  if (newText.includes('${') && newText !== text) {
    return replaceVars(newText, vars, iterationIndex);
  }

  return newText;
};

export default replaceVars;
