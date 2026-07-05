import { createHash } from 'crypto';
import JarDto, { JarType } from 'src/routes/jar/dto/jar.dto';
import Scraper, { ScraperResult } from './scraper';
import DownloadHandler from '../handlers/download.handler';

export default class BungeeCordScraper extends Scraper {
    public PROJECT_NAME: JarType = JarType.bungeecord;

    public async scrape(): Promise<ScraperResult[]> {
        let res = await fetch('https://ci.md-5.net/job/BungeeCord/lastBuild/api/json?tree=result,timestamp,artifacts[*]');
        let data = await res.json();

        if (data.result !== 'SUCCESS')
            return [];

        let artifactPath = data.artifacts.find(v => v.displayPath === 'BungeeCord.jar')?.relativePath;

        if (!artifactPath)
            return [];

        let jar = new JarDto();
        jar.identifier = this.getIdentifier(data.timestamp);
        jar.type = this.PROJECT_NAME;
        jar.version = 'bungeecord';
        jar.fileName = `${this.PROJECT_NAME}.jar`;

        return [
            {
                dto: jar,
                downloadUrl: `https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/artifact/${artifactPath}`,
                handler: DownloadHandler,
            },
        ];
    }

    public getIdentifier(build_timestamp: number): string {
        return createHash('sha1')
            .update(`${this.PROJECT_NAME}_${build_timestamp}`)
            .digest('hex');
    }
}
