import { Injectable } from '@nestjs/common';

import Scraper from './scrapers/scraper';
import FoliaScraper from './scrapers/folia.scraper';
import PrismaService from 'src/prisma/prisma.service';
import PaperScraper from './scrapers/paper.scraper';
import VelocityScraper from './scrapers/velocity.scraper';
import VanillaScraper from './scrapers/vanilla.scraper';
import MohistScraper from './scrapers/mohist.scraper';
import FabricScraper from './scrapers/fabric.scraper';
import BungeeCordScraper from './scrapers/bungeecord.scraper';
import PurpurScraper from './scrapers/purpur.scraper';
import SpigotScraper from './scrapers/spigot.scraper';
import ForgeScraper from './scrapers/forge.scraper';
import PufferfishScraper from './scrapers/pufferfish.scraper';
import NeoForgeScraper from './scrapers/neoforge.scraper';

@Injectable()
export default class ScraperService {
    private SCRAPERS: Scraper[] = [
        new PurpurScraper(),
        new PaperScraper(),
        new VelocityScraper(),
        new FoliaScraper(),
        new BungeeCordScraper(),
        new PufferfishScraper(),
        new VanillaScraper(),
        new ForgeScraper(),
        new FabricScraper(),
        new MohistScraper(),
        new SpigotScraper(),
        new NeoForgeScraper(),
    ];

    constructor(
        private prisma: PrismaService,
    ) {
    }

    public async scrapeAll() {
        console.log(`[SCRAPING] Started`);

        for (let scraper of this.SCRAPERS) {
            console.log(`\n[${scraper.PROJECT_NAME}] Scraping...\n`);

            try {
                let list = await scraper.scrape();

                for (let v of list) {
                    let jar = await this.prisma.jar.findFirst({
                        where: {
                            type: v.dto.type,
                            version: v.dto.version,
                        },
                    });

                    if (jar && jar.identifier === v.dto.identifier)
                        continue;

                    if (jar) {
                        console.log(`\n[${v.dto.type}] [${v.dto.version}] New build available`);

                    } else {
                        console.log(`\n[${v.dto.type}] [${v.dto.version}] New version found`);
                    }

                    if (!await v.handler.handle(v))
                        continue;

                    await this.prisma.jar.upsert({
                        create: v.dto,
                        update: {
                            identifier: v.dto.identifier,
                        },
                        where: {
                            identifier: jar?.identifier || '',
                        },
                    });
                }
            } catch (exception) {
                console.log(`\n[${scraper.PROJECT_NAME}] Error while scraping...\n`);
                console.error(exception);
            }
        }

        console.log(`[SCRAPING] Finished`);
    }
}
