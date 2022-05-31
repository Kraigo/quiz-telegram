import { Client } from "./client";
import TelegramBot from "node-telegram-bot-api";
import "reflect-metadata"
import { AppDataSource } from "./data-source";

export async function app()  {
    await AppDataSource.initialize();
    const bot = new TelegramBot(
        process.env.TELEGRAM_BOT_TOKEN,
        {
            polling: true
        });

    const client = new Client(bot);
    client.init();
}

app();