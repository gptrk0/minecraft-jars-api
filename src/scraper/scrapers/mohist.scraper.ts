import { JarType } from 'src/routes/jar/dto/jar.dto';
import PaperScraper from './paper.scraper';
import DownloadHandler from '../handlers/download.handler';

export default class MohistScraper extends PaperScraper {
    public PROJECT_NAME: JarType = JarType.mohist;
    protected BASE_URL: string = 'https://mohistmc.com/api/v2/projects';

    protected async fetchLatestBuild(version: string) {
        let res = await fetch(`${this.BASE_URL}/${this.PROJECT_NAME}/${version}/builds`);
        let data = await res.json();

        let latest_build = data.builds.pop();

        return {
            identifier: this.getIdentifier(version, latest_build.number),
            downloadUrl: latest_build.url,
            handler: DownloadHandler,
        };
    }
}
