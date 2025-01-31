import * as path from 'path';
import { getConfig } from './config';
import { getEmojiForState } from './emoji';

export function generateTreeStructure(changes: { label: string; state: string }[], workspaceRoot: string): string {
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