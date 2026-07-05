import { Controller, Get, Param, Req, Res, StreamableFile } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import JarService from './jar.service';
import { JarName, JarType } from './dto/jar.dto';

@Controller('/jar')
export default class JarController {
    constructor(
        private JarsService: JarService,
    ) {
        // 
    }

    @Get('/types')
    async getTypes(@Req() req: Request) {
        let baseUrl = `${req.protocol}://${req.hostname}`;
        let types = await this.JarsService.getTypes();

        return types.map(type => {
            return {
                type: type,
                name: JarName[type],
                logoUrl: `${baseUrl}/images/logos/${type}.png`,
            };
        });
    }

    @Get('/:type/versions')
    async getVersions(@Param('type') type: JarType) {
        if (!JarType[type])
            return false;

        return await this.JarsService.getVersions(type);
    }

    @Get('/:type/:version/download')
    async download(@Res({ passthrough: true }) res: Response, @Param('type') type: JarType, @Param('version') version: string) {
        const filePath = await this.JarsService.getFilePath(type, version);

        if (!filePath)
            return null;

        const fileName = path.basename(filePath);
        const file = fs.createReadStream(filePath);

        res.set({
            'Content-Type': 'application/java-archive',
            'Content-Disposition': `attachment; filename="${fileName}"`,
        });

        return new StreamableFile(file);
    }
}
