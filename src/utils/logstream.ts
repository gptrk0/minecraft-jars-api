import * as ansi from 'ansi';

const cursor = ansi(process.stdout);

export class LogStream {
    private lines: string[] = [];
    private header: string = '';
    private footer: string = '';
    private renderYOffset: number = 0;

    constructor(
        private maxVisibleLines: number = 5,
        private frameTitle: string = 'LOG',
    ) {
        this.header = this.paginateStr(`\u001b[36m┏━━ \u001b[37m${this.frameTitle} \u001b[36m`);
        this.footer = this.paginateStr('\u001b[36m┗');

        this.renderYOffset = process.stdout.rows - this.maxVisibleLines - 2;

        console.log(Array(this.maxVisibleLines + 2).fill('>').join('\n'));
    }

    public write(str: string) {
        this.lines.push(
            ...str.split('\n').map(v => '\u001b[36m┃ \u001b[37m' + this.ellipsisStr(v.trimEnd())),
        );
        this.lines = this.lines.slice(this.maxVisibleLines * -1);

        this.render();
    }

    private render() {
        cursor.goto(0, this.renderYOffset);

        cursor.eraseLine()
            .write(this.header)
            .nextLine();

        this.lines.forEach(line => {
            cursor.eraseLine()
                .write(line)
                .nextLine();
        });

        cursor.eraseLine()
            .write(this.footer)
            .nextLine();

        cursor.reset();
    }

    public erase() {
        cursor.goto(0, this.renderYOffset);

        for (let i = 0; i < this.maxVisibleLines + 2; i++) {
            cursor.eraseLine().nextLine();
        }

        cursor.goto(0, this.renderYOffset);
        cursor.reset();
    }

    private paginateStr(str: string, char: string = '━') {
        return str + char.repeat(process.stdout.columns - this.removeAnsi(str).length);
    }

    private ellipsisStr(str: string, maxLength: number = process.stdout.columns - 10) {
        if (str.length > maxLength)
            return str.slice(0, maxLength - 3) + '...';

        return str;
    }

    private removeAnsi(str: string) {
        return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    }
}
