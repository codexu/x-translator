import { GoogleTranslateResult } from './interface';

// 处理请求结果数据
export default function ProcessingTranslationResults (res: GoogleTranslateResult): string[] {
  let TranslationResults: string[] = [];
  if (res.result) {
    TranslationResults.push(res.result[0]);
  }
  if (TranslationResults) {
    if (res.raw[1]) {
      res.raw[1].forEach((rawItem) => {
        rawItem[1].forEach(item => {
          if (item !== TranslationResults[0]) {
            TranslationResults.push(item);
          }
        });
      });
    }
  }
  return TranslationResults;
}