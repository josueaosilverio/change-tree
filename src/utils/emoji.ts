export function getEmojiForState(state: string, overwriteIcon: { added: string; modified: string; deleted: string; default: string }): string {
    switch (state) {
        case 'added': return overwriteIcon.added;
        case 'modified': return overwriteIcon.modified;
        case 'deleted': return overwriteIcon.deleted;
        default: return overwriteIcon.default;
    }
}