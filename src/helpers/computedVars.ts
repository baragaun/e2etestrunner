import Chance from 'chance';

import randPhoneNumber from './randPhoneNumber';

// @ts-ignore
const chance = new Chance();

const computedVars = [
  { varName: '${rand:word}', func: () => chance.word() },
  { varName: '${rand:sentence}', func: () => chance.sentence() },
  { varName: '${rand:paragraph}', func: () => chance.paragraph() },
  { varName: '${rand:firstName}', func: () => chance.first() },
  { varName: '${rand:lastName}', func: () => chance.last() },
  { varName: '${rand:phoneNumber}', func: () => randPhoneNumber() },
  { varName: '${rand:gender}', func: () => chance.pickone(['', '-', 'f', 'm', 'x']) },
]

export default computedVars
