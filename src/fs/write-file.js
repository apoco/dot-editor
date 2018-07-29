import { promisify } from 'util';
import fs from 'fs';

export default promisify(fs.writeFile);
