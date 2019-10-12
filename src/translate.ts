import {
	window as vswindow,
	Range,
  QuickPickItem,
} from "vscode";
import { youdao } from 'translation.js';

export interface TranslatorResult {
  dict?: string[];
}

export const translate = () => {
  const editor = vswindow.activeTextEditor;
  if (!editor) {
    vswindow.showInformationMessage('Open a file first to manipulate text selections');
    return;
  }
  const selections = editor.selections;
  const range = new Range(selections[0].start, selections[selections.length - 1].end);
  const text = editor.document.getText(range) || '';
  youdao.translate(text).then(async (res: TranslatorResult) => {
    if(res.dict) {
      twiceTranslate(res.dict).then((twiceTranslateResult: QuickPickItem[]) => {
        vswindow.showQuickPick(twiceTranslateResult, {
          matchOnDescription: true
        }).then((item: QuickPickItem | undefined) => {
          if (item !== undefined) {
            editor.edit(edit => edit.replace(range, item.label));
          }
        });
      });
    } else {
      vswindow.showInformationMessage('Translation failed!');
    }
  });
};

// 为每一项进行翻译
async function twiceTranslate (data: string[]): Promise<QuickPickItem[]> {
  const result: QuickPickItem[] = data.map((item: string) => {
    const quickPickItem: QuickPickItem = { label: item.replace(/\[.*?\] /g,'') };
    return quickPickItem;
  });
  const promises = result.map(async item => {
    await youdao.translate(item.label).then((res: TranslatorResult) => {
      return item.detail = res.dict ? res.dict.join('  |  ') : '';
    });
  });
  await Promise.all(promises);
  return result;
}