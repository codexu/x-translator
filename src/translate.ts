import { window, Range, QuickPickItem } from "vscode";
import { words } from 'lodash';
import Translator from './libs/getMainTranslator';
import han from './libs/isHan';
import namingConventions from './libs/namingConventions';
import processingTranslationResults from './libs/processingTranslationResults';
import twiceTranslate from './libs/twiceTranslate';
import showQuickPick from './libs/showQuickPick';

export const translate = async () => {
  const editor = window.activeTextEditor;
  if (!editor) {
    window.showInformationMessage('Open a file first to manipulate text selections');
    return;
  }
  // Access to the selected text
  const selections = editor.selections;
  const range = new Range(selections[0].start, selections[selections.length - 1].end);
  const text = editor.document.getText(range) || '';
  // For the first time to translate
  const translateResult = await Translator.translate(words(text).join(' '));
  // To deal with translation results for the first time
  const processingTranslateResult: string[] = processingTranslationResults(translateResult);
  // The second translation
  const twiceTranslateResult: QuickPickItem[] = await twiceTranslate(processingTranslateResult);
  // Select translation results
  const pickItem: QuickPickItem = await showQuickPick(twiceTranslateResult);
  // To determine whether translation result Chinese or translation result is only one word
  if (han(pickItem.label) || pickItem.label.split(' ').length === 1) {
    // Chinese or a word
    editor.edit(edit => edit.replace(range, pickItem.label));
  } else {
    // Multiple popup choose a naming rules in English
    const quickPick: QuickPickItem[] = namingConventions(pickItem.label);
    showQuickPick(quickPick).then((item: QuickPickItem) => {
      editor.edit(edit => edit.replace(range, <string>item.description));
    });
  }
};
