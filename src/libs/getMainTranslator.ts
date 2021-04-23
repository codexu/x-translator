import * as Translate from 'translation.js';
import { workspace } from "vscode";

// Through the user configuration, set the translation provider
let config: keyof typeof Translate = workspace.getConfiguration('x-translator').type;
export default Translate[config];
