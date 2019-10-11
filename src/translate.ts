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
      let data: any[] = await processingData(res.dict);
      if (data.length > 1) {
        vswindow.showQuickPick(data, {
          matchOnDescription: true
        }).then((item: QuickPickItem) => {
          editor.edit(edit => edit.replace(range, item.label));
        });
      } else {
        editor.edit(edit => edit.replace(range, data[0].label));
      }
    } else {
      vswindow.showInformationMessage('Translation failed!');
    }
  });
};

// 为每一项进行翻译
async function processingData (data: string[]) {
  const _data: QuickPickItem[] = data.map((item: string) => {
    const label = item.replace(/\[.*?\] /g,'');
    return {
      label,
      description: '',
      detail: ''
    };
  });
  const promises = _data.map(async(item) => {
    await youdao.translate(item.label).then((res: TranslatorResult) => item.detail = res.dict ? res.dict.join('  |  ') : '');
  });
  await Promise.all(promises);
  return _data;
}