# Telegram Product Bot

A Telegram bot that searches top e-commerce sites (like Amazon, Flipkart, Croma, etc.) for products and provides the top shopping links directly in the chat.

## Features

- Search for products across multiple major shopping domains.
- Ranks results based on preferred shopping sites.
- Returns the top 5 product links with titles and URLs.

## Prerequisites

- Node.js installed on your machine.
- A Telegram Bot Token (obtained from BotFather).
- A Langsearch API Key.

## Installation and Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository-url>
   cd telegram-shopping-assistant-bot
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Variables:**
   Create a \`.env\` file in the root directory and add the following variables:
   \`\`\`env
   TELEGRAM_TOKEN=your_telegram_bot_token_here
   LANGSEARCH_API_KEY=your_langsearch_api_key_here
   \`\`\`

## Usage

1. **Start the bot:**
   \`\`\`bash
   npm start
   \`\`\`

2. **Interact with the bot:**
   - Open Telegram and search for your bot.
   - Send \`/start\` to initiate a conversation.
   - Send a product name (e.g., "iPhone 15") and the bot will return the top shopping links.
