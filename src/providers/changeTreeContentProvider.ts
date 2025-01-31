import * as vscode from 'vscode';

export class ChangeTreeContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    readonly onDidChange = this._onDidChange.event;

    constructor(private content: string) {}

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.content;
    }

    update(content: string) {
        this.content = content;
        this._onDidChange.fire(vscode.Uri.parse('change-tree://authority/Change Tree'));
    }
}