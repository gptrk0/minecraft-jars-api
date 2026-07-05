import { JarType } from 'src/routes/jar/dto/jar.dto';
import PaperScraper from './paper.scraper';

export default class FoliaScraper extends PaperScraper {
    public PROJECT_NAME = JarType.folia;
}
