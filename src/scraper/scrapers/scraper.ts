import JarDto, { JarType } from 'src/routes/jar/dto/jar.dto';
import DownloadHandler from '../handlers/download.handler';
import SpigotHandler from '../handlers/spigot.handler';

export type ScraperResult = {
    dto: JarDto,
    handler: typeof DownloadHandler | typeof SpigotHandler,
    downloadUrl?: string,
    javaExecutablePath?: string
};

export default abstract class Scraper {
    public PROJECT_NAME: JarType;

    constructor() {
        // 
    }

    abstract scrape(): Promise<ScraperResult[]>;
}
