import { spawn } from 'child_process';

import { ScraperResult } from '../scrapers/scraper';
import { LogStream } from 'src/utils/logstream';
import { downloadSpigotBuildTools } from 'src/cron/jobs/updatespigot.job';

export default abstract class SpigotHandler {
    public static handle(data: ScraperResult): Promise<boolean> {
        return new Promise(resolve => {
            let logStream = new LogStream(8, `BUILDING ${data.dto.version} JAR`);
            let isFirstTry = true;

            const startBuildProcess = () => {
                const child = spawn(data.javaExecutablePath, [
                    '-jar', 'BuildTools.jar', '--rev', data.dto.version, '--o', `${process.env.JARS_DIR}/${data.dto.type}`, '--final-name', data.dto.fileName,
                ], {
                    cwd: '/home/node/spigot',
                });

                child.on('exit', async code => {
                    logStream.erase();

                    if (code !== 0) {
                        if (isFirstTry) {
                            console.log(`[${data.dto.type}] [${data.dto.version}] Failed to build ${data.dto.version} jar... try one more time`);

                            isFirstTry = false;

                            await downloadSpigotBuildTools();
                            startBuildProcess();
                            return;

                        } else {
                            console.log(`[${data.dto.type}] [${data.dto.version}] Failed to build ${data.dto.version} jar`);
                            return resolve(false);
                        }
                    }

                    console.log(`[${data.dto.type}] [${data.dto.version}] Downloaded and builded`);
                    resolve(true);
                });

                child.stdout.on('data', data => {
                    logStream.write(data.toString());
                });
            };

            startBuildProcess();
        });
    }
}
