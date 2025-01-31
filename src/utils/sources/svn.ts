import { exec } from 'child_process';

export async function getSvnChanges(): Promise<{ label: string; state: string }[] | undefined> {
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
                    if (status === 'A') { state = 'added'; }
                    else if (status === 'M') { state = 'modified'; }
                    else if (status === 'D') { state = 'deleted'; }
                    return { label: filePath, state };
                });

            resolve(changes);
        });
    });
}