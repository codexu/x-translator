import {
	window as vswindow,
	Range,
  QuickPickItem,
} from "vscode";
import { google } from 'translation.js';

interface GoogleTranslateResult {
  raw: Array<Array<Array<Array<string>>>>;
  dict?: Array<string>;
  result?: Array<string>;
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
  google.translate(text).then(async (res: GoogleTranslateResult) => {
    const translateData: string[] = [];
    if (res.result ) {
      translateData.push(res.result[0]);
    }
    if (res.raw[1]) {
      res.raw[1].forEach((rawItem) => {
        rawItem[1].forEach(item => {
          if (item !== translateData[0]) {
            translateData.push(item);
          }
        });
      });
    }
    if (translateData.length === 0) {
      vswindow.showInformationMessage('Translation failed!');
    }
    twiceTranslate(translateData).then((twiceTranslateResult: QuickPickItem[]) => {
      vswindow.showQuickPick(twiceTranslateResult, {
        matchOnDescription: true
      }).then((item: QuickPickItem | undefined) => {
        if (item !== undefined) {
          editor.edit(edit => edit.replace(range, item.label));
        }
      });
    }).catch(() => {
      vswindow.showInformationMessage('Translation failed!');
    });
  });
};

// 为每一项进行翻译
async function twiceTranslate (data: string[]): Promise<QuickPickItem[]> {
  const result: QuickPickItem[] = data.map((item: string) => {
    const quickPickItem: QuickPickItem = { label: item.replace(/\[.*?\] /g,'') };
    return quickPickItem;
  });
  const promises = result.map(async item => {
    await google.translate(item.label).then((res: GoogleTranslateResult) => {
      return item.detail = res.dict ? res.dict.join('  |  ') : '';
    });
  });
  await Promise.all(promises);
  return result;
}