import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { searchProducts } from "./search.js";

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true
});

const SHOPPING_DOMAINS = [
  "amazon.in",
  "flipkart.com",
  "meesho.com",
  "croma.com",
  "reliancedigital.in",
  "tatacliq.com",
];

function buildShoppingQuery(query) {

  const siteFilter = SHOPPING_DOMAINS
    .map(domain => `site:${domain}`)
    .join(" OR ");

  return `${query} buy online price (${siteFilter})`;
}

/*function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const parts = hostname.split('.');
    const domainName = parts[0] === 'www' ? parts[1] : parts[0];
    return domainName;
  } catch (error) {
    return null;
  }
}*/

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(
    msg.chat.id,
    "Send me a product name and I will return top shopping links."
  );

});

bot.on("message", async (msg) => {

  const chatId = msg.chat.id;
  const query = msg.text;

  if (!query || query.startsWith("/")) return;

  try {
    // Show typing indicator
    await bot.sendChatAction(chatId, "typing");

    const searchQuery = buildShoppingQuery(query);

    const results = await searchProducts(searchQuery);

    if (!results.length) {
      bot.sendMessage(chatId, "No results found.");
      return;
    }

    const topResults = results.slice(0,5);

    let message = `🛒 Top shopping links for "${query}"\n\n`;

    topResults.forEach((r, i) => {
      message += `${i+1}. ${r.name}\n${r.url}\n\n`;
    });

    bot.sendMessage(chatId, message, {
      disable_web_page_preview: true,
      /*reply_markup: {
        inline_keyboard: topResults.map(r => [
          {
            text: `${extractDomain(r.url)} - ${r.name.substring(0,20)}...`,
            url: r.url
          }
        ])
      }*/
    });

  } catch (error) {

    console.error(error);
    bot.sendMessage(chatId, "Search failed.");

  }

});