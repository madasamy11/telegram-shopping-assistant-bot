import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { searchProducts } from "./search.js";

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true
});

const userDailyUsage = new Map();
const userLastRequest = new Map();

const MAX_QUERY_LENGTH = 30;
const DAILY_REQUEST_LIMIT = 50;
const RATE_LIMIT_MS = 5000;

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

function checkQueryValidationAndRateLimiting(msg) {
  const userId = msg.from.id;
  const query = msg.text?.trim();

  // 1. Query Length Validation
  if (query.length > MAX_QUERY_LENGTH) {
    return `❌ Query too long.\n\nPlease keep your search under ${MAX_QUERY_LENGTH} characters.\nExample: "iphone 15"`;
  }

  // 2. Block URLs in Queries
  const urlPattern = /(https?:\/\/|www\.|\.com|\.in|\.net)/i;
  if (urlPattern.test(query)) {
    return `❌ URLs are not allowed in search queries.\n\nPlease send only a product name.\nExample: "sony headphones"`;
  }

  // 3. Short-Term Rate Limiting
  const now = Date.now();
  if (userLastRequest.has(userId)) {
    const lastRequestTime = userLastRequest.get(userId);
    if (now - lastRequestTime < RATE_LIMIT_MS) {
      return `⏳ You're sending requests too quickly.\n\nPlease wait a few seconds before trying again.`;
    }
  }

  // 4. Daily Request Limit
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format based on UTC

  if (!userDailyUsage.has(userId)) {
    userDailyUsage.set(userId, { count: 1, date: today });
  } else {
    const usage = userDailyUsage.get(userId);
    if (usage.date !== today) {
      // Reset for a new day
      usage.count = 1;
      usage.date = today;
    } else {
      if (usage.count >= DAILY_REQUEST_LIMIT) {
        return `⚠️ Daily request limit reached.\n\nYou can send up to ${DAILY_REQUEST_LIMIT} searches per day.\nPlease try again tomorrow.`;
      }
      usage.count += 1;
    }
    userDailyUsage.set(userId, usage);
  }

  return null; // All checks passed
}

bot.on("message", async (msg) => {

  const chatId = msg.chat.id;
  const query = msg.text?.trim();

  if (!query) {
    bot.sendMessage(chatId, "Please send a product name to search.");
    return;
  }
  if (query.startsWith("/")) return;

  const validationError = checkQueryValidationAndRateLimiting(msg);
  if (validationError) {
    bot.sendMessage(chatId, validationError);
    return;
  }

  userLastRequest.set(msg.from.id, Date.now());

  try {
    // Show typing indicator
    await bot.sendChatAction(chatId, "typing");

    const searchQuery = buildShoppingQuery(query);

    const results = await searchProducts(searchQuery);

    if (!results.length) {
      bot.sendMessage(chatId, "No results found.");
      return;
    }

    const topResults = results.slice(0, Math.min(5, results.length));

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