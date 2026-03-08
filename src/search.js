import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

function rankResults(results) {

  const seenDomains = new Set();

  const ranked = results
    .map(r => {

      let score = 0;

      if (r.url.includes("amazon")) score += 5;
      if (r.url.includes("flipkart")) score += 5;
      if (r.url.includes("croma")) score += 4;
      if (r.url.includes("reliancedigital")) score += 4;

      return { ...r, score };

    })
    .sort((a, b) => b.score - a.score);

  const uniqueResults = [];

  for (const r of ranked) {

    const domain = new URL(r.url).hostname;

    if (!seenDomains.has(domain)) {

      seenDomains.add(domain);
      uniqueResults.push(r);

    }

    if (uniqueResults.length === 5) break;
  }

  return uniqueResults;
}

export async function searchProducts(query) {

  console.log("Searching for:", query);

  const response = await axios.post(
    "https://api.langsearch.com/v1/web-search",
    {
      query: query,
      freshness: "noLimit",
      summary: true,
      count: 10
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LANGSEARCH_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  console.log("Search response:", response.data);

  const results = response.data?.data?.webPages?.value  || [];
  const ranked = rankResults(results);

  return ranked.slice(0, 5);
}