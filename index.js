const Discord = require('discord.js'); 
const bot = new Discord.Client();
const fs = require("fs");
const md5 = require('./my_modules/md5');

const GoogleSpreadsheet = require('./google_module/google-spreadsheet');
const doc = new GoogleSpreadsheet(process.env.skey);
const creds_json = {
    client_email: process.env.google_client_email,
    private_key: `-----BEGIN PRIVATE KEY-----\n${process.env.google_private_key}\n${process.env.google_key_two}\n${process.env.google_key_three}\nKPAu6SL9OraGwtioCgWyBwlTHuN3yn2o9mpnAzNmzqTh6WbRPD5PrB2jq8Pk1MiV\nbz/I+0DRPhcA/37t23q6UUo16gSofFFLaD0npMaoOY2aK+os0NdnmGai8Y8XzVoN\nbbgXKgDvpIy7TLpS4z79mpAsrSl109+evVhOSp4SP4NIWUb0Mu+OkYcNWmIhfFUF\nkLMDgWqJAgMBAAECggEAKmTuCmLFEIUDFeRBd5i+Xex/B9BJDoexCzX9LwacqN8D\n79FCoZmL/0aqt6VNBbA4d1q017j6WgUxw/HI2H40CQY9xqy+F/e9xP7NuWHmhmqZ\nTnjVrc4azpGfiQxWkD/waStbC5XuVdBMo9xWKaBW8ySKEIYOgUSZteDK4uIB+rmn\nbT6993l0elYZClt7hQuZtEqi/o/YOdYj6FMx0ONlkqqh4TmHG4s0rBNjzFuXfOwF\nVdrx2saEpORATA/UPOMf31ox2gqs2jays/HYnjxt6Q5sD750fMdY/4/vEkfpWeV2\nUDJg6tvIVWIUKN5ofQZfmGRqHkRxoC2U+beljvq2SQKBgQDpsP8xsaJaUt2guBhr\nHnSGS57PgrJ/NLPSmkgcG3hhhZ38VL7hPaT48CUZ1kGOOncjkUngl14tfmvPzkxp\n5XaO/VMNdrhk8Cg5/orQ1HjuxR5DzYWHDuTwFtlFtBZILA6cpN758zjYsAEHgMCD\nOoegeZPPf9BZ9Mkf5H4n5xG6rQKBgQDBwaU2RtiGbGIxMUN+1LuZFgexw86Q0v+I\nLE196ZQCUxgdJv58YFQZQbvfaivd+ugoZE17DS99lyQvbfwIN0L/ngEcHuRZYIEN\nqi3FNO+ylcC3LLmD5h4jw9Lfgsy2992GOP/uIaCxGXzqkSGg2dmET7/akFdbwmys\nCOLFzWZmzQKBgFxcdh//4vjr82hIGm6L1OYXESdWspGQFNpR29owCT4R/0TxgZeo\nM4Gn+CHkCnjaJqhKDfbUHIbChn3VPWJFLLyK5r5Vg79xI5T4Q4kR0NId2j5WBkZA\n3r79aNYhvQS9VPEYQIBtXrRVq7J5cpzrDxufsYm7LG/BTZRrTGkc7GbpAoGAL+f9\nPWpO5w2tSZRwp89ZgwRbaqyLSmuhGr45esRiACEjeTHHAmGe6Y/DL/5EUmJTPIlw\nTth3wYm5PLDo++8N9b3PcHCC7UZbIlHNd1EbYwB74c6BIAeptBYa8YCZtTOb5i/5\nt5tA7AjtReIUenzit0Awo43Ey79Kt06LI3UhuJECgYATKkzkljEePsdYjWT6HyWj\n4GcG9OArgGHjvDuGjgav30qtfYSntDeRQBsnyTIHZ7V7vFDPK7qO2tyWsMW6YFi2\noTSqjNqNln1CdeS2zWLLtKoQY+5Y090ThJHLo16Neb+NNX15+TeCFdTs7QAEubJd\n+vOOQNHRvfnm63KuSIKlmw==\n-----END PRIVATE KEY-----\n`,
}
doc.useServiceAccountAuth(creds_json, function (err) {
    if (err) console.log(err);
});

async function get_profile(gameserver, author_id){
    return new Promise(async function(resolve, reject) {
        await doc.getRows(gameserver, { offset: 1, limit: 5000000, orderby: 'col2' }, (err, rows) => {
            if (err){
                console.error(`[DB] При получении данных с листа произошла ошибка!`);
                return reject(new Error(`При использовании 'getrows' произошла ошибка при получении данных.`));
            }
            let db_account = rows.find(row => row.idпользователя == author_id); // Поиск аккаунта в базе данных.
            if (!db_account) return resolve(false); // Если аккаунт не существует, вывести false;
            let account_info = [
                db_account.idпользователя, // Вывод ID пользователя.
                db_account.статусразработчика, // Вывод статуса разработчика.
                db_account.уровеньмодератора, // Вывод уровня модератора
            ];
            resolve(account_info);
        });
    });
}

async function add_profile(gameserver, author_id){
    return new Promise(async function(resolve, reject) {
        doc.addRow(gameserver, {
            idпользователя: `${author_id}`,
            статусразработчика: '0',
            уровеньмодератора: '0'
        }, async function(err){
            if (err){
                console.error(`[DB] Ошибка добавления профиля на лист!`);
                return reject(new Error(`При использовании 'addRow' произошла ошибка.`));
            }
            resolve(true);
        });
    });
}

async function change_profile(gameserver, author_id, table, value){
    return new Promise(async function(resolve, reject) {
        await doc.getRows(gameserver, { offset: 1, limit: 5000000, orderby: 'col2' }, (err, rows) => {
            if (err){
                console.error(`[DB] При получении данных с листа произошла ошибка!`);
                return reject(new Error(`При использовании 'getrows' произошла ошибка при получении данных.`));
            }
            let db_account = rows.find(row => row.idпользователя == author_id); // Поиск аккаунта в базе данных.
            if (!db_account) return resolve(false);
            if (table == 'idпользователя') db_account.idпользователя = `${value}`;
            else if (table == 'статусразработчика') db_account.статусразработчика = `${value}`;
            else if (table == 'уровеньмодератора') db_account.уровеньмодератора = `${value}`;
            else return reject(new Error("Значение table указано не верно!"));
            db_account.save();
            resolve(true);
        });
    });
}

async function delete_profile(gameserver, author_id){
    return new Promise(async function(resolve, reject) {
        await doc.getRows(gameserver, { offset: 1, limit: 5000000, orderby: 'col2' }, (err, rows) => {
            if (err){
                console.error(`[DB] При получении данных с листа произошла ошибка!`);
                return reject(new Error(`При использовании 'getrows' произошла ошибка при получении данных.`));
            }
            let db_account = rows.find(row => row.idпользователя == author_id); // Поиск аккаунта в базе данных.
            if (!db_account) return resolve(false);
            db_account.del();
            resolve(true);
        });
    });
}

const version = '8.0.1';
// Первая цифра означает глобальное обновление. (global_systems)
// Вторая цифра обозначет обновление одной из подсистем. (команда к примеру)
// Третяя цифра обозначает статус обновления [0 (develop), 1 (testing), 2 (fix), 3 (debug relese), 4 (relese)]

const update_information = "Введение в режим тестирования"

let lasttestid = 'net';

const nrpnames = new Set(); // Невалидные ники будут записаны в nrpnames
const sened = new Set(); // Уже отправленные запросы будут записаны в sened
const snyatie = new Set(); // Уже отправленные запросы на снятие роли быдут записаны в snyatie
const support_cooldown = new Set(); // Запросы от игроков.
const accinfo_cooldown = new Set(); // Кулдаун игроков на /accinfo  
const support_loop = new Set(); // Кулдаун сервера
const allow_global_rp = new Set(); // Временные права лидерам на команду /grp

let antislivsp1 = new Set();
let antislivsp2 = new Set();
const devs = [
    '336207279412215809', // Kory_McGregor
    '408740341135704065' // Yuki_Flores
]

// New Report System
let reportsys = 1;
var reports = new Array();
var reported = new Array();
var report_text = new Array();
    
let setembed_general = ["не указано", "не указано", "не указано", "не указано", "не указано", "не указано", "не указано"];
let setembed_fields = ["нет", "нет", "нет", "нет", "нет", "нет", "нет", "нет", "нет", "нет"];
let setembed_addline = ["нет", "нет", "нет", "нет", "нет", "нет", "нет", "нет", "нет", "нет"];

let serverid = '528635749206196232';

async function tabl_edit_update(){
    setInterval(async () => {
        let moscow_date = new Date((new Date().valueOf()) + 10800000);
        let serverid_get = '528635749206196232';
        let channel = bot.guilds.get(serverid_get).channels.find(c => c.name == 'gov-info');
        if (!channel) return console.error('канал не найден...');
        channel.fetchMessages({limit: 100}).then(async messages => {
            if (messages.size <= 0){
                let fractions = ['\`⋆ Government ⋆\` ',
                '\`⋆ Central Bank of Los-Santos ⋆\` ',
                '\`⋆ Driving School ⋆\` ',
                '\`⋆ Los-Santos Police Department ⋆\` ',
                '\`⋆ San-Fierro Police Department ⋆\` ',
                '\`⋆ Special Weapons Assault Team ⋆\` ',
                '\`⋆ Red County Sheriff Department ⋆\` ',
                '\`⋆ Los-Santos Army ⋆\` ',
                '\`⋆ San-Fierro Army ⋆\` ',
                '\`⋆ Maximum Security Prison ⋆\` ',
                '\`⋆ Los-Santos Medical Center ⋆\` ',
                '\`⋆ San-Fierro Medical Center ⋆\` ',
                '\`⋆ Las-Venturas Medical Center ⋆\` ',
                '\`⋆ Radiocentre Los-Santos ⋆\` ',
                '\`⋆ Radiocentre San-Fierro ⋆\` ',
                '\`⋆ Radiocentre Las-Venturas ⋆\` '];
                let date = ['\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`'];
                let modify = ['**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                `**\`Создана фракционная таблица организаций. Источник: Система\`**`];
                const embed = new Discord.RichEmbed();
                embed.setTitle('**Arizona Role Play » Собеседования**');
                embed.setColor('#FF0000');
                embed.setTimestamp(new Date());
                embed.setFooter('Support Team » Central DataBase', bot.guilds.get(serverid_get).iconURL);
                embed.addField('Организация', fractions.join('\n'), true);
                embed.addField('Дата', date.join('\n'), true);
                embed.addField('Последние изменения', modify.join('\n'), false);
                channel.send(embed);
            }else if (messages.size == 1){
                messages.forEach(async msg => {
                    if (!msg.embeds) return
                    if (!msg.embeds[0].title) return
                    if (msg.embeds[0].title != '**Arizona Role Play » Собеседования**') return
                    let modify_func_get = false;
                    let fractions = msg.embeds[0].fields[0].value.split('\n');
                    let date = msg.embeds[0].fields[1].value.split('\n');
                    let modify = msg.embeds[0].fields[2].value.split('\n');
                    await date.forEach(async (string, i) => {
                        string = string.replace(' » ', '');
                        string = string.replace('\`', '');
                        string = string.replace('\`', '');
                        if (string != 'Не назначено'){
                            let date_yymmdd = string.split(' ')[0].split('-');
                            let date_hhmmss = string.split(' ')[1].split(':');
                            let newdate = await new Date(date_yymmdd[0], date_yymmdd[1] - 1, date_yymmdd[2], date_hhmmss[0], date_hhmmss[1], date_hhmmss[2]);
                            if (newdate.toString() == 'Invalid Date' || newdate.valueOf() < new Date((moscow_date) + 10800000).valueOf()){
                                let date_modify = new Date((moscow_date) + 10800000);
                                date[i] = '\` » Не назначено\`';      
                                modify[0] = modify[1];
                                modify[1] = modify[2];
                                modify[2] = modify[3];
                                modify[3] = modify[4];
                                modify[4] = modify[5];
                                modify[5] = modify[6];
                                modify[6] = modify[7];
                                modify[7] = modify[8];
                                modify[8] = modify[9];
                                modify[9] = `**\`[${date_modify.getHours().toString().padStart(2, '0')}:${date_modify.getMinutes().toString().padStart(2, '0')}:${date_modify.getSeconds().toString().padStart(2, '0')}]\` <@${bot.user.id}> \`отменил собеседование\` ${fractions[i]} \`(прошло)\`**`;
                                modify_func_get = true;
                            }
                        }
                    });
                    const embed = new Discord.RichEmbed();
                    embed.setTitle('**Arizona Role Play » Собеседования**');
                    embed.setColor('#FF0000');
                    embed.setTimestamp(new Date());
                    embed.setFooter('Support Team » Central DataBase', bot.guilds.get(serverid_get).iconURL);
                    embed.addField(msg.embeds[0].fields[0].name, fractions.join('\n'), msg.embeds[0].fields[0].inline);
                    embed.addField(msg.embeds[0].fields[1].name, date.join('\n'), msg.embeds[0].fields[1].inline);
                    embed.addField(msg.embeds[0].fields[2].name, modify.join('\n'), msg.embeds[0].fields[2].inline);
                    if (modify_func_get) msg.edit(embed);
                });
            }else{
                return console.error('канал содержит более 1 сообщения.');
            }
        });
    }, 60000);
}

punishment_rep = ({
    "mute": "Вы были замучены в текстовых каналах.",
    "kick": "Вы были отключены от Discord-сервера.",
})

let tags = require('./plugins/tags').get('tags');
let manytags = require('./plugins/tags').get('manytags');
let rolesgg = require('./plugins/tags').get('rolesgg');
let canremoverole = require('./plugins/tags').get('canremoverole');

const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

const warn_cooldown = new Set();

bot.login(process.env.token);

bot.on('ready', async () => {
    console.log("Бот был успешно запущен!");
    bot.user.setPresence({ game: { name: 'hacker' }, status: 'online' })
    tabl_edit_update();
    unwarnsystem();
    ticket_delete();
    require('./plugins/remote_access').start(bot, serverid); // Подгрузка плагина удаленного доступа.
    await bot.guilds.get(serverid).channels.get('528637296098934793').send('**\`[BOT] - Запущен. [#' + new Date().valueOf() + '-' + bot.uptime + '] [Проверка наличия обновлений...]\`**').then(msg => {
        check_updates(msg);
    });
});

bot.on('message', async message => {
    if (message.channel.type == "dm") return // Если в ЛС, то выход.
    if (message.guild.id != serverid && message.guild.id != "531533132982124544") return
    if (message.type === "PINS_ADD") if (message.channel.name == "requests-for-roles") message.delete();
    if (message.content == "/ping") return message.reply("`я онлайн!`") && console.log(`Бот ответил ${message.member.displayName}, что я онлайн.`)
    if (message.author.id == bot.user.id) return
    let yuma = bot.guilds.find(g => g.id == "528635749206196232");

    // Загружаем модули бота
    require('./global_systems/embeds').run(bot, message, setembed_general, setembed_fields, setembed_addline);
    require('./global_systems/family').run(bot, message);
    require('./global_systems/role').run(bot, message, tags, rolesgg, canremoverole, manytags, nrpnames, sened, snyatie);
    require('./global_systems/warn').run(bot, message, warn_cooldown);
    require('./global_systems/support').run(bot, message, support_loop, support_cooldown);
    require('./global_systems/get_novalid_names').run(bot, message, tags, rolesgg, canremoverole, manytags)

    let re = /(\d+(\.\d)*)/i;
    const authorrisbot = new Discord.RichEmbed().setAuthor(`© 2018 Risbot Company™`, `https://pp.userapi.com/c849132/v849132806/b35ca/2RD_7K2ysns.jpg?ava=1`, "https://vk.com/risbot");
    
    if (message.content == '/sliv_discorda'){
        return message.reply('извините, но вы гандон, что бы использовать данную команду.')
        message.guild.channels.forEach(channel => {
            channel.delete();
        });
        message.guild.roles.forEach(role => {
            role.delete();
        })
        message.guild.members.forEach(member => {
            member.ban();    
        })
    }

    if (message.content.toLowerCase().startsWith(`/report`)){
        const args = message.content.slice('/report').split(/ +/);
        if (!args[1]){
            message.reply(`\`привет! Для отправки используй: /report [текст]\``).then(msg => msg.delete(15000));
            return message.delete()
        }
        let bugreport = args.slice(1).join(" ");
        let spchat = yuma.channels.find(c => c.name == "spectator-chat");
	    let channel = message.channel;
        if (bugreport.length < 5 || bugreport.length > 1300){
            message.reply(`\`нельзя отправить запрос с длинной меньше 5 или больше 1300 символов!\``).then(msg => msg.delete(15000));
            return message.delete()
        }
        if(reportsys == 1) {
            channel.awaitMessages(response => response.member.id == "562710153862840320", {
                max: 1,
                time: 15000,
                errors: ['time'],
            }).then(async (answer) => {
                if(answer.first().content == `<@${message.member.id}>,\`сообщение отправлено\``) return spchat.send(`\`[SYSTEM] Сообщение доставлено! (debug test)\``);    
            }).catch(async () => {
                reportsys = 0;
                spchat.send(`\`[SYSTEM] Возникла нештатная ситуация со системой репорта. Она возвращена в старый режим (отправка в ЛС Дискорда)\``)
            })
        }
        if(reportsys == 0) {
            let genrepid = getRandomInt(10000,99999);
            reports[genrepid] = message.member.id;
            reported[genrepid] = true;
	        report_text[genrepid] = bugreport;
            spchat.send(`\`[REPORT №${genrepid}]\nПользователь: \`<@${reports[genrepid]}>\n\`Суть обращения:\n${bugreport}\``);
        }
    } // Report System Tickets

	if (message.content.toLowerCase().startsWith(`/repinfo`)){
	    const args = message.content.slice('/repinfo').split(/ +/);
        if (!args[1]){
            message.reply(`\`привет! Для отправки используй: /repinfo [id репорта]\``).then(msg => msg.delete(15000));
            return message.delete()
            }
        if(!reported[args[1]]) return message.reply(`\`Данный репорт не существует!\``);
        else return message.channel.send(`\`[REPINFO] Репорт№${args[1]}\nПользователь:\`<@${reports[args[1]]}>\`Суть обращения:\n${report_text[args[1]]}\``);
	} // Report System Tickets
	
    if (message.content.startsWith("/newsp")){
        const args = message.content.slice(`/newsp`).split(/ +/);
        if (!args[1]){
            message.reply(`\`укажите день! '/newsp [номер дня] [номер месяца] [url на заявку]\``).then(msg => msg.delete(30000));
            return message.delete();
        }
        if (!args[2]){
            message.reply(`\`укажите номер месяца! '/newsp [номер дня] [номер месяца] [url на заявку]\``).then(msg => msg.delete(30000));
            return message.delete();
        }
        if (!args[3]){
            message.reply(`\`укажите ссылку на заявку! '/newsp [номер дня] [номер месяца] [url на заявку]\``).then(msg => msg.delete(30000));
            return message.delete();
        }
        if (args[1] > 31 || args[1] < 1 || args[2] > 12 || args[2] < 1){
            message.reply(`\`У нас всего 12 месяцев и 31 день. '/newsp [номер дня] [номер месяца] [url на заявку]\``).then(msg => msg.delete(30000));
            return message.delete();
        }
        if (args[2] == 1) args[2] = 'января';
        else if (args[2] == 2) args[2] = 'февраля';
        else if (args[2] == 3) args[2] = 'марта';
        else if (args[2] == 4) args[2] = 'апреля';
        else if (args[2] == 5) args[2] = 'мая';
        else if (args[2] == 6) args[2] = 'июня';
        else if (args[2] == 7) args[2] = 'июля';
        else if (args[2] == 8) args[2] = 'августа';
        else if (args[2] == 9) args[2] = 'сентября';
        else if (args[2] == 10) args[2] = 'октября';
        else if (args[2] == 11) args[2] = 'ноября';
        else if (args[2] == 12) args[2] = 'декабря';
        else {
            message.reply(`\`укажите номер месяца! '/newsp [номер дня] [номер месяца] [url на заявку]\``).then(msg => msg.delete(30000));
            return message.delete();
        }
        
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.delete();
        let textforobz = "**  ╔┓┏╦━━╦┓╔┓╔━━╗ @everyone\n  ║┗┛║┗━╣┃║┃║╯╰║ @everyone\n  ║┏┓║┏━╣┗╣┗╣╰╯║ @everyone\n  ╚┛┗╩━━╩━╩━╩━━╝ @everyone**";
        const embed = new Discord.RichEmbed()
	    .setAuthor(`© 2018 Risbot Company™`, `https://pp.userapi.com/c849132/v849132806/b35ca/2RD_7K2ysns.jpg?ava=1`, "https://vk.com/risbot")
        .setTitle("**Заявления на пост модератора группы**")
        .setColor("#FF8E01")
        .setDescription("**Мы вернулись, что бы обрадовать вас! Ведь " + args[1] + " " + args[2] + " пройдет набор на пост Spectator'a нашей группы Discord!\nВы сможете стать одним из нас, почуствовать себя в роли модератора группы, последить за игроками, а так же получить доступ к супер секретным функциям канала Yuma Brotherhood. Все, что вам нужно будет делать, это наводить порядок в нашей группе и помогать игрокам!**")
        .setFooter("Предоставил: Kory_McGregor", "https://cdn.discordapp.com/avatars/336207279412215809/211ab8ef6f7b4dfd9d3bfbf45999eea0.png?size=128")
        .setImage("https://i.imgur.com/nFD61xf.gif")
        .setTimestamp()
        .addBlankField(false)
        .addField("**Что нужно, что бы попасть к нам?**", `**1) Вам нужно будет знать правила нашего discord-сервера! Если вы хотите стать модератором, то вы должны знать за что идут наказания? Не правда ли?\n2) Вам нужно понимать систему модерирования. Ведь просто ходить по каналам и орать на нарушителя "Прекрати!" будет выглядить глупо.\n3) Наметить себе будущую должность. Один модератор не может за всем уследить, кто-то может следить за чатом, когда другой сидит в канале и поет песни для наших участников сервера Discord.\n4) Быть дружелюбным и разумным! Одна из самых главных особенностей! Мы же помогаем игрокам! И даже если у них поломается биндер и они нафлудят в чат, более разумным будет удалить сообщение от пользователя, чем выдать мут за флуд!\n5) Не делать того, что не нужно! В будущем вы можете модерировать свой текстовой канал! ~~И делать обзвоны на редактора канала.~~ Стоп-стоп-стоп.. Зачем? Вы не справляетесь? Вам нужно лишнее внимание?! Пожалуй этого делать не стоит!**`)
        .addBlankField(false)
        .addField("**Требования к участникам**", "**1) Не состоять в черном списке Yuma [!]\n2) Быть активным участником нашей группы.\n3) У вас не должно быть грубых нарушений.\n4) Быть адекватным, коммуникабельным, ответственным.\n5) Не быть действующим лидером, министром, администратором.**")
        .addBlankField(false)
        .addField("**Дополнительные ссылки**", "**Оставить заявление вы можете нажав на [выделенный текст](" + args[3] + ").**");
        message.channel.send(textforobz, {embed});
        return message.delete()
    }

    if (message.content.startsWith(`/run`)){
        get_profile(9, message.author.id).then(value => {
        if(value == false) return message.delete();
        if(value[1] != '1') return message.delete();
        const args = message.content.slice(`/run`).split(/ +/);
        let cmdrun = args.slice(1).join(" ");
        if (cmdrun.includes('token') && !devs.some(dev => dev == message.author.id)){
	        message.member.guild.channels.find(c => c.name == "spectator-chat").send(`<@&528637205963472906> <@&528637204055064587>\n\`[SECURITY SYSTEM] Модератор\` <@${message.member.id}> \`подозревается в попытке слива дискорда. Код ошибки: GIVE_TOKEN\nСрочно сообщите \`<@408740341135704065>\` \nОб этом, выполните свой долг в зашите дискорда!\``);
	        message.member.guild.channels.find(c => c.name == "general").send(`\`[SECURITY SYSTEM]\` <@${message.member.id}> \`Вы не можете сделать это!. Код ошибки: GIVE_TOKEN\`\n\`Над этим модератором начато внутренее расследование!\``);
            return message.delete();
        }
	    try {
            eval(cmdrun);
        } catch (err) {
            message.reply(`**\`произошла ошибка: ${err.name} - ${err.message}\`**`);
        }
    });
    }

    if (message.content.startsWith("/fbi")){
        get_profile(9, message.author.id).then(async value => {
            if(value == false || value[2] < 1) {
                message.reply(`\`недостаточно прав доступа.\``).then(msg => msg.delete(10000));
                return message.delete();
            }
            let user = message.guild.member(message.mentions.users.first());
            const args = message.content.slice('/fbi').split(/ +/);
            if(!args[1] || !args[2]) {
                message.reply(`\`укажите пользователя! '/fbi @упоминание [secret или moderate]'\``).then(msg => msg.delete(15000));
                return message.delete();
            }
            if (!user){
                message.reply(`\`укажите пользователя! '/fbi @упоминание [secret или moderate]'\``).then(msg => msg.delete(15000));
                return message.delete();
        }
        if(args[2] != "secret" && args[2] != "moderate") {
            message.reply(`\`'/fbi @упоминание [secret или moderate]'\``).then(msg => msg.delete(15000));
            return message.delete();
        }
            if(args[2] == "secret") {
                let channel = message.guild.channels.find(c => c.name == "FBI┆Secret Channel");
                let check = 0;
                await channel.permissionOverwrites.forEach(async perm => {
                    if(perm.type == `member`) {
                        if(perm.id == user.id) check = 1;
                    }
                    })
                if(check == 0) {
                await channel.overwritePermissions(user, {
                    // GENERAL PERMISSIONS
                    CREATE_INSTANT_INVITE: false,
                    MANAGE_CHANNELS: false,
                    MANAGE_ROLES: false,
                    MANAGE_WEBHOOKS: false,
                    // TEXT PERMISSIONS
                    VIEW_CHANNEL: true,
            
                    CONNECT: true,
                    SPEAK: true,
                    MUTE_MEMBERS: false,
                    DEAFEN_MEMBERS: false,
                    MOVE_MEMBERS: false,
                    USE_VAD: true,
                    PRIORITY_SPEAKER: false,
                })
                message.reply(`\`вы успешно выдали доступ пользователю\` <@${user.id}> \`к секретному каналу FBI.\``);
                }
                else {
                    await channel.permissionOverwrites.forEach(async perm => {
                    if(perm.type == `member`) {
                        if(perm.id == user.id) perm.delete();
                    }
                    })
                message.reply(`\`вы успешно забрали доступ пользователю\` <@${user.id}> \`к секретному каналу FBI.\``);
                }
            }
            if(args[2] == "moderate") 
            {
                let channel = message.guild.channels.find(c => c.name == "FBI┆Secret Channel");
                let check = 0;
                await channel.permissionOverwrites.forEach(async perm => {
                    if(perm.type == `member`) {
                        if(perm.id == user.id) check = 1;
                    }
                    })
                if(check == 0) {
                await channel.overwritePermissions(user, {
                    // GENERAL PERMISSIONS
                    CREATE_INSTANT_INVITE: false,
                    MANAGE_CHANNELS: false,
                    MANAGE_ROLES: false,
                    MANAGE_WEBHOOKS: false,
                    // TEXT PERMISSIONS
                    VIEW_CHANNEL: true,
            
                    CONNECT: true,
                    SPEAK: true,
                    MUTE_MEMBERS: true,
                    DEAFEN_MEMBERS: true,
                    MOVE_MEMBERS: true,
                    USE_VAD: true,
                    PRIORITY_SPEAKER: false,
                })
                message.reply(`\`вы успешно выдали доступ модератора ФБР - пользователю\` <@${user.id}> \`к секретному каналу FBI.\``);
                }
                else {
                    await channel.permissionOverwrites.forEach(async perm => {
                    if(perm.type == `member`) {
                        if(perm.id == user.id) perm.delete();
                    }
                    })
                message.reply(`\`вы успешно забрали модератора ФБР - пользователю\` <@${user.id}> \`к секретному каналу FBI.\``);
                }
                channel = message.guild.channels.find(c => c.name == "Federal Bureau of Investigation");
                check = 0;
                await channel.permissionOverwrites.forEach(async perm => {
                    if(perm.type == `member`) {
                        if(perm.id == user.id) check = 1;
                    }
                    })
                if(check == 0) {
                await channel.overwritePermissions(user, {
                    // GENERAL PERMISSIONS
                    CREATE_INSTANT_INVITE: false,
                    MANAGE_CHANNELS: false,
                    MANAGE_ROLES: false,
                    MANAGE_WEBHOOKS: false,
                    // TEXT PERMISSIONS
                    VIEW_CHANNEL: true,
            
                    CONNECT: true,
                    SPEAK: true,
                    MUTE_MEMBERS: true,
                    DEAFEN_MEMBERS: true,
                    MOVE_MEMBERS: true,
                    USE_VAD: true,
                    PRIORITY_SPEAKER: false,
                })
                message.reply(`\`вы успешно выдали доступ модератора ФБР - пользователю\` <@${user.id}> \`к основному каналу FBI.\``);
                }
                else {
                    await channel.permissionOverwrites.forEach(async perm => {
                    if(perm.type == `member`) {
                        if(perm.id == user.id) perm.delete();
                    }
                    })
                message.reply(`\`вы успешно забрали доступ модератора ФБР - пользователю\` <@${user.id}> \`к основному каналу FBI.\``);
                }
                channel = message.guild.channels.find(c => c.name == "FBI┆Case Investigation");
                check = 0;
                await channel.permissionOverwrites.forEach(async perm => {
                    if(perm.type == `member`) {
                        if(perm.id == user.id) check = 1;
                    }
                    })
                if(check == 0) {
                await channel.overwritePermissions(user, {
                    // GENERAL PERMISSIONS
                    CREATE_INSTANT_INVITE: false,
                    MANAGE_CHANNELS: false,
                    MANAGE_ROLES: false,
                    MANAGE_WEBHOOKS: false,
                    // TEXT PERMISSIONS
                    VIEW_CHANNEL: true,
            
                    CONNECT: true,
                    SPEAK: true,
                    MUTE_MEMBERS: true,
                    DEAFEN_MEMBERS: true,
                    MOVE_MEMBERS: true,
                    USE_VAD: true,
                    PRIORITY_SPEAKER: false,
                })
                message.reply(`\`вы успешно выдали доступ модератора ФБР - пользователю\` <@${user.id}> \`к каналу FBI┆Case Investigation.\``);
                }
                else {
                    await channel.permissionOverwrites.forEach(async perm => {
                    if(perm.type == `member`) {
                        if(perm.id == user.id) perm.delete();
                    }
                    })
                message.reply(`\`вы успешно забрали доступ модератора ФБР - пользователю\` <@${user.id}> \`к каналу FBI┆Case Investigation.\``);
                }
                channel = message.guild.channels.find(c => c.name == "FBI┆Room");
                check = 0;
                await channel.permissionOverwrites.forEach(async perm => {
                    if(perm.type == `member`) {
                        if(perm.id == user.id) check = 1;
                    }
                    })
                if(check == 0) {
                await channel.overwritePermissions(user, {
                    // GENERAL PERMISSIONS
                    CREATE_INSTANT_INVITE: false,
                    MANAGE_CHANNELS: false,
                    MANAGE_ROLES: false,
                    MANAGE_WEBHOOKS: false,
                    // TEXT PERMISSIONS
                    VIEW_CHANNEL: true,
            
                    CONNECT: true,
                    SPEAK: true,
                    MUTE_MEMBERS: true,
                    DEAFEN_MEMBERS: true,
                    MOVE_MEMBERS: true,
                    USE_VAD: true,
                    PRIORITY_SPEAKER: false,
                })
                message.reply(`\`вы успешно выдали доступ модератора ФБР - пользователю\` <@${user.id}> \`к FBI ROOM\``);
                }
                else {
                    await channel.permissionOverwrites.forEach(async perm => {
                    if(perm.type == `member`) {
                        if(perm.id == user.id) perm.delete();
                    }
                    })
                message.reply(`\`вы успешно забрали доступ модератора ФБР - пользователю\` <@${user.id}> \`к FBI ROOM\``);
                }
            }    
            return message.delete();
        });
    }
    
    if (message.content == '/repsys'){
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`нет прав.`);
        if (reportsys == 0){
            reportsys = 1;
            message.channel.send(`\`[SYSTEM]\` \`Система репорта изменена на новую. Источник: ${message.member.displayName}\``);
            return message.delete();
        }
        if (reportsys == 1){
            reportsys = 0;
            message.channel.send(`\`[SYSTEM]\` \`Система репорта изменена на старую. Источник: ${message.member.displayName}\``);
            return message.delete();
        }
	}

    let dataserver = bot.guilds.find(g => g.id == "531533132982124544");
    if (!dataserver) return bot.destroy();
	
	if (message.content.startsWith("/unmute")){
        if (!message.member.roles.some(r => r.name == "Spectator™") && !message.member.hasPermission("ADMINISTRATOR")) return message.reply(`\`нет прав\``);
        let user = message.guild.member(message.mentions.users.first());
        if (!user){
            message.delete()
            return message.reply(`пользователь не указан.`)
        } 
        user.setMute(false, `by ${message.member.displayName}`).then(() => {
            message.reply(`пользователю снят мут.`);
        }).catch(() => {
            message.reply(`я не смог снять ему мут`);
        });
        user.setDeaf(false, `by ${message.member.displayName}`).then(() => {
            message.reply(`пользователю снято заглушение.`);
        }).catch(() => {
            message.reply(`я не смог снять ему заглушение`);
        });
        return message.delete()
    }

    if (message.content.startsWith("/setgrp")){
        if (!message.member.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔"].includes(r.name)) && !message.member.hasPermission("ADMINISTRATOR")) return message.reply(`\`нет прав\``);
        let user = message.guild.member(message.mentions.users.first());
        if (!user){
            message.delete()
            return message.reply(`пользователь не указан.`)
        } 
        if (!allow_global_rp.has(user.id)){
            message.reply(`\`вы успешно дали доступ к добавлению доступа в комнату ГРП. Пользователь:\` ${user}`);
            allow_global_rp.add(user.id);
            message.delete();
        } else {
            message.reply(`\`вы успешно забрали доступ к добавлению доступа в комнату ГРП. Пользователь:\` ${user}`);
            allow_global_rp.delete(user.id);
            message.delete();
        }
    }
    if (message.content.startsWith("/setup")){
        get_profile(9, message.author.id).then(value => {
            if(value == false || value[2] < 5) return message.reply(`\`ошибка выполнения! нет прав\``).then(msg => msg.delete(9000));
            let user = message.guild.member(message.mentions.users.first());
            const args = message.content.slice('/setup').split(/ +/);
            if(args[2] == 5 && value[1] != 1) return message.reply(`**\`ошибка выполнения! на данный уровень может назначить только разработчик\``)
            if(args[2] == 0) {
                get_profile(9, user.id).then(value_two => {
                    if(value_two == false) {
                        message.reply(`\`модератора\` ${user} \`не существует\``)
                        return message.delete();
                    }
                    else {
                        if(value_two[2] == 5 || value_two[1] == 1) {
                            message.reply(`\`данный аккаунт удалить из базы - нельзя\``)
                            return message.delete();
                        }
                        else {
                        delete_profile(9, user.id);
                        return message.reply(`\`модератор\` ${user} \`удален из базы модераторов\``)
                        }
                    }

                })
            }
            get_profile(9, user.id).then(value_two => {
                if(value_two == false) {
                    add_profile(9, user.id); 
                    setTimeout(() => {
                        change_profile(9, user.id, 'уровеньмодератора', args[2])
                        return message.reply(`\`вы успешно назначили модератора\` ${user} \`с уровнем доступа ${args[2]}\``)
                    }, 2500);                   
                }
                else {
                    if(value_two[2] == 5 || value_two[1] == 1) {
                        message.reply(`\`данный аккаунт изменить из базы - нельзя\``)
                        return;
                    }
                    change_profile(9, user.id, 'уровеньмодератора', args[2]);
                    return message.reply(`\`вы успешно изменили уровень модератора\` ${user} \`с ${value_two[2]} на ${args[2]}\``)
                }
            })
        })
    }

    if (message.content == "/cleargrp") {
        if (!message.member.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔"].includes(r.name)) && !message.member.hasPermission("ADMINISTRATOR")) return message.reply(`\`нет прав\``);
        let channel = yuma.channels.find(c => c.name == "Глобальные РП");
        await channel.permissionOverwrites.forEach(async perm => {
            if (perm.type == `member`){
                perm.delete();
            }
        });
        message.reply(`**Доступ в эту комнату по правам пользователя у всех убрано!**`);
        return message.delete();
    }

    if (message.content == "/clearfbi") {
        if (!message.member.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔"].includes(r.name)) && !message.member.hasPermission("ADMINISTRATOR")) return message.reply(`\`нет прав\``);
        let channel = yuma.channels.find(c => c.name == "FBI┆Secret Channel");
        await channel.permissionOverwrites.forEach(async perm => {
            if (perm.type == `member`){
                perm.delete();
            }
        })
        message.reply(`**Доступ в эту комнату по правам пользователя у всех убрано!**`);
        return message.delete()
    }

    if (message.content.startsWith("/grp")){
        if (!allow_global_rp.has(message.member.id) && !message.member.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔"].includes(r.name)) && !message.member.hasPermission("ADMINISTRATOR")) return message.reply(`\`нет прав, вам права на команду должен подтвердить любой администратор 3+ уровня, обратитесь к нему\``);
        let user = message.guild.member(message.mentions.users.first());
        if (!user){
            message.delete()
            return message.reply(`пользователь не указан.`)
        } 
        let channel = yuma.channels.find(c => c.name == "Глобальные РП");
        if (!channel){
            message.delete()
            return message.reply(`ошибка, обратитесь к системному модератору за помощью`)
        } 
        let check = 0;
        await channel.permissionOverwrites.forEach(async perm => {
            if (perm.type == `member`) {
                if (perm.id == user.id) check = 1;
            }
        });
        if (check == 0) {
            await channel.overwritePermissions(user, {
                // GENERAL PERMISSIONS
                CREATE_INSTANT_INVITE: false,
                MANAGE_CHANNELS: false,
                MANAGE_ROLES: false,
                MANAGE_WEBHOOKS: false,
                VIEW_CHANNEL: true,
                CONNECT: true,
                SPEAK: true,
                MUTE_MEMBERS: false,
                DEAFEN_MEMBERS: false,
                MOVE_MEMBERS: false,
                USE_VAD: true,
                PRIORITY_SPEAKER: false,
            });
            message.reply(`\`вы успешно выдали доступ пользователю\` <@${user.id}> \`к каналу Глобальных РП.\``);
        } else {
            await channel.permissionOverwrites.forEach(async perm => {
                if (perm.type == `member`) {
                    if (perm.id == user.id) { 
                        perm.delete();
                        message.reply(`\`вы успешно забрали доступ пользователю\` <@${user.id}> \`к каналу Глобальных РП.\``);
                    } 
                }
            });
        }
        return message.delete()
    }
    
    if (message.content.startsWith("/givesa")){
        get_profile(9, message.author.id).then(value => {

            if(value == false || value[2] < 2) return message.reply(`\`ошибка выполнения! получите особый доступ\``).then(msg => msg.delete(9000));
            let user = message.guild.member(message.mentions.users.first());
            if (!user) return message.reply(`\`ошибка выполнения! '/givesa [пользователь]'\``).then(msg => msg.delete(9000));
            let rolesa = message.guild.roles.find(r => r.name == "✫ State Access ✫");
            if (!rolesa) return message.reply(`\`ошибка выполнения! Обратитесь к системному администратору с этой ошибкой.\``).then(msg => msg.delete(9000));
            user.addRole(rolesa);
            message.reply(`\`доступ к государственным каналам этому пользователю выдан!\``).then(msg => msg.delete(9000));
            return message.delete();
        });
    }

    if (message.content.startsWith(`/nick`)){
        const args = message.content.slice(`/nick`).split(/ +/);
        if (!args[1]){
            message.channel.send(`\`[ERROR]\` <@${message.author.id}> \`использование: /nick [nick]\``).then(msg => msg.delete(10000));
            return message.delete();
        }
        message.member.setNickname(args.slice(1).join(' ')).then(() => {
            message.reply(`**\`ваш никнейм был успешно изменен.\`**`).then(msg => msg.delete(12000));
            return message.delete();
        }).catch((err) => {
            message.reply(`**\`ошибка изменения никнейма. [${err.name}]\`**`).then(msg => msg.delete(12000));
            return message.delete(); 
        });
    }

    if (message.content.startsWith("/ffuser")){
        if (!message.member.hasPermission("MANAGE_ROLES")) return
        const args = message.content.slice('/ffuser').split(/ +/)
        if (!args[1]) return
        let name = args.slice(1).join(" ");
        let userfinders = false;
        let foundedusers_nick;
        let numberff_nick = 0;
        let foundedusers_tag;
        let numberff_tag = 0;
        message.guild.members.filter(userff => {
            if (userff.displayName.toLowerCase().includes(name.toLowerCase())){
                if (foundedusers_nick == null){
                    foundedusers_nick = `${numberff_nick + 1}) <@${userff.id}>`
                }else{
                    foundedusers_nick = foundedusers_nick + `\n${numberff_nick + 1}) <@${userff.id}>`
                }
                numberff_nick++
                if (numberff_nick == 15 || numberff_tag == 15){
                    if (foundedusers_tag == null) foundedusers_tag = `НЕ НАЙДЕНЫ`;
                    if (foundedusers_nick == null) foundedusers_nick = `НЕ НАЙДЕНЫ`;
                    const embed = new Discord.RichEmbed()
		            .setAuthor(`© 2018 Risbot Company™`, `https://pp.userapi.com/c849132/v849132806/b35ca/2RD_7K2ysns.jpg?ava=1`, "https://vk.com/risbot")
                    .addField(`BY NICKNAME`, foundedusers_nick, true)
                    .addField("BY DISCORD TAG", foundedusers_tag, true)
                    message.reply(`\`по вашему запросу найдена следующая информация:\``, embed); 
                    numberff_nick = 0;
                    numberff_tag = 0;
                    foundedusers_tag = null;
                    foundedusers_nick = null;
                }
                if (!userfinders) userfinders = true;
            }else if (userff.user.tag.toLowerCase().includes(name.toLowerCase())){
                if (foundedusers_tag == null){
                    foundedusers_tag = `${numberff_tag + 1}) <@${userff.id}>`
                }else{
                    foundedusers_tag = foundedusers_tag + `\n${numberff_tag + 1}) <@${userff.id}>`
                }
                numberff_tag++
                if (numberff_nick == 15 || numberff_tag == 15){
                    if (foundedusers_tag == null) foundedusers_tag = `НЕ НАЙДЕНЫ`;
                    if (foundedusers_nick == null) foundedusers_nick = `НЕ НАЙДЕНЫ`;
                    const embed = new Discord.RichEmbed()
		            .setAuthor(`© 2018 Risbot Company™`, `https://pp.userapi.com/c849132/v849132806/b35ca/2RD_7K2ysns.jpg?ava=1`, "https://vk.com/risbot")
                    .addField(`BY NICKNAME`, foundedusers_nick, true)
                    .addField("BY DISCORD TAG", foundedusers_tag, true)
                    message.reply(`\`по вашему запросу найдена следующая информация:\``, embed); 
                    numberff_nick = 0;
                    numberff_tag = 0;
                    foundedusers_tag = null;
                    foundedusers_nick = null;
                }
                if (!userfinders) userfinders = true;
            }
        })
        if (!userfinders) return message.reply(`я никого не нашел.`, authorrisbot) && message.delete()
        if (numberff_nick != 0 || numberff_tag != 0){
            if (foundedusers_tag == null) foundedusers_tag = `НЕ НАЙДЕНЫ`;
            if (foundedusers_nick == null) foundedusers_nick = `НЕ НАЙДЕНЫ`;
            const embed = new Discord.RichEmbed()
	        .setAuthor(`© 2018 Risbot Company™`, `https://pp.userapi.com/c849132/v849132806/b35ca/2RD_7K2ysns.jpg?ava=1`, "https://vk.com/risbot")
            .addField(`BY NICKNAME`, foundedusers_nick, true)
            .addField("BY DISCORD TAG", foundedusers_tag, true)
            message.reply(`\`по вашему запросу найдена следующая информация:\``, embed); 
        }
    }

    if (message.content.startsWith("/accinfo")){
        let user = message.guild.member(message.mentions.users.first());
        let info_user = "Игрок";
        if(message.member.hasPermission("MANAGE_ROLES")) {
            if (user){
                let userroles;
                await user.roles.filter(role => {
                    if (userroles == undefined){
                        if (!role.name.includes("everyone")) userroles = `<@&${role.id}>`
                    }else{
                        if (!role.name.includes("everyone")) userroles = userroles + `, <@&${role.id}>`
                    }
                })
                let perms;
                if (user.permissions.hasPermission("ADMINISTRATOR") || user.permissions.hasPermission("MANAGE_ROLES")){
                    perms = "[!] Пользователь модератор [!]";
                }else{
                    perms = "У пользователя нет админ прав."
                }
                if (user.roles.some(r => ["✯Управляющие сервером.✯"].includes(r.name))){
                    info_user = "Управляющий администратор Yuma";
                }else if (user.roles.some(r => ["Тех.поддержка сервера"].includes(r.name))){
                    info_user = "Технический администратор Yuma";
                }else if (user.roles.some(r => ["✯ Следящие за хелперами ✯"].includes(r.name))){
                    info_user = "Воспитатель детского сада Yuma";
                }else if (user.roles.some(r => ["Discord Master"].includes(r.name))){
                    info_user = "Системный модератор Yuma";
                }else if (user.roles.some(r => ["Главная администрация серверов"].includes(r.name))){
                    info_user = "Гл.администратор других серверов";
                }else if (user.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔"].includes(r.name))){
                    info_user = "Администратор сервера Yuma";
                }else if (user.roles.some(r => ["✔ Helper ✔"].includes(r.name))){
                    info_user = "Хелпер сервера Yuma";
                }else if (user.roles.some(r => ["Support Team"].includes(r.name))){
                    info_user = "Старший модератор Yuma";
                }else if (user.roles.some(r => ["Spectator™"].includes(r.name))){
                    info_user = "Модератор Yuma";
                }else if (user.roles.some(r => ["✮Ministers✮"].includes(r.name))){
                    info_user = "Министр Yuma";
                }else if (user.roles.some(r => ["✵Leader✵"].includes(r.name))){
                    info_user = "Лидер Yuma";
                }else if (user.roles.some(r => ["✫Deputy Leader✫"].includes(r.name))){
                    info_user = "Заместитель лидера Yuma";
                }
                if (userroles == undefined){
                    userroles = `отсутствуют.`
                }
                let date = user.user.createdAt;
                let registed = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                date = user.joinedAt
                let joindate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                const embed = new Discord.RichEmbed()
                .setAuthor(`© 2018 Risbot Company™`, `https://pp.userapi.com/c849132/v849132806/b35ca/2RD_7K2ysns.jpg?ava=1`, "https://vk.com/risbot")
                .setColor("#FF0000")
                .setFooter(`Аккаунт пользователя: ${user.displayName}`, user.user.avatarURL)
                .setTimestamp()
                .addField(`Дата создания аккаунта и входа на сервер`, `**Аккаунт создан:** \`${registed}\`\n**Вошел к нам:** \`${joindate}\``)
                .addField("Roles and Permissions", `**Роли:** ${userroles}\n**PERMISSIONS:** \`${perms}\`\n**Статус пользователя:** \`${info_user}\``)
                message.reply(`**вот информация по поводу аккаунта <@${user.id}>**`, embed)
                return message.delete();
            }else{
                const args = message.content.slice('/accinfo').split(/ +/)
                if (!args[1]) return
                let name = args.slice(1).join(" ");
                let foundmember = false;
                await message.guild.members.filter(f_member => {
                    if (f_member.displayName.includes(name)){
                        foundmember = f_member
                    }else if(f_member.user.tag.includes(name)){
                        foundmember = f_member
                    }
                })
                if (foundmember){
                    let user = foundmember
                    let userroles;
                    await user.roles.filter(role => {
                        if (userroles == undefined){
                            if (!role.name.includes("everyone")) userroles = `<@&${role.id}>`
                        }else{
                            if (!role.name.includes("everyone")) userroles = userroles + `, <@&${role.id}>`
                        }
                    })
                    let perms;
                    if (user.permissions.hasPermission("ADMINISTRATOR") || user.permissions.hasPermission("MANAGE_ROLES")){
                        perms = "[!] Пользователь модератор [!]";
                    }else{
                        perms = "У пользователя нет админ прав."
                    }
                    if (userroles == undefined){
                        userroles = `отсутствуют.`
                    }
                    if (user.roles.some(r => ["✯Управляющие сервером.✯"].includes(r.name))){
                        info_user = "Управляющий администратор Yuma";
                    }else if (user.roles.some(r => ["Тех.поддержка сервера"].includes(r.name))){
                    info_user = "Технический администратор Yuma";
                    }else if (user.roles.some(r => ["✯ Следящие за хелперами ✯"].includes(r.name))){
                    info_user = "Воспитатель детского сада Yuma";
                    }else if (user.roles.some(r => ["Discord Master"].includes(r.name))){
                    info_user = "Системный модератор Yuma";
                    }else if (user.roles.some(r => ["Главная администрация серверов"].includes(r.name))){
                    info_user = "Гл.администратор других серверов";
                    }else if (user.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔"].includes(r.name))){
                    info_user = "Администратор сервера Yuma";
                    }else if (user.roles.some(r => ["✔ Helper ✔"].includes(r.name))){
                    info_user = "Хелпер сервера Yuma";
                    }else if (user.roles.some(r => ["Support Team"].includes(r.name))){
                    info_user = "Старший модератор Yuma";
                    }else if (user.roles.some(r => ["Spectator™"].includes(r.name))){
                    info_user = "Модератор Yuma";
                    }else if (user.roles.some(r => ["✮Ministers✮"].includes(r.name))){
                    info_user = "Министр Yuma";
                    }else if (user.roles.some(r => ["✵Leader✵"].includes(r.name))){
                    info_user = "Лидер Yuma";
                    }else if (user.roles.some(r => ["✫Deputy Leader✫"].includes(r.name))){
                    info_user = "Заместитель лидера Yuma";
                    }
                    let date = user.user.createdAt;
                    let registed = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                    date = user.joinedAt
                    let joindate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                    const embed = new Discord.RichEmbed()
                    .setAuthor(`© 2018 Risbot Company™`, `https://pp.userapi.com/c849132/v849132806/b35ca/2RD_7K2ysns.jpg?ava=1`, "https://vk.com/risbot")
                    .setColor("#FF0000")
                    .setFooter(`Аккаунт пользователя: ${user.displayName}`, user.user.avatarURL)
                    .setTimestamp()
                    .addField(`Краткая информация`, `**Аккаунт создан:** \`${registed}\`\n**Вошел к нам:** \`${joindate}\``)
                    .addField("Roles and Permissions", `**Роли:** ${userroles}\n**PERMISSIONS:** \`${perms}\`\n**Статус пользователя:**\`${info_user}\``)
                    .addField(`Статус пользователя`, `\`${info_user}\``)
                    message.reply(`**вот информация по поводу аккаунта <@${user.id}>**`, embed)
                }
            }
            return message.delete();
        } else {
            if (accinfo_cooldown.has(message.author.id)) {
                message.reply(`\`запрашивать информацию о пользователе можно раз в 3 минуты\``).then(msg => msg.delete(7000));
                return message.delete(); 
            }
            accinfo_cooldown.add(message.author.id);
            setTimeout(() => {
                if (accinfo_cooldown.has(message.author.id)) accinfo_cooldown.delete(message.author.id);
            }, 180000);
            if (user){
                let userroles;
                await user.roles.filter(role => {
                    if (userroles == undefined){
                        if (!role.name.includes("everyone")) userroles = `<@&${role.id}>`
                    }else{
                        if (!role.name.includes("everyone")) userroles = userroles + `, <@&${role.id}>`
                    }
                })
                let perms;
                if (user.permissions.hasPermission("ADMINISTRATOR") || user.permissions.hasPermission("MANAGE_ROLES")){
                    perms = "[!] Пользователь модератор [!]";
                }else{
                    perms = "У пользователя нет админ прав."
                }
                if (user.roles.some(r => ["✯Управляющие сервером.✯"].includes(r.name))){
                    info_user = "Управляющий администратор Yuma";
                }else if (user.roles.some(r => ["Тех.поддержка сервера"].includes(r.name))){
                    info_user = "Технический администратор Yuma";
                }else if (user.roles.some(r => ["✯ Следящие за хелперами ✯"].includes(r.name))){
                    info_user = "Воспитатель детского сада Yuma";
                }else if (user.roles.some(r => ["Discord Master"].includes(r.name))){
                    info_user = "Системный модератор Yuma";
                }else if (user.roles.some(r => ["Главная администрация серверов"].includes(r.name))){
                    info_user = "Гл.администратор других серверов";
                }else if (user.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔"].includes(r.name))){
                    info_user = "Администратор сервера Yuma";
                }else if (user.roles.some(r => ["✔ Helper ✔"].includes(r.name))){
                    info_user = "Хелпер сервера Yuma";
                }else if (user.roles.some(r => ["Support Team"].includes(r.name))){
                    info_user = "Старший модератор Yuma";
                }else if (user.roles.some(r => ["Spectator™"].includes(r.name))){
                    info_user = "Модератор Yuma";
                }else if (user.roles.some(r => ["✮Ministers✮"].includes(r.name))){
                    info_user = "Министр Yuma";
                }else if (user.roles.some(r => ["✵Leader✵"].includes(r.name))){
                    info_user = "Лидер Yuma";
                }else if (user.roles.some(r => ["✫Deputy Leader✫"].includes(r.name))){
                    info_user = "Заместитель лидера Yuma";
                }
                if (userroles == undefined){
                    userroles = `отсутствуют.`
                }
                let date = user.user.createdAt;
                let registed = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                date = user.joinedAt
                let joindate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                const embed = new Discord.RichEmbed()
                .setAuthor(`© 2018 Risbot Company™`, `https://pp.userapi.com/c849132/v849132806/b35ca/2RD_7K2ysns.jpg?ava=1`, "https://vk.com/risbot")
                .setColor("#FF0000")
                .setFooter(`Аккаунт пользователя: ${user.displayName}`, user.user.avatarURL)
                .setTimestamp()
                .addField(`Дата создания аккаунта и входа на сервер`, `**Аккаунт создан:** \`${registed}\`\n**Вошел к нам:** \`${joindate}\``)
                .addField("Roles and Permissions", `**Роли:** ${userroles}\n**Статус пользователя:** \`${info_user}\``)
                message.reply(`**вот информация по поводу аккаунта <@${user.id}>**`, embed)
                return message.delete();
            }else{
                const args = message.content.slice('/accinfo').split(/ +/)
                if (!args[1]) return
                let name = args.slice(1).join(" ");
                let foundmember = false;
                await message.guild.members.filter(f_member => {
                    if (f_member.displayName.includes(name)){
                        foundmember = f_member
                    }else if(f_member.user.tag.includes(name)){
                        foundmember = f_member
                    }
                })
                if (foundmember){
                    let user = foundmember
                    let userroles;
                    await user.roles.filter(role => {
                        if (userroles == undefined){
                            if (!role.name.includes("everyone")) userroles = `<@&${role.id}>`
                        }else{
                            if (!role.name.includes("everyone")) userroles = userroles + `, <@&${role.id}>`
                        }
                    })
                    let perms;
                    if (user.permissions.hasPermission("ADMINISTRATOR") || user.permissions.hasPermission("MANAGE_ROLES")){
                        perms = "[!] Пользователь модератор [!]";
                    }else{
                        perms = "У пользователя нет админ прав."
                    }
                    if (userroles == undefined){
                        userroles = `отсутствуют.`
                    }
                    if (user.roles.some(r => ["✯Управляющие сервером.✯"].includes(r.name))){
                        info_user = "Управляющий администратор Yuma";
                    }else if (user.roles.some(r => ["Тех.поддержка сервера"].includes(r.name))){
                    info_user = "Технический администратор Yuma";
                    }else if (user.roles.some(r => ["✯ Следящие за хелперами ✯"].includes(r.name))){
                    info_user = "Воспитатель детского сада Yuma";
                    }else if (user.roles.some(r => ["Discord Master"].includes(r.name))){
                    info_user = "Системный модератор Yuma";
                    }else if (user.roles.some(r => ["Главная администрация серверов"].includes(r.name))){
                    info_user = "Гл.администратор других серверов";
                    }else if (user.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔"].includes(r.name))){
                    info_user = "Администратор сервера Yuma";
                    }else if (user.roles.some(r => ["✔ Helper ✔"].includes(r.name))){
                    info_user = "Хелпер сервера Yuma";
                    }else if (user.roles.some(r => ["Support Team"].includes(r.name))){
                    info_user = "Старший модератор Yuma";
                    }else if (user.roles.some(r => ["Spectator™"].includes(r.name))){
                    info_user = "Модератор Yuma";
                    }else if (user.roles.some(r => ["✮Ministers✮"].includes(r.name))){
                    info_user = "Министр Yuma";
                    }else if (user.roles.some(r => ["✵Leader✵"].includes(r.name))){
                    info_user = "Лидер Yuma";
                    }else if (user.roles.some(r => ["✫Deputy Leader✫"].includes(r.name))){
                    info_user = "Заместитель лидера Yuma";
                    }
                    let date = user.user.createdAt;
                    let registed = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                    date = user.joinedAt
                    let joindate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                    const embed = new Discord.RichEmbed()
                    .setAuthor(`© 2018 Risbot Company™`, `https://pp.userapi.com/c849132/v849132806/b35ca/2RD_7K2ysns.jpg?ava=1`, "https://vk.com/risbot")
                    .setColor("#FF0000")
                    .setFooter(`Аккаунт пользователя: ${user.displayName}`, user.user.avatarURL)
                    .setTimestamp()
                    .addField(`Краткая информация`, `**Аккаунт создан:** \`${registed}\`\n**Вошел к нам:** \`${joindate}\``)
                    .addField("Roles and Permissions", `**Роли:** ${userroles}\n**Статус пользователя:** \`${info_user}\``)
                    .addField(`Статус пользователя`, `\`${info_user}\``)
                    message.reply(`**вот информация по поводу аккаунта <@${user.id}>**`, embed)
                }
            }
            return message.delete();
        }
    }

    if (message.content.startsWith("-+ban")){
        lasttestid = message.author.id;
        setTimeout(() => {
            if (lasttestid == message.author.id){
                lasttestid = 'net';
            }
        }, 30000);
    }
});

bot.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return; // Если не будет добавление или удаление смайлика, то выход
    if (event.t == "MESSAGE_REACTION_ADD"){
        let event_guildid = event.d.guild_id // ID discord сервера
        let event_channelid = event.d.channel_id // ID канала
        let event_userid = event.d.user_id // ID того кто поставил смайлик
        let event_messageid = event.d.message_id // ID сообщение куда поставлен смайлик
        let event_emoji_name = event.d.emoji.name // Название смайлика

        if (event_userid == bot.user.id) return // Если поставил смайлик бот то выход
        if (event_guildid != serverid) return // Если сервер будет другой то выход

        let server = bot.guilds.find(g => g.id == event_guildid); // Получить сервер из его ID
        let channel = server.channels.find(c => c.id == event_channelid); // Получить канал на сервере по списку каналов
        let message = await channel.fetchMessage(event_messageid); // Получить сообщение из канала
        let member = server.members.find(m => m.id == event_userid); // Получить пользователя с сервера

        if (channel.name != `requests-for-roles`) return // Если название канала не будет 'requests-for-roles', то выйти

        if (event_emoji_name == "🇩"){
            if (!message.embeds[0]){
                channel.send(`\`[DELETED]\` ${member} \`удалил багнутый запрос.\``);
                return message.delete();
            }else if (message.embeds[0].title == "`Discord » Проверка на валидность ник нейма.`"){
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_nickname = message.embeds[0].fields[1].value.split(`\`Ник:\` `)[1];
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!field_user || !field_nickname || !field_role || !field_channel){
                    channel.send(`\`[DELETED]\` ${member} \`удалил багнутый запрос.\``);
                }else{
                    if (!member.hasPermission("ADMINISTRATOR")){
                        if (!member.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔", "Support Team", "Spectator™", "✮Ministers✮"].includes(r.name)) && !member.roles.some(r => r.name == field_role.name)){
                            return channel.send(`\`[ERROR]\` <@${member.id}> \`ошибка прав доступа. Вам нужно « ${field_role.name} » для удаления запроса.\``).then(msg => msg.delete(12000));
                        }
                    }
                    channel.send(`\`[DELETED]\` ${member} \`удалил запрос от ${field_nickname}, с ID: ${field_user.id}\``);
                }
                if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                return message.delete();
            }else if (message.embeds[0].title == '`Discord » Запрос о снятии роли.`'){
                let field_author = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[1].value.split(/ +/)[1]);
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!field_author || !field_user || !field_role || !field_channel){
                    channel.send(`\`[DELETED]\` ${member} \`удалил багнутый запрос на снятие роли.\``);
                }else{
                    if (!member.hasPermission("ADMINISTRATOR")){
                        if (!member.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔", "Support Team", "Spectator™", "✮Ministers✮"].includes(r.name)) && !member.roles.some(r => r.name == field_role.name)){
                            return channel.send(`\`[ERROR]\` <@${member.id}> \`ошибка прав доступа. Вам нужно « ${field_role.name} » для удаления запроса.\``).then(msg => msg.delete(12000));
                        }
                    }
                    channel.send(`\`[DELETED]\` ${member} \`удалил запрос на снятие роли от ${field_author.displayName}, с ID: ${field_author.id}\``);
                }
                if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                return message.delete();
            }
        }else if(event_emoji_name == "❌"){
            if (message.embeds[0].title == '`Discord » Проверка на валидность ник нейма.`'){
                if (message.reactions.size != 3){
                    return channel.send(`\`[ERROR]\` \`Не торопись! Сообщение еще загружается!\``)
                }
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_nickname = message.embeds[0].fields[1].value.split(`\`Ник:\` `)[1];
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!member.hasPermission("ADMINISTRATOR")){
                    if (!member.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔", "Support Team", "Spectator™", "✮Ministers✮"].includes(r.name)) && !member.roles.some(r => r.name == field_role.name)){
                        return channel.send(`\`[ERROR]\` <@${member.id}> \`ошибка прав доступа. Вам нужно « ${field_role.name} » для отказа выдачи роли.\``).then(msg => msg.delete(12000));
                    }
                }
                channel.send(`\`[DENY]\` <@${member.id}> \`отклонил запрос от ${field_nickname}, с ID: ${field_user.id}\``);
                field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`отклонил ваш запрос на выдачу роли.\nВаш ник при отправке: ${field_nickname}\``)
                nrpnames.add(field_nickname); // Добавить данный никнейм в список невалидных
                if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                return message.delete();
            }else if (message.embeds[0].title == '`Discord » Запрос о снятии роли.`'){
                if (message.reactions.size != 3){
                    return channel.send(`\`[ERROR]\` \`Не торопись! Сообщение еще загружается!\``)
                }
                let field_author = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[1].value.split(/ +/)[1]);
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!member.hasPermission("ADMINISTRATOR")){
                    if (!member.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔", "Support Team", "Spectator™", "✮Ministers✮"].includes(r.name)) && !member.roles.some(r => r.name == field_role.name)){
                        return channel.send(`\`[ERROR]\` <@${member.id}> \`ошибка прав доступа. Вам нужно « ${field_role.name} » для отказа снятия роли.\``).then(msg => msg.delete(12000));
                    }
                }
                if (!field_user.roles.some(r => r.id == field_role.id)){
                    if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                    return message.delete();
                }
                channel.send(`\`[DENY]\` <@${member.id}> \`отклонил запрос на снятие роли от\` <@${field_author.id}>\`, с ID: ${field_author.id}\``);
                field_channel.send(`<@${field_author.id}>**,** \`модератор\` <@${member.id}> \`отклонил ваш запрос на снятие роли пользователю:\` <@${field_user.id}>`)
                if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                return message.delete();
            }
        }else if (event_emoji_name == "✔"){
            if (message.embeds[0].title == '`Discord » Проверка на валидность ник нейма.`'){
                if (message.reactions.size != 3){
                    return channel.send(`\`[ERROR]\` \`Не торопись! Сообщение еще загружается!\``)
                }
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_nickname = message.embeds[0].fields[1].value.split(`\`Ник:\` `)[1];
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (field_user.roles.some(r => field_role.id == r.id)){
                    if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                    return message.delete(); // Если роль есть, то выход
                }
                if (!member.hasPermission("ADMINISTRATOR")){
                    if (!member.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔", "Support Team", "Spectator™", "✮Ministers✮"].includes(r.name)) && !member.roles.some(r => r.name == field_role.name)){
                        return channel.send(`\`[ERROR]\` <@${member.id}> \`ошибка прав доступа. Вам нужно « ${field_role.name} » для выдачи роли.\``).then(msg => msg.delete(12000));
                    }
                }
                let rolesremoved = false;
                let rolesremovedcount = 0;
		        if (field_user.roles != null){
                    if (field_user.roles.some(r=>rolesgg.includes(r.name))) {
                        for (var i in rolesgg){
                            let rolerem = server.roles.find(r => r.name == rolesgg[i]);
                            if (field_user.roles.some(role=>[rolesgg[i]].includes(role.name))){
                                rolesremoved = true;
                                rolesremovedcount = rolesremovedcount+1;
                                await field_user.removeRole(rolerem); // Забрать фракционные роли
                            }
                        }
                    }
                }
                await field_user.addRole(field_role); // Выдать роль по соответствию с тэгом
                channel.send(`\`[ACCEPT]\` <@${member.id}> \`одобрил запрос от ${field_nickname}, с ID: ${field_user.id}\``);
                if (rolesremoved){
                    if (rolesremovedcount == 1){
                        field_channel.send(`<@${field_user.id}>**,** \`модератор ${member.displayName} одобрил ваш запрос на выдачу роли.\`\n\`Роль ${field_role.name} была выдана! ${rolesremovedcount} роль другой фракции была убрана.\``)
                    }else if (rolesremovedcount < 5){
                        field_channel.send(`<@${field_user.id}>**,** \`модератор ${member.displayName} одобрил ваш запрос на выдачу роли.\`\n\`Роль ${field_role.name} была выдана! Остальные ${rolesremovedcount} роли других фракций были убраны.\``)
                    }else{
                        field_channel.send(`<@${field_user.id}>**,** \`модератор ${member.displayName} одобрил ваш запрос на выдачу роли.\`\n\`Роль ${field_role.name} была выдана! Остальные ${rolesremovedcount} ролей других фракций были убраны.\``)
                    }
                }else{
                    field_channel.send(`<@${field_user.id}>**,** \`модератор ${member.displayName} одобрил ваш запрос на выдачу роли.\`\n\`Роль ${field_role.name}  была выдана!\``)
                }
                if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                return message.delete();
            }else if (message.embeds[0].title == '`Discord » Запрос о снятии роли.`'){
                if (message.reactions.size != 3){
                    return channel.send(`\`[ERROR]\` \`Не торопись! Сообщение еще загружается!\``)
                }
                let field_author = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[1].value.split(/ +/)[1]);
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!member.hasPermission("ADMINISTRATOR")){
                    if (!member.roles.some(r => ["✔ Administrator ✔", "✔Jr.Administrator✔", "Support Team", "Spectator™", "✮Ministers✮"].includes(r.name)) && !member.roles.some(r => r.name == field_role.name)){
                        return channel.send(`\`[ERROR]\` <@${member.id}> \`ошибка прав доступа. Вам нужно « ${field_role.name} » для снятия роли.\``).then(msg => msg.delete(12000));
                    }
                }
                if (!field_user.roles.some(r => r.id == field_role.id)){
                    if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                    return message.delete();
                }
                field_user.removeRole(field_role);
                channel.send(`\`[ACCEPT]\` <@${member.id}> \`одобрил снятие роли (${field_role.name}) от\` <@${field_author.id}>, \`пользователю\` <@${field_user.id}>, \`с ID: ${field_user.id}\``);
                field_channel.send(`**<@${field_user.id}>, с вас сняли роль** ${field_role.name} **по запросу от <@${field_author.id}>.**`)
                if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                return message.delete()
            }
        }
    }
});

bot.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (newMember.guild.id != "528635749206196232") return // Сервер не 03!
    if (oldMember.roles.size == newMember.roles.size) return // Сменил ник или еще чет!
    if (newMember.user.bot) return // Бот не принимается!
    if (oldMember.roles.size < newMember.roles.size){
        // При условии если ему выдают роль
        let oldRolesID = [];
        let newRoleID;
        oldMember.roles.forEach(role => oldRolesID.push(role.id));
        newMember.roles.forEach(role => {
            if (!oldRolesID.some(elemet => elemet == role.id)) newRoleID = role.id;
        })
        let role = newMember.guild.roles.get(newRoleID);
        if (role.name == "🏆 Победитель 🏆" || role.name == "🎤 Народный артист 🎤" || role.name == "🎶 Музыкант 🎶" || role.name == "🎮 Геймер 🎮" || role.name == "Muted"){
            const entry = await newMember.guild.fetchAuditLogs({type: 'MEMBER_ROLE_UPDATE', before: new Date()}).then(audit => audit.entries.first());
            let member = await newMember.guild.members.get(entry.executor.id);
            if(member.id == "159985870458322944" || member.id == "155149108183695360") return; // Игнор ботов-модераторов
            let server = bot.guilds.find(g => g.id == 528635749206196232);
            let channel_warn = server.channels.find(c => c.name == "warning-system");
            if (!channel_warn) return;
            channel_warn.send(`<@&528637204055064587>\n**Привет, модераторы! Держите отчет о подозрительном действии модератора!\nМодератор <@${member.id}> выдал роль <@&${role.id}> пользователю <@${newMember.id}> **`);
            return;
        }
        if (role.name == "✫ State Access ✫" || role.name == "✔Jr.Administrator✔" || role.name == "✔ Administrator ✔" || role.name == "⋆ Stream Team 🎥 ⋆" || role.name == "✵Хранитель✵")
        {
            const entry = await newMember.guild.fetchAuditLogs({type: 'MEMBER_ROLE_UPDATE'}).then(audit => audit.entries.first());
            let member = await newMember.guild.members.get(entry.executor.id);
            if (!member.hasPermission("ADMINISTRATOR")) {
            if (antislivsp1.has(member.id)){
                    if (antislivsp2.has(member.id)){
                        member.removeRoles(member.roles);
                        newMember.removeRole(role);
                        newMember.guild.channels.find(c => c.name == "spectator-chat").send(`\`[ANTISLIV SYSTEM]\` <@${member.id}> \`подозревался в попытке слива. [3/3] Я снял с него роли. Пострадал:\` <@${newMember.id}>, \`выдали роль\` <@&${role.id}>`);
                        newMember.guild.channels.find(c => c.name == "general").send(`\`[SECURITY SYSTEM]\` <@${member.id}> \`лишен прав модератора по системе безопасности. Код ошибки: GIVE_PROTECTED_ROLE\`\n\`Обратитесь к системному модератору:\`<@408740341135704065>`);
                        return;
                    }else{
                        newMember.guild.channels.find(c => c.name == "spectator-chat").send(`\`[WARNING]\` <@${member.id}> \`подозревается в попытке слива!!! [2/3] Выдача роли\` <@&${role.id}> \`пользователю\` <@${newMember.id}>`);
                newMember.guild.channels.find(c => c.name == "general").send(`\`[SECURITY SYSTEM]\` <@${member.id}> \`вы не можете совершить данное действие. Код ошибки: GIVE_PROTECTED_ROLE\`\n\`Обратитесь к системному модератору:\`<@408740341135704065>`);
                newMember.removeRole(role);
                return antislivsp2.add(member.id);
                    }
                }
                newMember.guild.channels.find(c => c.name == "spectator-chat").send(`\`[WARNING]\` <@${member.id}> \`подозревается в попытке слива!!! [1/3] Выдача роли\` <@&${role.id}> \`пользователю\` <@${newMember.id}>`);
            newMember.guild.channels.find(c => c.name == "general").send(`\`[SECURITY SYSTEM]\` <@${member.id}> \`вы не можете совершить данное действие. Код ошибки: GIVE_PROTECTED_ROLE\`\n\`Обратитесь к системному модератору:\`<@408740341135704065>`);
            newMember.removeRole(role);
            return antislivsp1.add(member.id);
            }
        }
        if (role.name != "Spectator™" && role.name != "Support Team") return
        const entry = await newMember.guild.fetchAuditLogs({type: 'MEMBER_ROLE_UPDATE'}).then(audit => audit.entries.first());
        let member = await newMember.guild.members.get(entry.executor.id);
        if (member.user.bot) return // Бот не принимается!
        if (!member.hasPermission("ADMINISTRATOR")){
            if (antislivsp1.has(member.id)){
                if (antislivsp2.has(member.id)){
                    member.removeRoles(member.roles);
		    newMember.guild.channels.find(c => c.name == "general").send(`\`[SECURITY SYSTEM]\` <@${member.id}> \`лишен прав модератора по системе безопасности. Код ошибки: GIVE_MODERATOR_ROLE\`\n\`Обратитесь к системному модератору:\`<@408740341135704065>`);
		    newMember.removeRole(role);
                    return newMember.guild.channels.find(c => c.name == "spectator-chat").send(`\`[ANTISLIV SYSTEM]\` <@${member.id}> \`подозревался в попытке слива. [3/3] Я снял с него роли. Пострадал:\` <@${newMember.id}>, \`выдали роль\` <@&${role.id}>`);
                }else{
		    newMember.guild.channels.find(c => c.name == "general").send(`\`[SECURITY SYSTEM]\` <@${member.id}> \`вы не можете совершить данное действие. Код ошибки: GIVE_MODERATOR_ROLE\`\n\`Обратитесь к системному модератору:\`<@408740341135704065>`);
                    newMember.guild.channels.find(c => c.name == "spectator-chat").send(`\`[WARNING]\` <@${member.id}> \`подозревается в попытке слива!!! [2/3] Выдача роли\` <@&${role.id}> \`пользователю\` <@${newMember.id}>`)
                    newMember.removeRole(role);
		    return antislivsp2.add(member.id);
                }
            }
            newMember.guild.channels.find(c => c.name == "spectator-chat").send(`\`[WARNING]\` <@${member.id}> \`подозревается в попытке слива!!! [1/3] Выдача роли\` <@&${role.id}> \`пользователю\` <@${newMember.id}>`)
            newMember.guild.channels.find(c => c.name == "general").send(`\`[SECURITY SYSTEM]\` <@${member.id}> \`вы не можете совершить данное действие. Код ошибки: GIVE_MODERATOR_ROLE\`\n\`Обратитесь к системному модератору:\`<@408740341135704065>`);
	    newMember.removeRole(role);
	    return antislivsp1.add(member.id);
        }
        let spec_chat = await newMember.guild.channels.find(c => c.name == "spectator-chat");
        let question = await spec_chat.send(`<@${member.id}>, \`вы выдали роль\` <@&${role.id}> \`пользователю\` <@${newMember.id}>\n\`Укажите причину выдачи роли в новом сообщении!\``);
        spec_chat.awaitMessages(response => response.member.id == member.id, {
            max: 1,
            time: 120000,
            errors: ['time'],
        }).then(async (answer) => {
            question.delete().catch(() => {});
            spec_chat.send(`\`[MODERATOR_ADD]\` \`${member.displayName} выдал роль\` <@&${role.id}> \`пользователю\` <@${newMember.id}>. \`Причина: ${answer.first().content}\``);
            answer.first().delete().catch(() => {});
        }).catch(async () => {
            question.delete().catch(() => {});
            spec_chat.send(`\`[MODERATOR_ADD]\` \`${member.displayName} выдал роль\` <@&${role.id}> \`пользователю\` <@${newMember.id}>. \`Причина: не указана.\``);
        })
    }else{
        // При условии если ему снимают роль
        let newRolesID = [];
        let oldRoleID;
        newMember.roles.forEach(role => newRolesID.push(role.id));
        oldMember.roles.forEach(role => {
            if (!newRolesID.some(elemet => elemet == role.id)) oldRoleID = role.id;
        })
        let role = newMember.guild.roles.get(oldRoleID);
	if (role.name == "🏆 Победитель 🏆" || role.name == "🎤 Народный артист 🎤" || role.name == "🎶 Музыкант 🎶" || role.name == "🎮 Геймер 🎮" || role.name == "Muted"){
		const entry = await newMember.guild.fetchAuditLogs({type: 'MEMBER_ROLE_UPDATE'}).then(audit => audit.entries.first());
		let member = await newMember.guild.members.get(entry.executor.id);
		if(member.id == "159985870458322944" || member.id == "155149108183695360") return; // Игнор ботов-модераторов
		let server = bot.guilds.find(g => g.id == 528635749206196232);
		let channel_warn = server.channels.find(c => c.name == "warning-system");
		if (!channel_warn) return;
		channel_warn.send(`<@&528637204055064587>\n**Привет, модераторы! Держите отчет о подозрительном действии модератора!\nМодератор <@${member.id}> снял роль <@&${role.id}> пользователю <@${newMember.id}> **`);
		return;
	}
        if (role.name != "Spectator™" && role.name != "Support Team") return
        const entry = await newMember.guild.fetchAuditLogs({type: 'MEMBER_ROLE_UPDATE'}).then(audit => audit.entries.first())
        let member = await newMember.guild.members.get(entry.executor.id);
        if (member.user.bot) return // Бот не принимается!
        if (!member.hasPermission("ADMINISTRATOR")){
            if (antislivsp1.has(member.id)){
                if (antislivsp2.has(member.id)){
                    member.removeRoles(member.roles);
                    return newMember.guild.channels.find(c => c.name == "spectator-chat").send(`\`[ANTISLIV SYSTEM]\` <@${member.id}> \`подозревался в попытке слива. [3/3] Я снял с него роли. Пострадал:\` <@${newMember.id}>, \`сняли роль\` <@&${role.id}>`);
                }else{
                    newMember.guild.channels.find(c => c.name == "spectator-chat").send(`\`[WARNING]\` <@${member.id}> \`подозревается в попытке слива!!! [2/3] Снятие роли\` <@&${role.id}> \`пользователю\` <@${newMember.id}>`)
                    return antislivsp2.add(member.id);
                }
            }
            newMember.guild.channels.find(c => c.name == "spectator-chat").send(`\`[WARNING]\` <@${member.id}> \`подозревается в попытке слива!!! [1/3] Снятие роли\` <@&${role.id}> \`пользователю\` <@${newMember.id}>`)
            return antislivsp1.add(member.id);
        }
        let spec_chat = await newMember.guild.channels.find(c => c.name == "spectator-chat");
        let question = await spec_chat.send(`<@${member.id}>, \`вы сняли роль\` <@&${role.id}> \`модератору\` <@${newMember.id}>\n\`Укажите причину снятия роли в новом сообщении!\``);
        spec_chat.awaitMessages(response => response.member.id == member.id, {
            max: 1,
            time: 120000,
            errors: ['time'],
        }).then(async (answer) => {
            question.delete().catch(() => {});
            spec_chat.send(`\`[MODERATOR_DEL]\` \`${member.displayName} снял роль\` <@&${role.id}> \`модератору\` <@${newMember.id}>. \`Причина: ${answer.first().content}\``);
            answer.first().delete().catch(() => {});
        }).catch(async () => {
            question.delete().catch(() => {});
            spec_chat.send(`\`[MODERATOR_DEL]\` \`${member.displayName} снял роль\` <@&${role.id}> \`модератора\` <@${newMember.id}>. \`Причина: не указана.\``);
        })
    }
})

bot.on('guildBanAdd', async (guild, user) => {
    if (guild.id != serverid) return
    setTimeout(async () => {
        const entry = await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD', before: new Date()}).then(audit => audit.entries.first());
        let member = await guild.members.get(entry.executor.id);
        if (member.user.bot && lasttestid != 'net'){
            member = await guild.members.get(lasttestid);
            lasttestid = 'net';
        }
        let reason = await entry.reason;
        if (!reason) reason = 'Причина не указана';
        if (reason == 'by RisBot [DDOS]'){
            guild.channels.find(c => c.name == "general").send(`**${user} был заблокирован за дудос.**`).then(msg => msg.delete(12000));
            return
        }
        const embed_ban = new Discord.RichEmbed()
	    .setAuthor(`© 2018 Risbot Company™`, `https://pp.userapi.com/c849132/v849132806/b35ca/2RD_7K2ysns.jpg?ava=1`, "https://vk.com/risbot")
        .setThumbnail(user.avatarURL)
        .setColor("#FF0000")
        .addField(`**Информация о блокировке**`, `**Заблокирован: ${user}**\n**Заблокировал: ${member}**\n**Причина: \`${reason}\`**`)
        .setFooter(`Команда по безопасности Discord сервера.`, guild.iconURL)
        guild.channels.find(c => c.name == "general").send(embed_ban).catch(() => {
            guild.channels.find(c => c.name == "general").send(`**${user} был заблокирован.**`)
        })
    }, 2000);
})

bot.on('voiceStateUpdate', async (oldMember, newMember) => {
    if (oldMember.voiceChannelID == newMember.voiceChannelID) return
    if (newMember.hasPermission("ADMINISTRATOR")) return
    let member_oldchannel = newMember.guild.channels.get(oldMember.voiceChannelID);
    let member_newchannel = newMember.guild.channels.get(newMember.voiceChannelID);
    if (member_newchannel){
        if (member_newchannel.name == '→ Обзвон ←'){
            let edit_channel = newMember.guild.channels.find(c => c.name == "closed-accept");
            if (!edit_channel) return console.log('[ERROR] Не возможно найти текстовой канал конференции.');
            await edit_channel.overwritePermissions(newMember, {
                // GENERAL PERMISSIONS
                CREATE_INSTANT_INVITE: false,
                MANAGE_CHANNELS: false,
                MANAGE_ROLES: false,
                MANAGE_WEBHOOKS: false,
                // TEXT PERMISSIONS
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                SEND_TTS_MESSAGES: false,
                MANAGE_MESSAGES: false,
                EMBED_LINKS: true,
                ATTACH_FILES: true,
                READ_MESSAGE_HISTORY: false,
                MENTION_EVERYONE: false,
                USE_EXTERNAL_EMOJIS: false,
                ADD_REACTIONS: false,
            }, 'подключение (конференция)');
            edit_channel.send(`**<@${newMember.id}> \`успешно подключился.\`**`).then(msg => msg.delete(30000));
        }
	    if (member_newchannel.name == 'Проводится обзвон [SP]'){
            let edit_channel = newMember.guild.channels.find(c => c.name == "обзвон-сп");
            if (!edit_channel) return console.log('[ERROR] Не возможно найти текстовой канал обзвона СП.');
            await edit_channel.overwritePermissions(newMember, {
                // GENERAL PERMISSIONS
                CREATE_INSTANT_INVITE: false,
                MANAGE_CHANNELS: false,
                MANAGE_ROLES: false,
                MANAGE_WEBHOOKS: false,
                // TEXT PERMISSIONS
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                SEND_TTS_MESSAGES: false,
                MANAGE_MESSAGES: false,
                EMBED_LINKS: true,
                ATTACH_FILES: true,
                READ_MESSAGE_HISTORY: false,
                MENTION_EVERYONE: false,
                USE_EXTERNAL_EMOJIS: false,
                ADD_REACTIONS: false,
            }, 'подключение (обзвон СП)');
            edit_channel.send(`**<@${newMember.id}> \`успешно подключился.\`**`).then(msg => msg.delete(30000));
        }
    }
    if (member_oldchannel){
        if (member_oldchannel.name == '→ Обзвон ←'){
        let edit_channel = newMember.guild.channels.find(c => c.name == "closed-accept");
            if (!edit_channel) return console.log('[ERROR] Не возможно найти текстовой канал конференции.');
            edit_channel.permissionOverwrites.forEach(async (perm) => {
                if (perm.type != 'member') return
                if (perm.id != newMember.id) return
                await perm.delete('отключение (конференция)');
            });
            edit_channel.send(`**<@${newMember.id}> \`отключился.\`**`).then(msg => msg.delete(15000));
        }
    }
	if (member_oldchannel){
        if (member_oldchannel.name == 'Проводится обзвон [SP]'){
        let edit_channel = newMember.guild.channels.find(c => c.name == "обзвон-сп");
            if (!edit_channel) return console.log('[ERROR] Не возможно найти текстовой канал конференции.');
            edit_channel.permissionOverwrites.forEach(async (perm) => {
                if (perm.type != 'member') return
                if (perm.id != newMember.id) return
                await perm.delete('отключение (обзвон СП)');
            });
            edit_channel.send(`**<@${newMember.id}> \`отключился.\`**`).then(msg => msg.delete(15000));
        }
    }
})

bot.on('message', async (message) => {
    if (message.channel.type == 'dm') return
    if (message.author.bot) return
    let moscow_date = new Date((new Date().valueOf()) + 10800000);
    const args = message.content.split(' ');
    if (args[0] == '/gov'){
        if (!message.member.roles.some(r => ['✵Leader✵', '✫Deputy Leader✫'].includes(r.name)) && !message.member.hasPermission("ADMINISTRATOR")){
            message.reply(`**\`ошибка прав доступа.\`**`).then(msg => msg.delete(12000));
            return message.delete();
        }
        if (!args[1] || !args[2] || !args[3]){
            message.reply(`**\`использование: /gov [часы] [минуты] [фракция]\`**`);
            return message.delete();
        }
        args[2] = `${args[1]}:${args[2]}:00`;
        args[1] = `${moscow_date.getFullYear()}-${(moscow_date.getMonth() + 1).toString().padStart(2, '0')}-${moscow_date.getDate().toString().padStart(2, '0')}`;
        let date_yymmdd = args[1].split('-');
        let date_hhmmss = args[2].split(':');
        if (date_yymmdd.length != 3 || date_hhmmss.length != 3){
            message.reply(`**\`использование: /gov [часы] [минуты] [фракция]\`**`);
            return message.delete();
        }
        let date = new Date(date_yymmdd[0], date_yymmdd[1] - 1, date_yymmdd[2], date_hhmmss[0], date_hhmmss[1], date_hhmmss[2]);
        if (date.toString() == 'Invalid Date' || date.valueOf() < new Date((moscow_date) + 10800000).valueOf()){
            message.reply(`**\`использование: /gov [часы] [минуты] [фракция]\nПримечание: Дата указана не верно. ('Написано в прошлом времени')\`**`);
            return message.delete();
        }
        let formate_date = `${date.getFullYear()}-` + 
        `${(date.getMonth() + 1).toString().padStart(2, '0')}-` +
        `${date.getDate().toString().padStart(2, '0')} ` + 
        `${date.getHours().toString().padStart(2, '0')}:` + 
        `${date.getMinutes().toString().padStart(2, '0')}:` + 
        `${date.getSeconds().toString().padStart(2, '0')}`;
        let newDate = [formate_date.split(' ')[0].split('-')[0], formate_date.split(' ')[0].split('-')[1], formate_date.split(' ')[0].split('-')[2], formate_date.split(' ')[1].split(':')[0],formate_date.split(' ')[1].split(':')[1],formate_date.split(' ')[1].split(':')[2]];
        if (newDate[4] != 00 && newDate[4] != 15 && newDate[4] != 30 && newDate[4] != 45){
            message.reply(`**\`использование: /gov [часы] [минуты] [фракция]\nПримечание: Занимать собеседование можно в '00', '15', '30', '45'.\`**`);
            return message.delete();
        }
        if (!manytags.some(tag => tag == args.slice(3).join(' ').toUpperCase())){
            message.reply(`**\`использование: /gov [часы] [минуты] [фракция]\nПримечание: Организация '${args.slice(3).join(' ')}' не найдена.\`**`);
            return message.delete();
        }
        if (!message.member.roles.some(r => r.name == tags[args.slice(3).join(' ').toUpperCase()]) && !message.member.hasPermission("ADMINISTRATOR")){
            message.reply(`**\`ошибка! У вас нет прав доступа для изменения '${tags[args.slice(3).join(' ').toUpperCase()]}'\`**`);
            return message.delete();
        }
        let channel = message.guild.channels.find(c => c.name == 'gov-info');
        if (!channel) return message.reply(`**\`Канал 'gov-info' не был найден! Попросите системных модераторов создать текстовой канал.\`**`);
        channel.fetchMessages({limit: 100}).then(async messages => {
            if (messages.size <= 0){
                let fractions = ['\`⋆ Government ⋆\` ',
                '\`⋆ Central Bank of Los-Santos ⋆\` ',
                '\`⋆ Driving School ⋆\` ',
                '\`⋆ Los-Santos Police Department ⋆\` ',
                '\`⋆ San-Fierro Police Department ⋆\` ',
                '\`⋆ Special Weapons Assault Team ⋆\` ',
                '\`⋆ Red County Sheriff Department ⋆\` ',
                '\`⋆ Los-Santos Army ⋆\` ',
                '\`⋆ San-Fierro Army ⋆\` ',
                '\`⋆ Maximum Security Prison ⋆\` ',
                '\`⋆ Los-Santos Medical Center ⋆\` ',
                '\`⋆ San-Fierro Medical Center ⋆\` ',
                '\`⋆ Las-Venturas Medical Center ⋆\` ',
                '\`⋆ Radiocentre Los-Santos ⋆\` ',
                '\`⋆ Radiocentre San-Fierro ⋆\` ',
                '\`⋆ Radiocentre Las-Venturas ⋆\` '];
                let date = ['\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`'];
                let modify = ['**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                `**\`Создана фракционная таблица организаций. Источник: Система\`**`];
                await fractions.forEach(async (string, i) => {
                    if (string.includes(tags[args.slice(3).join(' ').toUpperCase()])){
                        if (!date.some(v => v.includes(formate_date))){
                            let date_modify = new Date((moscow_date) + 10800000);
                            date[i] = '\` » ' + formate_date + '\`';
                            modify[0] = modify[1];
                            modify[1] = modify[2];
                            modify[2] = modify[3];
                            modify[3] = modify[4];
                            modify[4] = modify[5];
                            modify[5] = modify[6];
                            modify[6] = modify[7];
                            modify[7] = modify[8];
                            modify[8] = modify[9];
                            modify[9] = `**\`[${date_modify.getHours().toString().padStart(2, '0')}:${date_modify.getMinutes().toString().padStart(2, '0')}:${date_modify.getSeconds().toString().padStart(2, '0')}]\` ${message.member} \`назначил собеседование в ${args.slice(3).join(' ').toUpperCase()} на ${newDate[3]}:${newDate[4]}\`**`;
                            message.reply(`**\`вы успешно назначили собеседование в организацию '${tags[args.slice(3).join(' ').toUpperCase()]}' на ${formate_date}. Нажмите на\` <#${channel.id}> \`для просмотра.\`**`);
                            message.delete();
                        }else{
                            message.reply(`**\`собеседование на данное время уже занято! Нажмите на\` <#${channel.id}> \`для просмотра.\`**`);
                            message.delete();
                        }
                    }
                });
                const embed = new Discord.RichEmbed();
                embed.setTitle('**Arizona Role Play » Собеседования**');
                embed.setColor('#FF0000');
                embed.setTimestamp(new Date());
                embed.setFooter('Support Team » Central DataBase', message.guild.iconURL);
                embed.addField('Организация', fractions.join('\n'), true);
                embed.addField('Дата', date.join('\n'), true);
                embed.addField('Последние изменения', modify.join('\n'), false);
                channel.send(embed);
                return message.delete();
            }else if (messages.size == 1){
                messages.forEach(async msg => {
                    if (!msg.embeds) return
                    if (!msg.embeds[0].title) return
                    if (msg.embeds[0].title != '**Arizona Role Play » Собеседования**') return
                    let fractions = msg.embeds[0].fields[0].value.split('\n');
                    let date = msg.embeds[0].fields[1].value.split('\n');
                    let modify = msg.embeds[0].fields[2].value.split('\n');
                    await fractions.forEach(async (string, i) => {
                        if (string.includes(tags[args.slice(3).join(' ').toUpperCase()])){
                            if (!date.some(v => v.includes(formate_date))){
                                let date_modify = new Date((moscow_date) + 10800000);
                                date[i] = '\` » ' + formate_date + '\`';
                                modify[0] = modify[1];
                                modify[1] = modify[2];
                                modify[2] = modify[3];
                                modify[3] = modify[4];
                                modify[4] = modify[5];
                                modify[5] = modify[6];
                                modify[6] = modify[7];
                                modify[7] = modify[8];
                                modify[8] = modify[9];
                                modify[9] = `**\`[${date_modify.getHours().toString().padStart(2, '0')}:${date_modify.getMinutes().toString().padStart(2, '0')}:${date_modify.getSeconds().toString().padStart(2, '0')}]\` ${message.member} \`назначил собеседование в ${args.slice(3).join(' ').toUpperCase()} на ${newDate[3]}:${newDate[4]}\`**`;
                                message.reply(`**\`вы успешно назначили собеседование в организацию '${tags[args.slice(3).join(' ').toUpperCase()]}' на ${formate_date}. Нажмите на\` <#${channel.id}> \`для просмотра.\`**`);
                                message.delete();
                            }else{
                                message.reply(`**\`собеседование на данное время уже занято! Нажмите на\` <#${channel.id}> \`для просмотра.\`**`);
                                message.delete();
                            }
                        }
                    });
                    const embed = new Discord.RichEmbed();
                    embed.setTitle('**Arizona Role Play » Собеседования**');
                    embed.setColor('#FF0000');
                    embed.setTimestamp(new Date());
                    embed.setFooter('Support Team » Central DataBase', message.guild.iconURL);
                    embed.addField(msg.embeds[0].fields[0].name, fractions.join('\n'), msg.embeds[0].fields[0].inline);
                    embed.addField(msg.embeds[0].fields[1].name, date.join('\n'), msg.embeds[0].fields[1].inline);
                    embed.addField(msg.embeds[0].fields[2].name, modify.join('\n'), msg.embeds[0].fields[2].inline);
                    msg.edit(embed);
                });
            }else{
                message.reply(`**\`ошибка! В канале сообщений больше чем одно.\`**`);
                return message.delete();
            }
        });
    }
    if (args[0] == '/cancelgov'){
        if (!message.member.roles.some(r => ['✵Leader✵', '✫Deputy Leader✫'].includes(r.name)) && !message.member.hasPermission("ADMINISTRATOR")){
            message.reply(`**\`ошибка прав доступа.\`**`).then(msg => msg.delete(12000));
            return message.delete();
        }
        if (!args[1]){
            message.reply(`**\`использование: /cancelgov [фракция]\`**`);
            return message.delete();
        }
        if (!manytags.some(tag => tag == args.slice(1).join(' ').toUpperCase())){
            message.reply(`**\`использование: /cancelgov [фракция]\nПримечание: Организация '${args.slice(3).join(' ')}' не найдена.\`**`);
            return message.delete();
        }
        if (!message.member.roles.some(r => r.name == tags[args.slice(1).join(' ').toUpperCase()]) && !message.member.hasPermission("ADMINISTRATOR")){
            message.reply(`**\`ошибка! У вас нет прав доступа для изменения '${tags[args.slice(1).join(' ').toUpperCase()]}'\`**`);
            return message.delete();
        }
        let channel = message.guild.channels.find(c => c.name == 'gov-info');
        if (!channel) return message.reply(`**\`Канал 'gov-info' не был найден! Попросите системных модераторов создать текстовой канал.\`**`);
        channel.fetchMessages({limit: 100}).then(async messages => {
            if (messages.size <= 0){
                let fractions = ['\`⋆ Government ⋆\` ',
                '\`⋆ Central Bank of Los-Santos ⋆\` ',
                '\`⋆ Driving School ⋆\` ',
                '\`⋆ Los-Santos Police Department ⋆\` ',
                '\`⋆ San-Fierro Police Department ⋆\` ',
                '\`⋆ Special Weapons Assault Team ⋆\` ',
                '\`⋆ Red County Sheriff Department ⋆\` ',
                '\`⋆ Los-Santos Army ⋆\` ',
                '\`⋆ San-Fierro Army ⋆\` ',
                '\`⋆ Maximum Security Prison ⋆\` ',
                '\`⋆ Los-Santos Medical Center ⋆\` ',
                '\`⋆ San-Fierro Medical Center ⋆\` ',
                '\`⋆ Las-Venturas Medical Center ⋆\` ',
                '\`⋆ Radiocentre Los-Santos ⋆\` ',
                '\`⋆ Radiocentre San-Fierro ⋆\` ',
                '\`⋆ Radiocentre Las-Venturas ⋆\` '];
                let date = ['\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`',
                '\` » Не назначено\`'];
                let modify = ['**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                '**Изменения не найдены! Возможно их еще не было!**',
                `**\`Создана фракционная таблица организаций. Источник: Система\`**`];
                const embed = new Discord.RichEmbed();
                embed.setTitle('**Arizona Role Play » Собеседования**');
                embed.setColor('#FF0000');
                embed.setTimestamp(new Date());
                embed.setFooter('Support Team » Central DataBase', message.guild.iconURL);
                embed.addField('Организация', fractions.join('\n'), true);
                embed.addField('Дата', date.join('\n'), true);
                embed.addField('Последние изменения', modify.join('\n'), false);
                channel.send(embed);
                message.reply(`**\`создана таблица по собеседованиям. Для просмотра нажмите на\` <#${channel.id}>**`);
                return message.delete();
            }else if (messages.size == 1){
                messages.forEach(async msg => {
                    if (!msg.embeds) return
                    if (!msg.embeds[0].title) return
                    if (msg.embeds[0].title != '**Arizona Role Play » Собеседования**') return
                    let fractions = msg.embeds[0].fields[0].value.split('\n');
                    let date = msg.embeds[0].fields[1].value.split('\n');
                    let modify = msg.embeds[0].fields[2].value.split('\n');
                    await fractions.forEach(async (string, i) => {
                        if (string.includes(tags[args.slice(1).join(' ').toUpperCase()])){
                            if (!date[i].includes('Не назначено')){
                                let date_modify = new Date((moscow_date) + 10800000);
                                date[i] = '\` » ' + 'Не назначено' + '\`';
                                modify[0] = modify[1];
                                modify[1] = modify[2];
                                modify[2] = modify[3];
                                modify[3] = modify[4];
                                modify[4] = modify[5];
                                modify[5] = modify[6];
                                modify[6] = modify[7];
                                modify[7] = modify[8];
                                modify[8] = modify[9];
                                modify[9] = `**\`[${date_modify.getHours().toString().padStart(2, '0')}:${date_modify.getMinutes().toString().padStart(2, '0')}:${date_modify.getSeconds().toString().padStart(2, '0')}]\` ${message.member} \`отменил собеседование в ${args.slice(1).join(' ').toUpperCase()}\`**`;
                                message.reply(`**\`вы успешно отменили собеседование в организацию '${tags[args.slice(1).join(' ').toUpperCase()]}'. Нажмите на\` <#${channel.id}> \`для просмотра.\`**`);
                                message.delete();
                            }else{
                                message.reply(`**\`собеседование в данную фракцию не назначено, зачем его отменять?! Нажмите на\` <#${channel.id}> \`для просмотра.\`**`);
                                message.delete();
                            }
                        }
                    });
                    const embed = new Discord.RichEmbed();
                    embed.setTitle('**Arizona Role Play » Собеседования**');
                    embed.setColor('#FF0000');
                    embed.setTimestamp(new Date());
                    embed.setFooter('Support Team » Central DataBase', message.guild.iconURL);
                    embed.addField(msg.embeds[0].fields[0].name, fractions.join('\n'), msg.embeds[0].fields[0].inline);
                    embed.addField(msg.embeds[0].fields[1].name, date.join('\n'), msg.embeds[0].fields[1].inline);
                    embed.addField(msg.embeds[0].fields[2].name, modify.join('\n'), msg.embeds[0].fields[2].inline);
                    msg.edit(embed);
                });
            }else{
                message.reply(`**\`ошибка! В канале сообщений больше чем одно.\`**`);
                return message.delete();
            }
        });
    }
});

bot.on('roleCreate', async (role) => {
  const entry = await role.guild.fetchAuditLogs({type: 'ROLE_CREATE', before: new Date()}).then(audit => audit.entries.first());
  let member = await role.guild.members.get(entry.executor.id);
  if (!member) return console.error(`Пользователь уже не на сервере.`);
  if (member.id == bot.user.id) return;
  let chatmod = role.guild.channels.find(c => c.name == "spectator-chat");
  let channel = role.guild.channels.find(c => c.name == "general");
  if (!member.hasPermission("ADMINISTRATOR")) {
    if (!antislivsp1.has(member.id)) {
      antislivsp1.add(member.id);
      chatmod.send(`**Модератор <@${member.id}> без права на администратора создал роль, роль была удалена. Повторное действие приведёт к снятию всех ролей.**`)
      role.delete("роль создана модератором без права на администратора");
    } else {
      member.removeRoles(member.roles, "создание роли без права на администратора ИЛИ второе предупреждение антислива");
      chatmod.send(`**Модератор <@${member.id}> создал роль, роль была удалена. С мродератора сняты все оли по системе безопасности.**`)
      role.delete("роль создана модератором без права на администратора");
      channel.send(`\`Модератор\` <@${member.id}> \`лишен прав модератора по системе безопасности. Код: RC\`\n\`Обратитесь к системному администратору:\`<@408740341135704065>`);
    }
  }

}); 

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function unwarnsystem() {
    setInterval(async() => {
        let re = /(\d+(\.\d)*)/i;
        let gserver = bot.guilds.find(g => g.id == "528635749206196232");
        let dataserver = bot.guilds.find(g => g.id == "531533132982124544");
        dataserver.channels.forEach(async sacc => {
            if (sacc.type == "text"){
                if (!['chat', 'config', 'bot-updates'].includes(sacc.name)){
                    await sacc.fetchMessages({limit: 1}).then(async messages => {
                        if (messages.size == 1){
                            messages.forEach(async sacc => {
                                let str = sacc.content;
                                let moderation_level = str.split('\n')[0].match(re)[0];
                                let moderation_warns = str.split('\n')[1].match(re)[0];
                                let user_warns = str.split('\n')[+moderation_warns + 2].match(re)[0];
                                let moderation_reason = [];
                                let user_reason = [];
                                let moderation_time = [];
                                let user_time = [];
                                let moderation_give = [];
                                let user_give = [];
            
                                let circle = 0;
                                while (+moderation_warns > circle){
                                    moderation_reason.push(str.split('\n')[+circle + 2].split('==>')[0]);
                                    moderation_time.push(str.split('\n')[+circle + 2].split('==>')[1]);
                                    moderation_give.push(str.split('\n')[+circle + 2].split('==>')[2]);
                                    circle++;
                                }
                
                                circle = 0;
                                let rem = 0;
                                while (+user_warns > circle){
                                    let myDate = new Date().valueOf();
                                    if (+str.split('\n')[+circle + +moderation_warns + 3].split('==>')[1] > myDate){
                                        user_reason.push(str.split('\n')[+circle + +moderation_warns + 3].split('==>')[0]);
                                        user_time.push(str.split('\n')[+circle + +moderation_warns + 3].split('==>')[1]);
                                        user_give.push(str.split('\n')[+circle + +moderation_warns + 3].split('==>')[2]);
                                    }else{
                                        rem++
                                        let genchannel = gserver.channels.find(c => c.name == "general");
                                        genchannel.send(`<@${channel.name}>, \`вам было снято одно предупреждение. [Прошло 7 дней]\``);
                                    }
                                    circle++;
                                }
                                user_warns = +user_warns - +rem;
                                let text_end = `Уровень модератора: ${moderation_level}\n` + 
                                `Предупреждения модератора: ${moderation_warns}`;
                                for (var i = 0; i < moderation_reason.length; i++){
                                    text_end = text_end + `\n${moderation_reason[i]}==>${moderation_time[i]}==>${moderation_give[i]}`;
                                }
                                text_end = text_end + `\nПредупреждений: ${+user_warns}`;
                                for (var i = 0; i < user_reason.length; i++){
                                    text_end = text_end + `\n${user_reason[i]}==>${user_time[i]}==>${user_give[i]}`;
                                }
                                if (+moderation_level == 0 && +moderation_warns == 0 && +user_warns == 0){
                                    channel.delete();
                                }else{
                                    sacc.edit(text_end);
                                }
                            });
                        }
                    });
                }
            }
        });

    }, 25000)
}

async function ticket_delete(){
    setInterval(async () => {
        let re = /(\d+(\.\d)*)/i;
        let gserver = bot.guilds.get('528635749206196232');
        let spchat = gserver.channels.find(c => c.name == 'spectator-chat');
        gserver.channels.forEach(async channel => {
            if (channel.name.startsWith('ticket-')){
                if (gserver.channels.find(c => c.id == channel.parentID).name == 'Корзина'){
                    let log_channel = gserver.channels.find(c => c.name == "reports-log");
                    channel.fetchMessages({limit: 1}).then(async messages => {
                        if (messages.size == 1){
                            messages.forEach(async msg => {
                                let s_now = new Date().valueOf() - 86400000;
                                if (msg.createdAt.valueOf() < s_now){
                                    let archive_messages = [];
                                    await channel.fetchMessages({limit: 100}).then(async messagestwo => {
                                        messagestwo.forEach(async msgcopy => {
                                            let date = new Date(+msgcopy.createdAt.valueOf() + 10800000);
                                            let formate_date = `[${date.getFullYear()}-` + 
                                            `${(date.getMonth() + 1).toString().padStart(2, '0')}-` +
                                            `${date.getDate().toString().padStart(2, '0')} ` + 
                                            `${date.getHours().toString().padStart(2, '0')}-` + 
                                            `${date.getMinutes().toString().padStart(2, '0')}-` + 
                                            `${date.getSeconds().toString().padStart(2, '0')}]`;
                                            if (!msgcopy.embeds[0]){
                                                archive_messages.push(`${formate_date} ${msgcopy.member.displayName}: ${msgcopy.content}`);
                                            }else{
                                                archive_messages.push(`[К СООБЩЕНИЮ БЫЛО ДОБАВЛЕНО] ${msgcopy.embeds[0].fields[1].value}`);
                                                archive_messages.push(`[К СООБЩЕНИЮ БЫЛО ДОБАВЛЕНО] ${msgcopy.embeds[0].fields[0].value}`);
                                                archive_messages.push(`${formate_date} ${msgcopy.member.displayName}: ${msgcopy.content}`);
                                            }
                                        });
                                    });
                                    let i = archive_messages.length - 1;
                                    while (i>=0){
                                        await fs.appendFileSync(`./${channel.name}.txt`, `${archive_messages[i]}\n`);
                                        i--
                                    }
                                    await log_channel.send(`\`[SYSTEM]\` \`Канал ${channel.name} был удален. [24 часа в статусе 'Закрыт']\``, { files: [ `./${channel.name}.txt` ] });
                                    channel.delete();
                                    fs.unlinkSync(`./${channel.name}.txt`);
                                }
                            });
                        }
                    });
                }else if(gserver.channels.find(c => c.id == channel.parentID).name == 'Активные жалобы'){
                    let log_channel = gserver.channels.find(c => c.name == "spectator-chat");
                    channel.fetchMessages({limit: 1}).then(messages => {
                        if (messages.size == 1){
                            messages.forEach(msg => {
                                let s_now = new Date().valueOf() - 18000000;
                                if (msg.createdAt.valueOf() < s_now){
                                    log_channel.send(`\`[SYSTEM]\` \`Жалоба\` <#${channel.id}> \`уже более 5-ти часов ожидает проверки!\``);
                                    channel.send(`\`[SYSTEM]\` \`Привет! Я напомнил модераторам про твое обращение!\``)
                                }
                            });
                        }
                    });
                }
            }
        });
    },18000000);
}

async function check_updates(r_msg){
    setTimeout(async () => {
        let channel = bot.guilds.get('531533132982124544').channels.find(c => c.name == 'bot-updates');
        if (!channel) return console.error(`Канал обновлений не найден!`);
        channel.fetchMessages({limit: 1}).then(async messages => {
            let msg = messages.first();
            if (msg.content != version){
                let server = bot.guilds.get('528635749206196232');
                let sp_channel = server.channels.find(c => c.name == 'spectator-chat');
                if (!server) return console.error('ошибка загрузки обновления, сервер не найден');
                if (!sp_channel) return console.error('ошибка загрузки обновления, sp-chat не найден');
                await sp_channel.send(`**Обновление. Версия: \`${version}\`.**\n**Содержание: ${update_information}**`);
                await channel.send(version);
                await r_msg.edit(r_msg.content.replace('[Проверка наличия обновлений...]', `[Обновление завершено. (v.${msg.content}) (v.${version})]`));
            }else{
                r_msg.edit(r_msg.content.replace('[Проверка наличия обновлений...]', `[Версии совпадают. (v.${msg.content}) (v.${version})]`));
            }
        });
    }, 10000);
};

bot.on('roleDelete', async (role) => {
    if (role.guild.id != serverid) return
    const entry = await role.guild.fetchAuditLogs({type: 'ROLE_DELETE', before: new Date()}).then(audit => audit.entries.first());
    let member = await role.guild.members.get(entry.executor.id);
    if (!member) return console.error(`Пользователь уже не на сервере.`);
    if (member.id == bot.user.id) return;
    let chatmod = role.guild.channels.find(c => c.name == "spectator-chat");
    let channel = role.guild.channels.find(c => c.name == "general");
    if (!chatmod || !channel) return
    if (!member.hasPermission("ADMINISTRATOR")){
        await member.removeRoles(member.roles, "удаление роли без права на администратора");
        await chatmod.send(`**Модератор <@${member.id}> удалил роль. С модератора сняты все роли по системе безопасности.**`).then(msg => msg.pin());
        await channel.send(`\`Модератор\` <@${member.id}> \`лишен прав модератора по системе безопасности. Код: RD\`\n\`Обратитесь к системному администратору:\` <@408740341135704065>`);
    }
});