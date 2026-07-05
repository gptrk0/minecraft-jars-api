import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

import Job from './job';

export const downloadSpigotBuildTools = () => new Promise(resolve => {
    exec('rm -rf /home/node/spigot && wget https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar -P /home/node/spigot')
        .on('exit', (code) => {
            if (code !== 0) {
                console.log('[JOB] Spigot BuildTools failed to update');
                resolve(code);
            }

            console.log('[JOB] Spigot BuildTools updated');
            resolve(code);
        });
});

@Injectable()
export default class UpdateSpigotJob extends Job {
    constructor() {
        super('2 0 * * *');
    }

    public async onTick() {
        await downloadSpigotBuildTools();
    }
}
