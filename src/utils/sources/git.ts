import * as vscode from 'vscode';

export async function getGitChanges(): Promise<{ label: string; state: string }[] | undefined> {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    if (!gitExtension) {
        return undefined; // Git extension not found
    }

    const git = gitExtension.getAPI(1);
    const repo = git.repositories[0]; // Use the first repository
    if (!repo) {
        return undefined; // No Git repository found
    }

    const changes = await repo.state.workingTreeChanges;
    return changes.map((change: { uri: { fsPath: any; }; status: number; }) => ({
        label: change.uri.fsPath,
        state: change.status === 5 ? 'modified' : change.status === 7 ? 'added' : 'deleted',
    }));
}