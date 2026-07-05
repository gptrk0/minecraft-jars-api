import { Injectable } from '@nestjs/common';
import { compareVersions } from 'compare-versions';
import * as path from 'path';

import { JarType } from './dto/jar.dto';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export default class JarService {
    constructor(
        private prisma: PrismaService,
    ) {
    }

    public async getTypes() {
        let list = await this.prisma.jar.groupBy({
            by: ['type'],
        });

        let order = Object.values(JarType);

        return list
            .map(v => v.type)
            .sort((a: JarType, b: JarType) => {
                return order.indexOf(a) - order.indexOf(b);
            });
    }

    public async getVersions(type: JarType) {
        let list = await this.prisma.jar.findMany({
            where: {
                type: type,
            },
            select: {
                version: true,
            },
        });

        return list
            .map(v => v.version)
            .sort((a: string, b: string) => {
                return compareVersions(b, a);
            });
    }

    public async getFilePath(type: JarType, version: string): Promise<string | null> {
        let jar = await this.prisma.jar.findFirst({
            where: {
                type: type,
                version: version,
            },
            select: {
                fileName: true,
            },
        });

        if (!jar)
            return null;

        return path.resolve(process.env.JARS_DIR, type, jar.fileName);
    }
}
