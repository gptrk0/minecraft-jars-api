import { Module } from '@nestjs/common';

import ScraperService from 'src/scraper/scraper.service';
import ScrapeJarsJob from './jobs/scrapejars.job';
import UpdateSpigotJob from './jobs/updatespigot.job';

@Module({
    providers: [
        ScraperService,
        ScrapeJarsJob,
        UpdateSpigotJob,
    ],
})
export default class CronsModule {
}
