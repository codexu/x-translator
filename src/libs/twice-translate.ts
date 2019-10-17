import { QuickPickItem } from "vscode";
import Translator from './get-main-translator';
import { GoogleTranslateResult } from './interface';

// 为每一项进行翻译
export default async function twiceTranslate (data: string[]): Promise<QuickPickItem[]> {
  const result: QuickPickItem[] = data.map((item: string) => {
    const quickPickItem: QuickPickItem = { label: item.replace(/\[.*?\] /g,'') };
    return quickPickItem;
  });
  const promises = result.map(async item => {
    await Translator.translate(item.label).then((res: GoogleTranslateResult) => {
      return item.detail = res.dict ? res.dict.join('  |  ') : '';
    });
  });
  await Promise.all(promises);
  return result;
}