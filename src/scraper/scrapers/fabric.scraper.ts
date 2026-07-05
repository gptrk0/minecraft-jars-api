import { createHash } from 'crypto';
import { validateJarVersion } from 'src/utils/validate';
import JarDto, { JarType } from 'src/routes/jar/dto/jar.dto';
import Scraper, { ScraperResult } from './scraper';
import DownloadHandler from '../handlers/download.handler';

export default class FabricScraper extends Scraper {
    public PROJECT_NAME: JarType = JarType.fabric;

    public async scrape(): Promise<ScraperResult[]> {
        let res = await fetch('https://meta.fabricmc.net/v2/versions');
        let data = await res.json();

        let list: ScraperResult[] = [];

        let latest_loader = data.loader.find(v => v.stable);
        let latest_installer = data.installer.find(v => v.stable);

        for (let v of data.game) {
            if (!v.stable || !await validateJarVersion(v.version))
                continue;

            let jar = new JarDto();
            jar.identifier = this.getIdentifier(v.version, latest_loader.version, latest_installer.version);
            jar.type = this.PROJECT_NAME;
            jar.version = v.version;
            jar.fileName = `${this.PROJECT_NAME}-${v.version}.jar`;

            list.push({
                dto: jar,
                downloadUrl: `https://meta.fabricmc.net/v2/versions/loader/${v.version}/${latest_loader.version}/${latest_installer.version}/server/jar`,
                handler: DownloadHandler,
            });
        }

        return list;
    }

    public getIdentifier(game_version: string, loader_version: string, installer_version: string): string {
        return createHash('sha1')
            .update(`${this.PROJECT_NAME}_${game_version}_${loader_version}_${installer_version}`)
            .digest('hex');
    }
}
