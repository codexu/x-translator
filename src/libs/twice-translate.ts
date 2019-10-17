import { QuickPickItem } from "vscode";
import Translator from './get-main-translator';
import { TranslateResult } from './interface';

// 为每一项进行翻译
export default async function twiceTranslate (data: string[]): Promise<QuickPickItem[]> {
  const result: QuickPickItem[] = data.map((item: string) => {
    const quickPickItem: QuickPickItem = { label: item };
    return quickPickItem;
  });
  const promises = result.map(async item => {
    await Translator.translate(item.label).then((res: TranslateResult) => {
      let result = '';
      result += `【${res.result}】`;
      if (res.dict) {
        res.dict.forEach(item => result += ` [ ${item} ]`);
      }
      item.detail = result;
    });
  });
  await Promise.all(promises);
  return result;
}