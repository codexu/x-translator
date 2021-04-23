import { window, QuickPickItem } from "vscode";

// Translation results show rapid choose toolbar
export default function showQuickPick (res: QuickPickItem[]): Promise<QuickPickItem> {
  return new Promise(resolve => {
    window.showQuickPick(res, {
      matchOnDescription: true
    }).then((item: QuickPickItem | undefined) => {
      if (item !== undefined) {
        resolve(item);
      }
    });
  });
}