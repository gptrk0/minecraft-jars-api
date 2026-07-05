import { createHash } from 'crypto';
import * as jQuery from 'jquery';
import { JSDOM } from 'jsdom';
import JarDto, { JarType } from 'src/routes/jar/dto/jar.dto';
import Scraper, { ScraperResult } from './scraper';
import { validateJarVersion } from 'src/utils/validate';
import DownloadHandler from '../handlers/download.handler';

const $ = jQuery(new JSDOM().window);

export default class ForgeScraper extends Scraper {
    public PROJECT_NAME: JarType = JarType.forge;

    public async scrape(): Promise<ScraperResult[]> {
        let res = await fetch('https://files.minecraftforge.net/net/minecraftforge/forge');
        let html = await res.text();

        let list: ScraperResult[] = [];

        let root = $(html);
        let buttons = root.find('section.sidebar-nav li.li-version-list > ul > li').toArray();

        for (let v of buttons) {
            let btn = $(v);
            let version = null;
            let href = 'https://files.minecraftforge.net/net/minecraftforge/forge/';

            if (btn.hasClass('elem-active')) {
                version = btn.text();

            } else {
                let link = btn.find('a');
                version = link.text();
                href += link.attr('href');
            }

            if (!await validateJarVersion(version))
                continue;

            let latest_build = await this.fetchLatestBuild(version, href);

            if (!latest_build.downloadUrl)
                continue;

            let jar = new JarDto();
            jar.identifier = latest_build.identifier;
            jar.type = this.PROJECT_NAME;
            jar.version = version;
            jar.fileName = `${this.PROJECT_NAME}-${version}-installer.jar`;

            list.push({
                dto: jar,
                handler: DownloadHandler,
                downloadUrl: latest_build.downloadUrl,
            });
        }

        return list;
    }

    protected async fetchLatestBuild(version: string, href: string) {
        let res = await fetch(href);
        let html = await res.text();

        let root = $(html);
        let latest = root.find('.download-list > tbody > tr').first();

        let build_ver = latest.find('td.download-version').text().trim();
        let build_url = latest.find('td.download-files .classifier-installer').parent('a').attr('href');

        let downloadUrl = null;

        if (build_url) {
            let params = new URL(build_url).searchParams;
            downloadUrl = params.get('url');
        }

        return {
            identifier: this.getIdentifier(version, build_ver),
            downloadUrl: downloadUrl,
        };
    }

    public getIdentifier(version: string, build_ver: string): string {
        return createHash('sha1')
            .update(`${this.PROJECT_NAME}_${version}_${build_ver}`)
            .digest('hex');
    }
}
