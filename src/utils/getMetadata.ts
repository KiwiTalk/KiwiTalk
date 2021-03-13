import get, { OpenGraphImage } from 'open-graph-scraper';

export async function getMetadata(url: string) {
  const value = await get({ url });

  if (value.error) {
    return {
      title: '',
      url: '',
      image: '',
      description: '',
    };
  }

  return {
    title: value?.result?.ogTitle ?? '',
    url: value?.result?.ogUrl ?? '',
    image: (value?.result.ogImage as OpenGraphImage).url ?? '',
    description: value?.result?.ogDescription ?? '',
  };
}

export default getMetadata;
