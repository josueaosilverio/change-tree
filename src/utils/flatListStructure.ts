import { getConfig } from './config';
import { getEmojiForState } from './emoji';
import * as path from 'path';

export function generateFlatListStructure(changes: { label: string; state: string }[], workspaceRoot: string): string {
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