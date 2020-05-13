export default class Utils {
  static toPureJS(object: any) {
    let cache: any[] = [];
    return JSON.parse(JSON.stringify(object, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.includes(value)) return;
        cache.push(value);
      }
      return value;
    }))
  }
}