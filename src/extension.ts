import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

// Get configuration values
function getConfig() {
    const config = vscode.workspace.getConfiguration('changeTree');
    return {
        includeFolderIcon: config.get<boolean>('includeFolderIcon', false),
        includeFileIcon: config.get<boolean>('includeFileIcon', true),
        overwriteIcon: {
            folder: config.get<string>('overwriteIcon.folder', '📁'),
            added: config.get<string>('overwriteIcon.added', '🟢'),
            modified: config.get<string>('overwriteIcon.modified', '🟡'),
            deleted: config.get<string>('overwriteIcon.deleted', '🔴'),
            default: config.get<string>('overwriteIcon.default', '⚪'),
        },
    };
}

// Generate a tree structure as a string
function generateTreeStructure(changes: { label: string; state: string }[], workspaceRoot: string): string {
    const config = getConfig();
    const tree: { [key: string]: any } = {};

    // Build the tree
    changes.forEach(change => {
        const relativePath = path.relative(workspaceRoot, change.label);
        const parts = relativePath.split(path.sep);
        let currentLevel = tree;

        parts.forEach((part, index) => {
            if (!currentLevel[part]) {
                currentLevel[part] = {};
            }
            if (index === parts.length - 1) {
                currentLevel[part] = change.state; // Mark file state
            }
            currentLevel = currentLevel[part];
        });
    });

    // Convert the tree to a string
    const renderTree = (node: any, prefix: string = '', isRoot: boolean = true): string => {
        let result = '';
        const keys = Object.keys(node);

        keys.forEach((key, index) => {
            const isLast = index === keys.length - 1;
            const value = node[key];
            const isFile = typeof value === 'string';
            const emoji = isFile
                ? config.includeFileIcon
                    ? getEmojiForState(value, config.overwriteIcon)
                    : ''
                : config.includeFolderIcon
                ? config.overwriteIcon.folder
                : '';

            // Collapse single-child directories recursively
            if (typeof value === 'object') {
                let collapsedPath = key;
                let current = value;

                // Traverse single-child directories
                while (typeof current === 'object' && Object.keys(current).length === 1) {
                    const childKey = Object.keys(current)[0];
                    if (typeof current[childKey] === 'object') {
                        collapsedPath += `/${childKey}`;
                        current = current[childKey];
                    } else {
                        break; // Stop if the child is a file
                    }
                }

                if (typeof current === 'object') {
                    // Directory with multiple children
                    result += `${prefix}${isLast ? '└── ' : '├── '}${emoji} ${collapsedPath}\n`;
                    result += renderTree(current, `${prefix}${isLast ? '    ' : '│   '}`, false);
                } else {
                    // Single file at the end of the collapsed path
                    result += `${prefix}${isLast ? '└── ' : '├── '}${emoji} ${collapsedPath}\n`;
                    const fileKey = Object.keys(node[key])[0];
                    const fileState = node[key][fileKey];
                    const fileEmoji = config.includeFileIcon
                        ? getEmojiForState(fileState, config.overwriteIcon)
                        : '';
                    result += `${prefix}${isLast ? '    ' : '│   '}└── ${fileEmoji} ${fileKey}\n`;
                }
            } else {
                // Normal file
                result += `${prefix}${isLast ? '└── ' : '├── '}${emoji} ${key}\n`;
            }
        });

        return result;
    };

    return renderTree(tree);
}

// Generate a flat list structure as a string
function generateFlatListStructure(changes: { label: string; state: string }[], workspaceRoot: string): string {
    const config = getConfig();
    return changes
        .map(change => {
            const relativePath = path.relative(workspaceRoot, change.label);
            const emoji = config.includeFileIcon
                ? getEmojiForState(change.state, config.overwriteIcon)
                : '';
            return `${emoji} ${relativePath}`;
        })
        .join('\n');
}

// Get emoji for file state
function getEmojiForState(state: string, overwriteIcon: { added: string; modified: string; deleted: string; default: string }): string {
    switch (state) {
        case 'added': return overwriteIcon.added;
        case 'modified': return overwriteIcon.modified;
        case 'deleted': return overwriteIcon.deleted;
        default: return overwriteIcon.default;
    }
}

// Fetch changes from Git
async function getGitChanges(): Promise<{ label: string; state: string }[] | undefined> {
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

// Fetch changes from SVN
async function getSvnChanges(): Promise<{ label: string; state: string }[] | undefined> {
    return new Promise((resolve, reject) => {
        exec('svn status', (error, stdout, stderr) => {
            if (error) {
                resolve(undefined); // SVN command failed
                return;
            }

            const changes = stdout
                .split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const status = line[0];
                    const filePath = line.slice(8).trim();
                    let state = 'unknown';
                    if (status === 'A') state = 'added';
                    else if (status === 'M') state = 'modified';
                    else if (status === 'D') state = 'deleted';
                    return { label: filePath, state };
                });

            resolve(changes);
        });
    });
}

// Detect source control system and fetch changes
async function getChanges(): Promise<{ label: string; state: string }[] | undefined> {
    const gitChanges = await getGitChanges();
    if (gitChanges) {
        return gitChanges;
    }

    const svnChanges = await getSvnChanges();
    if (svnChanges) {
        return svnChanges;
    }

    // Neither Git nor SVN found
    return undefined;
}

// TextDocumentContentProvider for read-only content
class ChangeTreeContentProvider implements vscode.TextDocumentContentProvider {
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

// Activate the extension
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

    // Command to show the tree structure
    vscode.commands.registerCommand('changeTree.showTree', async () => {
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
    });

    // Command to show the flat list structure
    vscode.commands.registerCommand('changeTree.showFlatList', async () => {
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
    });
}

// Deactivate the extension
export function deactivate() {}