# Change Tree

A VS Code extension that visualizes source control changes as a tree or flat list.

## Features

- **Tree View**: Displays changes in a collapsible tree structure.
- **Flat List View**: Displays changes in a flat list.
- **Emojis**: Uses emojis to differentiate file states (🟢 Added, 🔴 Deleted, 🟡 Modified).
- **Git and SVN Support**: Works with both Git and SVN repositories.

## Commands

- `Change Tree: Show Tree View` - Displays the changes in a tree structure.
- `Change Tree: Show Flat View` - Displays the changes in a flat list.

## Installation

1. Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/).
2. Open a Git or SVN repository in VS Code.
3. Use the `Change Tree: Show Tree View` or `Change Tree: Show Flat View` commands to visualize changes.

## Configuration

You can configure the extension settings in your `settings.json`:

- `changeTree.includeFolderIcon`: Controls whether the folder icon (📁) is rendered. Default is `false`.
- `changeTree.includeFileIcon`: Controls whether the file status icon (🟢, 🟡, 🔴) is rendered. Default is `true`.
- `changeTree.overwriteIcon.folder`: Overwrite the emoji used for folders. Default is `📁`.
- `changeTree.overwriteIcon.added`: Overwrite the emoji used for added files. Default is `🟢`.
- `changeTree.overwriteIcon.modified`: Overwrite the emoji used for modified files. Default is `🟡`.
- `changeTree.overwriteIcon.deleted`: Overwrite the emoji used for deleted files. Default is `🔴`.
- `changeTree.overwriteIcon.default`: Overwrite the emoji used for other statuses. Default is `⚪`.

## Example

Here is an example of the output in Tree View:

```
├── 🟡 app.js
└──  folder1
    ├── 🟡 file1.js
    └──  folder2/folder3
        ├── 🟢 file2.js
        └──  folder4
            └── 🟢 file3.js
```

And in Flat List View:

```
🟡 file1.js
🟡 folder1\file2.js
🟢 folder1\folder2\folder3\file3.js
🟢 folder1\folder2\folder3\folder4\file4.js
```

## License

MIT