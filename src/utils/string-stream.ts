import { Readable } from 'stream';

export default function createStringStream(str: string) {
  return new Readable({
    read(size) {
      let wantsMore = true;
      while (wantsMore) {
        const chunk = str.substr(0, size);
        if (!chunk) {
          return void this.push(null);
        }

        wantsMore = this.push(chunk);
        str = str.substr(chunk.length);
      }
    }
  });
}
