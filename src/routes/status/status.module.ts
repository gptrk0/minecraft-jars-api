import { Module } from '@nestjs/common';

import StatusController from './status.controller';

@Module({
    controllers: [
        StatusController,
    ],
})
export default class StatusModule {
}
