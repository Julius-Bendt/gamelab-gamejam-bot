const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client();

let config = fs.readFileSync("./config.json");
config = JSON.parse(config.toString());

let gamejam = fs.readFileSync("./gamejam.json");
gamejam = JSON.parse(gamejam.toString());

client.once("ready", () => {
  const time = new Date().toTimeString ().split(' ')[0];
  console.log("["+time+"] Bot online");
});

client.on("message", (msg) => {
  if (msg.author.bot) return;

  if (config.troll) {
    config.users_to_troll.forEach((user) => {
      if (msg.author == user) {
        msg.reply(spongebobCase(msg.content));
        return;
      }
    });
  }

  config.spongebobKeywords.forEach((keyword) => {
    if (msg.content.includes(keyword)) {
      msg.reply(spongebobCase(msg.content));
      return;
    }
  });

  if (!msg.content.startsWith(config.prefix)) return;

  const args = msg.content.slice(config.prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  console.log("Recived command: " + command);
  switch (command) {
    case "ping":
      msg.reply("Pong!");
      break;
    case "pizza":
      msg.reply("🍕🍕🍕🍕");
      break;
    case "gamejam":
      msg.reply(getGamejam());
      break;
    case "troll off":
      config.troll = false;
      break;
    case "troll on":
      config.troll = true;
      break;
    default:
      msg.reply("Det er ikke en valid command!");
      break;
  }
});

//run function every day
setInterval(function(){ 
  const starts = Date.parse(gamejam.starts);
  const ends = Date.parse(gamejam.ends);
  const now = Date.now();

  if(now > starts && now < ends )
  {
    const channel = client.channels.cache.get(config.writeChannelId);
    
    channel.send( gamejam.name + " er i gang! det slutter om " + diffInDays(ends) + " dage!");


    const time = new Date().toTimeString ().split(' ')[0];
    console.log("["+time+"] Notified about gamejam at"); 
  }
 
}, 24 * 60 * 60 * 1000)  // hours*minutes*seconds*milliseconds 24 * 60 * 60 * 1000

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
      " dage)"
    );
  }

  return (
    gamejam.name + " er i gang! det slutter om " + diffInDays(ends) + " dage!"
  );
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
