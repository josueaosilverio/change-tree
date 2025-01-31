import * as vscode from 'vscode';
import { generateFlatListStructure } from '../utils/flatListStructure';
import { ChangeTreeContentProvider } from '../providers/changeTreeContentProvider';
import { getChanges } from '../utils/changes';

export async function showFlatListCommand(workspaceRoot: string, changeTreeProvider: ChangeTreeContentProvider) {
    const changes = await getChanges();
    if (!changes) {
        vscode.window.showErrorMessage('No Git or SVN repository found.');
        return;
    }

    const flatListStructure = generateFlatListStructure(changes, workspaceRoot);
    changeTreeProvider.update(flatListStructure);

    const uri = vscode.Uri.parse('change-tree://authority/Flat List');
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.Beside });
}