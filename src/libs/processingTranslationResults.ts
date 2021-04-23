import { TranslateResult } from './interface';

import * as _ from 'lodash';

// The resulting data processing request
export default function ProcessingTranslationResults (res: TranslateResult): string[] {
  let result: string[] = [];
  if (res.dict) {
    result.push(...res.dict);
  }
  if (res.result) {
    result.push(res.result[0]);
  }
  result = result.map(item => item.replace(/\[.*?\] /g,''));
  result = _.uniq(result).filter(item => !_.isEmpty(item));
  return result;
}