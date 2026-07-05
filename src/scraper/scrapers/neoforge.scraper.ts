import Scraper, { ScraperResult } from './scraper';
import JarDto, { JarType } from 'src/routes/jar/dto/jar.dto';
import DownloadHandler from '../handlers/download.handler';
import { createHash } from 'crypto';
import { validateJarVersion } from 'src/utils/validate';

export default class NeoForgeScraper extends Scraper {
    public PROJECT_NAME: JarType = JarType.neoforge;
    protected BASE_URL: string = 'https://maven.neoforged.net';

    public async scrape(): Promise<ScraperResult[]> {
        let res = await fetch(`${this.BASE_URL}/api/maven/versions/releases/net/neoforged/neoforge`);
        let project = await res.json();

        let list: ScraperResult[] = [];

        for (let version of project.versions) {
            if (!await validateJarVersion(version))
                continue;

            let fileName = `neoforge-${version}-installer.jar`;

            let jar = new JarDto();
            jar.identifier = this.getIdentifier(version);
            jar.type = this.PROJECT_NAME;
            jar.version = version;
            jar.fileName = fileName;

            list.push({
                dto: jar,
                downloadUrl: this.formatDownloadUrl(version),
                handler: DownloadHandler,
            });
        }

        return list;
    }

    protected formatDownloadUrl(version: string): string {
        return `${this.BASE_URL}/releases/net/neoforged/neoforge/${version}/neoforge-${version}-installer.jar`;
    }

    public getIdentifier(version: string): string {
        return createHash('sha1')
            .update(`${this.PROJECT_NAME}_${version}`)
            .digest('hex');
    }
}
