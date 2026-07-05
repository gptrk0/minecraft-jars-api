import { Module } from '@nestjs/common';

import JarService from './jar.service';
import JarController from './jar.controller';

@Module({
    providers: [
        JarService,
    ],
    controllers: [
        JarController,
    ],
})
export default class JarModule {
}
