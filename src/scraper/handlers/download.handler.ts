import * as path from 'path';

import { downloadFile } from 'src/utils/fetch';
import { ScraperResult } from '../scrapers/scraper';

export default abstract class DownloadHandler {
    public static handle(data: ScraperResult): Promise<boolean> {
        return new Promise(async resolve => {
            downloadFile(
                data.downloadUrl,
                path.resolve(process.env.JARS_DIR, data.dto.type, data.dto.fileName),
            )
                .then(() => {
                    console.log(`[${data.dto.type}] [${data.dto.version}] Downloaded`);
                    resolve(true);
                })
                .catch(err => {
                    console.log(`[${data.dto.type}] [${data.dto.version}] Failed to download`);
                    console.error(err);
                    resolve(false);
                });
        });
    }
}
