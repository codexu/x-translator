import { window, Range, QuickPickItem } from "vscode";
import { words } from "lodash";
import processingTranslationResults from "./libs/processingTranslationResults";
import showQuickPick from "./libs/showQuickPick";
import namingConventions from "./libs/namingConventions";
import YouDaoJS from "youdaojs";

const translator = new YouDaoJS();

const isChinese = require("is-chinese");

export default async function() {
  const editor = window.activeTextEditor;
  if (!editor) {
    window.showInformationMessage(
      "Open a file first to manipulate text selections"
    );
    return;
  }
  // 获取选中的文本
  const selections = editor.selections;
  const range = new Range(
    selections[0].start,
    selections[selections.length - 1].end
  );
  const text = editor.document.getText(range) || "";
  const textIsChinese = isChinese(text);
  // 翻译
  const translateResult = await translator.getResult(
    words(text).join(" "),
    textIsChinese ? 1 : 2,
    textIsChinese ? 2 : 1
  );
  // 处理翻译结果
  const processingTranslateResult = await processingTranslationResults(translateResult);
  const pickItem = await showQuickPick(processingTranslateResult);
  if (isChinese(pickItem.label) || pickItem.label.split(" ").length === 1) {
    editor.edit((edit) => edit.replace(range, pickItem.label));
  } else {
    const quickPick: QuickPickItem[] = namingConventions(pickItem.label);
    showQuickPick(quickPick).then((item: QuickPickItem) => {
      editor.edit((edit) => edit.replace(range, <string>item.description));
    });
  }
};
