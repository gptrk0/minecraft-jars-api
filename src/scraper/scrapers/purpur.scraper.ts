import JarDto, { JarType } from 'src/routes/jar/dto/jar.dto';
import DownloadHandler from '../handlers/download.handler';
import Scraper, { ScraperResult } from './scraper';
import { validateJarVersion } from '../../utils/validate';
import { createHash } from 'crypto';

export default class PurpurScraper extends Scraper {
    public PROJECT_NAME: JarType = JarType.purpur;
    protected BASE_URL: string = 'https://api.purpurmc.org/v2';

    public async scrape(): Promise<ScraperResult[]> {
        let res = await fetch(`${this.BASE_URL}/${this.PROJECT_NAME}`);
        let project = await res.json();

        let list: ScraperResult[] = [];

        for (let version of project.versions) {
            if (!await validateJarVersion(version))
                continue;

            let latest_build = await this.fetchLatestBuild(version);

            let jar = new JarDto();
            jar.identifier = latest_build.identifier;
            jar.type = this.PROJECT_NAME;
            jar.version = version;
            jar.fileName = `${this.PROJECT_NAME}-${version}.jar`;

            list.push({
                dto: jar,
                downloadUrl: latest_build.downloadUrl,
                handler: DownloadHandler,
            });
        }

        return list;
    }

    protected async fetchLatestBuild(version: string) {
        let res = await fetch(`${this.BASE_URL}/${this.PROJECT_NAME}/${version}`);
        let data = await res.json();

        let latest_build_number = data.builds.latest;

        return {
            identifier: this.getIdentifier(version, latest_build_number),
            downloadUrl: this.formatDownloadUrl(version, latest_build_number),
            handler: DownloadHandler,
        };
    }

    protected formatDownloadUrl(version: string, build_number: number): string {
        return `${this.BASE_URL}/${this.PROJECT_NAME}/${version}/${build_number}/download`;
    }

    public getIdentifier(version: string, build_number: number): string {
        return createHash('sha1')
            .update(`${this.PROJECT_NAME}_${version}_${build_number}`)
            .digest('hex');
    }
}
