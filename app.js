const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client();

let config = fs.readFileSync("./config.json");
config = JSON.parse(config.toString());

let gamejam = fs.readFileSync("./gamejam.json");
gamejam = JSON.parse(gamejam.toString());

client.once("ready", () => {
  Log("bot online");
});

client.on("message", (msg) => {
  if (msg.author.bot) return;

  if (config.troll) {
    config.users_to_troll.forEach((user) => {
      if (msg.author == user) {
        msg.reply(spongebobCase(msg.content));
      }
    });

    config.spongebobKeywords.forEach((keyword) => {
      if (msg.content.toLowerCase().includes(keyword)) {
        msg.reply(spongebobCase(msg.content));
      }
    });
  }

  if (
    msg.content.toLowerCase().includes("bot") &&
    msg.channel.id == config.writeChannelId
  ) {
    config.reply.forEach((reply) => {
      if (msg.content.toLowerCase().includes(reply.if)) {
        msg.reply(reply.reply);
        return;
      }
    });

    return;
  }

  if (!msg.content.startsWith(config.prefix)) return;

  const args = msg.content
    .toLowerCase()
    .slice(config.prefix.length)
    .split(/ +/);
  const command = args.shift();
  Log("Recived command: {0} other arguments: {1}", [command, args]);
  switch (command) {
    case "ping":
      msg.reply("Pong!");
      break;
    case "pizza":
      msg.reply("🍕🍕🍕🍕");
      break;
    case "gay":
      msg.reply("gay");
      break;
    case "gamejam":
      msg.reply(getGamejam());
      break;
    case "jam":
      msg.reply(getGamejam());
      break;
    case "notify":
      if (config.users_to_notify.includes(msg.author)) {
        config.users_to_notify = config.users_to_troll.filter(
          (user) => user != msg.author
        );

        msg.reply(" du er nu fjernet fra notifikationslisten");
      } else {
        config.users_to_notify.push(msg.author);
        msg.reply(" du er nu tilføjet til notifikationslisten");
      }
      break;
    case "troll":
      switch (args[0]) {
        case "on":
          config.troll = true;
          msg.channel.send("Spongebob case is now " + args[0]);
          break;
        case "off":
          config.troll = false;
          msg.channel.send("Spongebob case is now " + args[0]);
          break;
        case "add":
          user = args[1].slice(3, args[1].length - 1); //Remove @-tags

          if (config.users_to_troll.includes(user)) {
            msg.reply("Allerde tilføjet!");
          } else {
            config.users_to_troll.push(user);
            msg.reply("Tilføjet");
          }

          break;
        case "remove":
          user = args[1].slice(3, args[1].length - 1); //Remove @-tags

          if (config.users_to_troll.includes(user)) {
            config.users_to_troll = config.users_to_troll.filter(
              (_user) => _user != user
            );
            msg.reply("Fjernet!");
          } else {
            msg.reply("Ikke tilføjet endnu");
          }
          break;
        default:
          msg.reply("Forkert kommando. Brug on/off, add/remove @user.");
          break;
      }

      break;
    default:
      msg.reply("Det er ikke en valid command!");
      break;
  }
});

const now = new Date();
target = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  config.notify.hour,
  config.notify.minutes,
  0
);
secondsUntilNotify = target - now;

if (secondsUntilNotify < 0) {
  //The notify time has already passed, wait until tomorrow.
  target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    config.notify.hour,
    config.notify.minutes,
    0
  );
  secondsUntilNotify = target - now;
}

Log("Bot will start notifying about gamejams in {0} miliseconds. ({1})", [
  secondsUntilNotify,
  target,
]);
setTimeout(function () {
  notify();
  startNotifyInterval();
}, secondsUntilNotify);

function notify() {
  const starts = Date.parse(gamejam.starts);
  const ends = Date.parse(gamejam.ends);

  if (now > starts && now < ends) {
    const channel = client.channels.cache.get(config.writeChannelId);
    let userTags = "";

    config.users_to_notify.forEach((user) => {
      userTags += "<@!" + user + ">, ";
    });


    channel.send(
      getGamejam() + "\n" + userTags
    );
    
    
    Log("Notified about gamejam");
  }
}

function startNotifyInterval() {
  setInterval(function () {
    notify();
  }, 24 * 60 * 60 * 1000);
}

function Log(message, params) {
  const time = new Date().toTimeString().split(" ")[0];

  if (params != undefined) {
    params.forEach((replace, i) => {
      message = message.replace("{" + i + "}", replace);
    });
  }

  console.log("[" + time + "] " + message);
}

//Returns string
function getGamejam() {
  const starts = Date.parse(gamejam.starts);
  const ends = Date.parse(gamejam.ends);

  if (Date.now() > ends) {
    return gamejam.name + " sluttede d. " + formatDate(ends);
  }

  if (Date.now() < starts) {
    return (
      gamejam.name +
      " er ikke startet endnu! det starter d. " +
      formatDate(starts) +
      "(" +
      diffInDays(starts) +
      " dage) 🎮"
    );
  }

  const _diffInDays = diffInDays(ends);
  return _diffInDays > 0
    ? gamejam.name + " er i gang! det slutter om " + _diffInDays + " dage! 🎮🕹"
    : gamejam.name + " slutter i dag! Er du klar til at aflevere!? 🖥💻";
}

//Takes a string <input>
//Returns <input> as spongebobCase
function spongebobCase(input) {
  cased = "";

  for (i = 0; i < input.length; i++) {
    cased += i % 2 == 0 ? input[i].toLowerCase() : input[i].toUpperCase();
  }

  return cased;
}

function diffInDays(date) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  date = new Date(date);

  return Math.round(Math.abs((Date.now() - date) / oneDay));
}

function formatDate(date) {
  var d = new Date(date);

  var month = "" + (d.getMonth() + 1);
  var day = "" + d.getDate();
  var year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [day, month, year].join("-");
}

client.login(config.discordToken);

//BOT INVITE LINK: https://discord.com/oauth2/authorize?client_id=834771278194802708&scope=bot&permissions=2147634240
