import { commands, ExtensionContext } from "vscode";
import { translate } from './translate';

export function activate(context: ExtensionContext) {
	let disposable = commands.registerCommand('extension.x-translator', () => translate());
	context.subscriptions.push(disposable);
}
