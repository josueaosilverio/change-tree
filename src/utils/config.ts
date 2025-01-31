import * as vscode from 'vscode';

export function getConfig() {
    const config = vscode.workspace.getConfiguration('changeTree');
    return {
        includeFolderIcon: config.get<boolean>('includeFolderIcon', false),
        includeFileIcon: config.get<boolean>('includeFileIcon', true),
        overwriteIcon: {
            folder: config.get<string>('overwriteIcon.added', '📁'),
            added: config.get<string>('overwriteIcon.added', '🟢'),
            modified: config.get<string>('overwriteIcon.modified', '🟡'),
            deleted: config.get<string>('overwriteIcon.deleted', '🔴'),
            default: config.get<string>('overwriteIcon.deleted', '⚪'),
        },
    };
}