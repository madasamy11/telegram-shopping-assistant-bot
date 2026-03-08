import axios from "axios";
import * as cheerio from "cheerio";

export async function extractPrice(url) {

  try {

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(data);

    let price = null;

    if (url.includes("amazon")) {
      price = $("#priceblock_ourprice").text() ||
              $(".a-price-whole").first().text();
    }

    if (url.includes("flipkart")) {
      price = $("._30jeq3").first().text();
    }

    if (url.includes("croma")) {
      price = $(".amount").first().text();
    }

    if (url.includes("reliancedigital")) {
      price = $(".price").first().text();
    }

    return price?.replace(/[^\d]/g,"") || null;

  } catch (err) {

    return null;

  }

}