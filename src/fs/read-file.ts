import { promisify } from 'util';
import * as fs from 'fs';

export default promisify(fs.readFile);
