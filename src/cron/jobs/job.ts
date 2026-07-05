import { CronJob } from 'cron';

export default abstract class Job {
    constructor(
        public time: string = '* * * * *',
        public runOnInit: boolean = false,
    ) {
        new CronJob(
            this.time,
            this.onTick,
            this.onComplete,
            true,
            null,
            this,
            this.runOnInit,
        );
    }

    public onTick() {
        // 
    }

    public onComplete() {
        // 
    }
}
