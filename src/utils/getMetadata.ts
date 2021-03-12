import get from 'open-graph-scraper';

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
    image: value?.result.ogImage ?? '',
    description: value?.result?.ogDescription ?? '',
  };
}

export default getMetadata;
