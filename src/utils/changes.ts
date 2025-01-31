import { getGitChanges } from "./sources/git";
import { getSvnChanges } from "./sources/svn";

// Detect source control system and fetch changes
export async function getChanges(): Promise<{ label: string; state: string }[] | undefined> {
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