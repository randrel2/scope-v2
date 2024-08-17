const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { token } = require("./config.json");
const client = new Client({
  partials: ["CHANNEL"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES],
});
const logger = require("./logger");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

let db;

// Initialize the database
async function initializeDatabase() {
  db = await open({
    filename: "bot_logs.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS command_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      command_name TEXT NOT NULL,
      timestamp DATETIME NOT NULL
    )
  `);
}

// Function to log commands
async function logCommand(commandName) {
  const timestamp = new Date().toISOString();
  await db.run(
    "INSERT INTO command_logs (command_name, timestamp) VALUES (?, ?)",
    [commandName, timestamp]
  );
}

client.on("ready", () => logger.info("The bot is online"));
client.on("debug", (m) => logger.debug(m));
client.on("warn", (m) => logger.warn(m));
client.on("error", (m) => logger.error(m));
client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
  console.log("Ready!");
  await initializeDatabase();
  const cron = require("node-cron");
  const task = cron.schedule("*/15 * * * * *", () => {
    const fs = require("fs");

    // Read users.json file
    fs.readFile("remindLog.json", function (err, data) {
      // Check for errors
      if (err) throw err;

      const existData = JSON.parse(data);

      // Grab current UNIX timestamp (timezone agnostic)
      const curTime = Date.now();

      // Converting to JSON
      const deleteLog = [];
      let deleteIter = 0;
      let listingChange = false;

      for (i = 0; i < existData.remindData.length; i++) {
        const remindTime = existData.remindData[i].remindTime;
        const channel = existData.remindData[i].channel;
        const userID = existData.remindData[i].user;
        const message = existData.remindData[i].message;
        const hours = existData.remindData[i].hours;
        const minutes = existData.remindData[i].minutes;

        if (remindTime <= curTime) {
          const notify = `<@!${userID}>: ${message}
        
Reminder set ${hours} hour(s) and ${minutes} minutes ago.`;

          // Send message to user channel they requested from
          client.channels.cache.get(channel.toString()).send(notify);
          deleteLog[deleteIter] = i;
          deleteIter++;

          listingChange = true;
        }
      }

      if (listingChange === true) {
        // Remove deleted rows from Array
        for (i = deleteLog.length - 1; i > -1; i--) {
          listingChange = true;

          const removeData = existData.remindData.splice(deleteLog[i], 1);
          console.log("PRUNED REMINDLOG ENTRY");
        }

        fs.writeFile(
          "remindLog.json",
          JSON.stringify(existData, null, 1),
          function (err) {
            if (err) throw err;
            console.log("Updated remind database.");
          }
        );
      }
    });
  });

  task.start();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() && !interaction.isButton()) return;
  if (interaction.isCommand()) {
    logger.info({
      command: interaction.commandName,
      user: interaction.user.username + "#" + interaction.user.discriminator,
      options: interaction.options,
    });
    // Log the command to SQLite
    await logCommand(interaction.commandName);

    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
  if (interaction.isButton()) {
    logger.info("button clicked");
    return;
  }
});

client.login(token);
