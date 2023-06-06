import * as vscode from "vscode";
import translate from "./translate";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "x-translator.translator",
    translate
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
