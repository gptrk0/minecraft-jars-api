import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

export const downloadFile = async (url: string, destPath: string) => new Promise(async (resolve, reject) => {
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir))
        fs.mkdirSync(destDir, { recursive: true });

    const res = await fetch(url);
    const stream = fs.createWriteStream(destPath, { flags: 'w+' });

    stream.on('finish', () => {
        resolve(true);
    });

    stream.on('error', e => {
        reject(e);
    });

    Readable.fromWeb(res.body as any)
        .pipe(stream);
});
