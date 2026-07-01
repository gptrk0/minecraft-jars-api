import { createHash } from "crypto";

import { validateJarVersion } from "src/utils/validate";
import JarDto, { JarType } from "src/routes/jars/dto/jar.dto";
import Scraper, { ScraperResult } from "./scraper";
import DownloadHandler from "../handlers/download.handler";

type ProjectVersions = Record<string, string[]>;

type Project = {
    project: {
        id: string;
        name: string;
    };
    versions: ProjectVersions;
};

export default class PaperScraper extends Scraper {
    public PROJECT_NAME: JarType = JarType.paper;
    protected BASE_URL: string   = "https://fill.papermc.io/v3/projects";

    public async scrape(): Promise<ScraperResult[]>
    {
        let res              = await fetch(`${this.BASE_URL}/${this.PROJECT_NAME}`);
        let project: Project = await res.json();

        let list: ScraperResult[] = [];

        for (const [_, versions] of Object.entries(project.versions)) {
            for (const version of versions) {
                if (! await validateJarVersion(version))
                    continue;
                
                let latest_build = await this.fetchLatestBuild(version);
                
                let jar = new JarDto();
                jar.identifier = latest_build.identifier;
                jar.type       = this.PROJECT_NAME;
                jar.version    = version;
                jar.fileName   = `${this.PROJECT_NAME}-${version}.jar`;
                
                list.push({
                    dto:         jar,
                    downloadUrl: latest_build.downloadUrl,
                    handler:     DownloadHandler
                });
            }
        }

        return list;
    }

    protected async fetchLatestBuild(version: string)
    {    
        let res  = await fetch(`${this.BASE_URL}/${this.PROJECT_NAME}/versions/${version}/builds/latest`);
        let data = await res.json();

        return {
            identifier:  this.getIdentifier(version, data.id),
            downloadUrl: data.downloads['server:default'].url,
        };
    }

    public getIdentifier(version: string, build_number: number): string
    {
        return createHash("sha1")
            .update(`${this.PROJECT_NAME}_${version}_${build_number}`)
            .digest("hex");
    }
}
