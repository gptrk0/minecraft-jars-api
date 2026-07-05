import { Controller, Get } from '@nestjs/common';

@Controller('/status')
export default class StatusController {
    constructor() {
        // 
    }

    @Get('/ping')
    public ping() {
        return {
            'success': true,
        };
    }
}
