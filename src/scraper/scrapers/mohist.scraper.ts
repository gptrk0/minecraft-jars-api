import JarDto, { JarType } from 'src/routes/jar/dto/jar.dto';
import DownloadHandler from '../handlers/download.handler';
import Scraper, { ScraperResult } from './scraper';
import { validateJarVersion } from '../../utils/validate';
import { createHash } from 'crypto';

export default class MohistScraper extends Scraper {
    public PROJECT_NAME: JarType = JarType.mohist;
    protected BASE_URL: string = 'https://mohistmc.com/api/v2/projects';

    public async scrape(): Promise<ScraperResult[]> {
        let res = await fetch(`${this.BASE_URL}/${this.PROJECT_NAME}`);
        let project = await res.json();

        let list: ScraperResult[] = [];

        for (let version of project.versions) {
            if (!await validateJarVersion(version))
                continue;

            let latest_build;

            try {
                latest_build = await this.fetchLatestBuild(version);
            } catch (exception) {
                continue;
            }

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
        let res = await fetch(`${this.BASE_URL}/${this.PROJECT_NAME}/${version}/builds/latest`);
        let data = await res.json();

        let latest_build = data.build;

        if (!latest_build) {
            throw new Error('No build for the version.');
        }

        return {
            identifier: this.getIdentifier(version, latest_build.id),
            downloadUrl: latest_build.url,
            handler: DownloadHandler,
        };
    }

    public getIdentifier(version: string, build_id: number): string {
        return createHash('sha1')
            .update(`${this.PROJECT_NAME}_${version}_${build_id}`)
            .digest('hex');
    }
}
