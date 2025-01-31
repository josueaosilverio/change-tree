import * as vscode from 'vscode';
import { ChangeTreeContentProvider } from './providers/changeTreeContentProvider';
import { showTreeCommand } from './commands/showTree';
import { showFlatListCommand } from './commands/showFlatList';

export async function activate(context: vscode.ExtensionContext) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return;
    }

    // Register the content provider
    const changeTreeProvider = new ChangeTreeContentProvider('');
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider('change-tree', changeTreeProvider)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('changeTree.showTree', () => showTreeCommand(workspaceRoot, changeTreeProvider))
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('changeTree.showFlatList', () => showFlatListCommand(workspaceRoot, changeTreeProvider))
    );
}

export function deactivate() {}