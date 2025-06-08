const WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php?origin=*";

export const wikipediaService = {
  /**
   * Gets a brief summary of the topic.
   * @param query The topic to search.
   * @returns A promise that resolves to the extract (summary) text.
   */
  async getInfo(query: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${WIKIPEDIA_API_BASE}&action=query&prop=extracts&exintro&explaintext&format=json&titles=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const pages = data.query?.pages;
      const page = pages[Object.keys(pages)[0]];
      return page?.extract ?? null;
    } catch (error) {
      console.error("Error fetching Wikipedia info:", error);
      return null;
    }
  },

  /**
   * Gets a representative image for the topic.
   * @param query The topic to search.
   * @returns A promise that resolves to the image URL.
   */
  async getImage(query: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${WIKIPEDIA_API_BASE}&action=query&format=json&prop=pageimages&titles=${encodeURIComponent(query)}&pithumbsize=600`
      );
      const data = await response.json();
      const pages = data.query?.pages;
      const page = pages[Object.keys(pages)[0]];
      return page?.thumbnail?.source ?? null;
    } catch (error) {
      console.error("Error fetching Wikipedia image:", error);
      return null;
    }
  }
};
