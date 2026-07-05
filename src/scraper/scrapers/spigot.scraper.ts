import { createHash } from 'crypto';
import * as path from 'path';
import * as jQuery from 'jquery';
import { JSDOM } from 'jsdom';
import { getJavaExecutableByClassVersion } from 'src/utils/java';
import JarDto, { JarType } from 'src/routes/jar/dto/jar.dto';
import Scraper, { ScraperResult } from './scraper';
import { validateJarVersion } from 'src/utils/validate';
import SpigotHandler from '../handlers/spigot.handler';

const $ = jQuery(new JSDOM().window);

export default class SpigotScraper extends Scraper {
    public PROJECT_NAME: JarType = JarType.spigot;

    public async scrape(): Promise<ScraperResult[]> {
        let res = await fetch('https://hub.spigotmc.org/versions');
        let html = await res.text();

        let list: ScraperResult[] = [];

        let root = $(html);
        let links = root.find('a').toArray();

        for (let v of links) {
            let href = $(v).attr('href');
            let version = path.basename(href, '.json');

            if (!await validateJarVersion(version))
                continue;

            let latest_build = await this.fetchLatestBuild(version);

            if (!latest_build.javaExecutablePath)
                continue;

            let jar = new JarDto();
            jar.identifier = latest_build.identifier;
            jar.type = this.PROJECT_NAME;
            jar.version = version;
            jar.fileName = `${this.PROJECT_NAME}-${version}.jar`;

            list.push({
                dto: jar,
                handler: SpigotHandler,
                javaExecutablePath: latest_build.javaExecutablePath,
            });
        }

        return list;
    }

    protected async fetchLatestBuild(version: string) {
        let res = await fetch(`https://hub.spigotmc.org/versions/${version}.json`);
        let build = await res.json();

        let javaExecutablePath = getJavaExecutableByClassVersion(build?.javaVersions || [52, 52]);

        if (!javaExecutablePath) {
            console.log(`[${this.PROJECT_NAME}] [${version}] Missing java [${build.javaVersions.join(', ')}] to build`);
        }

        return {
            identifier: this.getIdentifier(version, build.refs.Spigot),
            javaExecutablePath,
        };
    }

    public getIdentifier(version: string, build_ref: string): string {
        return createHash('sha1')
            .update(`${this.PROJECT_NAME}_${version}_${build_ref}`)
            .digest('hex');
    }
}
