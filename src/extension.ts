import {
	commands,
	ExtensionContext,
} from "vscode";
import { translate } from './translate';

export function activate(context: ExtensionContext) {
	let disposable = commands.registerCommand('extension.XTranslator', () => {
		translate();
	});

	context.subscriptions.push(disposable);
}
