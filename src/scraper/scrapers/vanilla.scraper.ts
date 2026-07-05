import { validateJarVersion } from 'src/utils/validate';
import JarDto, { JarType } from 'src/routes/jar/dto/jar.dto';
import Scraper, { ScraperResult } from './scraper';
import DownloadHandler from '../handlers/download.handler';

export default class VanillaScraper extends Scraper {
    public PROJECT_NAME: JarType = JarType.vanilla;

    public async scrape(): Promise<ScraperResult[]> {
        let res = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
        let data = await res.json();

        let list: ScraperResult[] = [];

        for (let version of data.versions) {
            if (!await validateJarVersion(version.id))
                continue;

            let res = await fetch(version.url);
            let data = await res.json();

            if (!data?.downloads?.server?.url)
                continue;

            let jar = new JarDto();
            jar.identifier = version.sha1;
            jar.type = this.PROJECT_NAME;
            jar.version = version.id;
            jar.fileName = `${this.PROJECT_NAME}-${version.id}.jar`;

            list.push({
                dto: jar,
                downloadUrl: data.downloads.server.url,
                handler: DownloadHandler,
            });
        }

        return list;
    }
}
