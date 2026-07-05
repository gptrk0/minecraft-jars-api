import { JarType } from 'src/routes/jar/dto/jar.dto';
import PaperScraper from './paper.scraper';
import DownloadHandler from '../handlers/download.handler';

export default class PurpurScraper extends PaperScraper {
    public PROJECT_NAME: JarType = JarType.purpur;
    protected BASE_URL: string = 'https://api.purpurmc.org/v2';

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
}
