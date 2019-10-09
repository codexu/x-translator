import {
	window as vswindow,
	commands,
	ExtensionContext,
	Range
} from "vscode";
import translate from './translate';

export function activate(context: ExtensionContext) {
	let disposable = commands.registerCommand('extension.XTranslator', () => {
		const editor = vswindow.activeTextEditor;
		if (!editor) {
			vswindow.showInformationMessage('Open a file first to manipulate text selections');
			return;
		}
		const selections = editor.selections;
		const range = new Range(selections[0].start, selections[selections.length - 1].end);
		const text = editor.document.getText(range) || '';
		translate(text).then((res) => {
			if(!('dict' in res)) {
				vswindow.showInformationMessage('翻译失败！');
			}
			let data = <string[]>res.dict;
			data = data.map(item => item.replace(/\[.*?\] /g,''));
			if (data.length > 1) {
				vswindow.showQuickPick(data, {
					matchOnDescription: true
				}).then((item) => {
					editor.edit(edit => edit.replace(range, <string>item));
				});
			} else {
				editor.edit(edit => edit.replace(range, data[0]));
			}
		});
	});

	context.subscriptions.push(disposable);
}
