import { Global, Module } from '@nestjs/common';

import ScraperService from './scraper.service';

@Global()
@Module({
    providers: [
        ScraperService,
    ],
    exports: [
        ScraperService,
    ],
})
export default class ScraperModule {
}
