import * as vscode from 'vscode';
import { generateTreeStructure } from '../utils/treeStructure';
import { ChangeTreeContentProvider } from '../providers/changeTreeContentProvider';
import { getChanges } from '../utils/changes';

export async function showTreeCommand(workspaceRoot: string, changeTreeProvider: ChangeTreeContentProvider) {
    const changes = await getChanges();
    if (!changes) {
        vscode.window.showErrorMessage('No Git or SVN repository found.');
        return;
    }

    const treeStructure = generateTreeStructure(changes, workspaceRoot);
    changeTreeProvider.update(treeStructure);

    const uri = vscode.Uri.parse('change-tree://authority/Change Tree');
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.Beside });
}