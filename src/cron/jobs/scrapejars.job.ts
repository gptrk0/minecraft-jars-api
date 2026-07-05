import { Injectable } from '@nestjs/common';
import Job from './job';
import ScraperService from 'src/scraper/scraper.service';

@Injectable()
export default class ScrapeJarsJob extends Job {
    constructor(
        protected ScrapeService: ScraperService,
    ) {
        super('3 0 * * *');
    }

    public onTick() {
        this.ScrapeService.scrapeAll();
    }
}
