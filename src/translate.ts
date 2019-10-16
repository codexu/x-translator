import {
	window as vswindow,
	Range,
  QuickPickItem,
} from "vscode";
import { google } from 'translation.js';
import han from './isHan';
import * as ConvertString from './convertString';

interface GoogleTranslateResult {
  raw: string[][][][];
  dict?: string[];
  result?: string[];
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
    const translateData: string[] = ProcessingTranslationResults(res);
    twiceTranslate(translateData).then((twiceTranslateResult: QuickPickItem[]) => {
      showQuickPick(twiceTranslateResult).then((item: QuickPickItem) => {
        if (han(item.label) || item.label.split(' ').length === 1) {
          editor.edit(edit => edit.replace(range, item.label));
        } else {
          const quickPick: QuickPickItem[] = namingConventions(item.label);
          showQuickPick(quickPick).then((item: QuickPickItem) => {
            editor.edit(edit => edit.replace(range, <string>item.description));
          });
        }
      });
    }).catch(() => {
      vswindow.showInformationMessage('Translation failed!');
    });
  });
};

// 处理请求结果数据
function ProcessingTranslationResults (res: GoogleTranslateResult): string[] {
  const TranslationResults: string[] = [];
  if (res.result ) {
    TranslationResults.push(res.result[0]);
  }
  if (res.raw[1]) {
    res.raw[1].forEach((rawItem) => {
      rawItem[1].forEach(item => {
        if (item !== TranslationResults[0]) {
          TranslationResults.push(item);
        }
      });
    });
  }
  if (TranslationResults.length === 0) {
    vswindow.showInformationMessage('Translation failed!');
  }
  return TranslationResults;
}

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

// 翻译结果 展示 -> 快速选择栏
function showQuickPick (twiceTranslateResult: QuickPickItem[]): Promise<QuickPickItem> {
  return new Promise(resolve => {
    vswindow.showQuickPick(twiceTranslateResult, {
      matchOnDescription: true
    }).then((item: QuickPickItem | undefined) => {
      if (item !== undefined) {
        resolve(item);
      }
    });
  });
}

// 命名规则转化
function namingConventions (str: string) {
  return [
    {
      label: '默认',
      description: str
    },
    {
      label: '小驼峰',
      description: ConvertString.smallHump(str)
    },
    {
      label: '大驼峰',
      description: ConvertString.bigHump(str)
    },
    {
      label: '连词线',
      description: ConvertString.wordLine(str)
    },
    {
      label: '下划线',
      description: ConvertString.underline(str)
    },
    {
      label: '常量',
      description: ConvertString.constant(str)
    },
  ];
}
