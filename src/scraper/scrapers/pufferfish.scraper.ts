import { createHash } from 'crypto';
import JarDto, { JarType } from 'src/routes/jar/dto/jar.dto';
import Scraper, { ScraperResult } from './scraper';
import { validateJarVersion } from 'src/utils/validate';
import DownloadHandler from '../handlers/download.handler';

export default class PufferfishScraper extends Scraper {
    public PROJECT_NAME: JarType = JarType.pufferfish;

    public async scrape(): Promise<ScraperResult[]> {
        let res = await fetch('https://ci.pufferfish.host/api/json?tree=jobs[name]');
        let jobs = await res.json();

        let list: ScraperResult[] = [];

        for (let job of jobs.jobs) {
            let matches = /^Pufferfish-(?<version>.+)$/.exec(job.name);
            let version = matches?.groups?.version;

            if (!version || !await validateJarVersion(version))
                continue;

            let res = await fetch(`https://ci.pufferfish.host/job/${job.name}/lastBuild/api/json?tree=result,timestamp,artifacts[*]`);
            let data = await res.json();

            if (data.result !== 'SUCCESS')
                continue;

            let artifactPath = data.artifacts[0]?.relativePath;

            if (!artifactPath)
                continue;

            let jar = new JarDto();
            jar.identifier = this.getIdentifier(version, data.timestamp);
            jar.type = this.PROJECT_NAME;
            jar.version = version;
            jar.fileName = `${this.PROJECT_NAME}-${version}.jar`;

            list.push({
                dto: jar,
                downloadUrl: `https://ci.pufferfish.host/job/${job.name}/lastSuccessfulBuild/artifact/${artifactPath}`,
                handler: DownloadHandler,
            });
        }

        return list;
    }

    public getIdentifier(version: string, build_timestamp: number): string {
        return createHash('sha1')
            .update(`${this.PROJECT_NAME}_${version}_${build_timestamp}`)
            .digest('hex');
    }
}
