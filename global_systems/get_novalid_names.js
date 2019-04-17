const Discord = require('discord.js');
const fs = require("fs");

exports.run = async (bot, message, tags, rolesgg, canremoverole, manytags) => {
    if (message.content == '/start_check_users'){
        if (!message.member.hasPermission("MANAGE_ROLES")){
            message.reply(`\`ошибка прав доступа\``).then(msg => msg.delete(7000));
            return message.delete();
        }
        let no_valid_members = [];
        await message.guild.members.forEach(member => {
            member.roles.forEach(role => {
                if (rolesgg.includes(role.name)){
                    let valid_roles_accept_has = [];
                    let dsname = member.displayName || member.user.tag;
                    for (var i in manytags){
                        if (dsname.toLowerCase().includes("[" + manytags[i].toLowerCase()) || dsname.toLowerCase().includes(manytags[i].toLowerCase() + "]") || dsname.toLowerCase().includes("(" + manytags[i].toLowerCase()) || dsname.toLowerCase().includes(manytags[i].toLowerCase() + ")") || dsname.toLowerCase().includes("{" + manytags[i].toLowerCase()) || dsname.toLowerCase().includes(manytags[i].toLowerCase() + "}")){
                            let rolename = tags[manytags[i].toUpperCase()];
                            let m_role = message.guild.roles.find(r => r.name == rolename);
                            valid_roles_accept_has.push(m_role);
                        }
                    }
                    if (!valid_roles_accept_has.includes(role.name) && !no_valid_members.some(mem => mem == member.id)){
                        no_valid_members.push(member.id);
                    }
                }
            });
        });
        setTimeout(async () => {
            let vrem = [];
            no_valid_members.forEach(async id => {
                vrem.push('<@' + id + '>');
                if (vrem.length >= 20){
                    await message.channel.send(`Невалидные юзеры:\n${vrem.join('\n')}`);
                    vrem = [];
                }        
            });
            if (vrem.length >= 20){
                await message.channel.send(`Невалидные юзеры:\n${vrem.join('\n')}`);
            }
        }, 3000);
    }
};