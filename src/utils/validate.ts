import { validate } from 'class-validator';

import JarDto from 'src/routes/jar/dto/jar.dto';

export const validateJarVersion = async (version: string): Promise<boolean> => {
    let jar = new JarDto();
    jar.version = version;

    let validationErrors = await validate(jar, {
        groups: ['version'],
    });

    return validationErrors.length == 0;
};
