export function isUrl(text: string): boolean {
  const url1 = text.match(/(\w)+:\/\/[\w.:/?&-+=%]+/g);
  const url2 = text.match(/[\w:/?&-+=%]+(\.[\w:/?&-+=%]+)+/g);

  return !!url1 || !!url2;
}
