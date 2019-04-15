const Discord = require('discord.js');
const fs = require("fs");

exports.get = (name) => {
    if (name == 'tags'){
        tags = ({
            "ПРА-ВО": "⋆ Government ⋆",
            "ГЦЛ": "⋆ Driving School ⋆",
            "АШ": "⋆ Driving School ⋆",
            "ЦБ": "⋆ Central Bank of Los-Santos ⋆",
        
            "FBI": "⋆ Federal Bureau of Investigation ⋆",
            "ФБР": "⋆ Federal Bureau of Investigation ⋆",
            "LSPD": "⋆ Los-Santos Police Department ⋆",
            "ЛСПД": "⋆ Los-Santos Police Department ⋆",
            "SFPD": "⋆ San-Fierro Police Department ⋆",
            "СФПД": "⋆ San-Fierro Police Department ⋆",
            "LVPD": "⋆ Special Weapons Assault Team ⋆",
            "ЛВПД": "⋆ Special Weapons Assault Team⋆",
            "SWAT": "⋆ Special Weapons Assault Team ⋆",
            "СВАТ": "⋆ Special Weapons Assault Team ⋆",
            "RCPD": "⋆ Red County Sheriff Department ⋆",
            "РКПД": "⋆ Red County Sheriff Department ⋆",
            "RCSD": "⋆ Red County Sheriff Department ⋆",
            "РКШД": "⋆ Red County Sheriff Department ⋆",
        
            "LSA": "⋆ Los-Santos Army ⋆",
            "ЛСА": "⋆ Los-Santos Army ⋆",
            "SFA": "⋆ San-Fierro Army ⋆",
            "СФА": "⋆ San-Fierro Army ⋆",
            "LS-A": "⋆ Los-Santos Army ⋆",
            "ЛС-А": "⋆ Los-Santos Army ⋆",
            "SF-A": "⋆ San-Fierro Army ⋆",
            "СФ-А": "⋆ San-Fierro Army ⋆",
            "ТСР": "⋆ Maximum Security Prison ⋆",
            "ТЮРЬМА": "⋆ Maximum Security Prison ⋆",
        
            "LSMC": "⋆ Los-Santos Medical Center ⋆",
            "ЛСМЦ": "⋆ Los-Santos Medical Center ⋆",
            "SFMC": "⋆ San-Fierro Medical Center ⋆",
            "СФМЦ": "⋆ San-Fierro Medical Center ⋆",
            "LVMC": "⋆ Las-Venturas Medical Center ⋆",
            "ЛВМЦ": "⋆ Las-Venturas Medical Center ⋆",
        
            "YBC": "⋆ YBC Network ⋆",
            "CNN SF": "⋆ CNN San-Fierro ⋆",
            "СМИ СФ": "⋆ CNN San-Fierro ⋆",
            "CNN LV": "⋆ CNN Las-Venturas ⋆",
            "СМИ ЛВ": "⋆ CNN Las-Venturas ⋆",
        
            "WMC": "⋆ Warlock MC ⋆",
            "W-MC": "⋆ Warlock MC ⋆",
            "RM": "⋆ Russian Mafia ⋆",
            "РМ": "⋆ Russian Mafia ⋆",
            "LCN": "⋆ La Cosa Nostra ⋆",
            "ЛКН": "⋆ La Cosa Nostra ⋆",
            "YAKUZA": "⋆ Yakuza ⋆",
            "ЯКУДЗА": "⋆ Yakuza ⋆",
        
            "GROVE": "⋆ Grove Street Gang ⋆",
            "ГРУВ": "⋆ Grove Street Gang ⋆",
            "BALLAS": "⋆ East Side Ballas Gang ⋆",
            "БАЛЛАС": "⋆ East Side Ballas Gang ⋆",
            "VAGOS": "⋆ Vagos Gang ⋆",
            "ВАГОС": "⋆ Vagos Gang ⋆",
            "NW": "⋆ Night Wolfs ⋆",
            "НВ": "⋆ Night Wolfs ⋆",
            "RIFA": "⋆ Rifa Gang ⋆",
            "РИФА": "⋆ Rifa Gang ⋆",
            "AZTEC": "⋆ Aztecas Gang ⋆",  
            "АЦТЕК": "⋆ Aztecas Gang ⋆",  
        });
        return tags;
    }else if (name == 'manytags'){
        let manytags = [
            "ПРА-ВО",
            "ГЦЛ",
            "АШ",
            "ЦБ",

            "FBI",
            "ФБР",
            "LSPD",
            "ЛСПД",
            "SFPD",
            "СФПД",
            "LVPD",
            "ЛВПД",
            "SWAT",
            "СВАТ",
            "RCPD",
            "РКПД",
            "RCSD",
            "РКШД",

            "LSA",
            "ЛСА",
            "SFA",
            "СФА",
            "LS-A",
            "ЛС-А",
            "SF-A",
            "СФ-А",
            "ТСР",
            "ТЮРЬМА",

            "LSMC",
            "ЛСМЦ",
            "SFMC",
            "СФМЦ",
            "LVMC",
            "ЛВМЦ",

            "YBC",
            "CNN SF",
            "СМИ СФ",
            "CNN LV",
            "СМИ ЛВ",

            "WMC",
            "W-MC",
            "RM",
            "РМ",
            "LCN",
            "ЛКН",
            "YAKUZA",
            "ЯКУДЗА",

            "GROVE",
            "ГРУВ",
            "BALLAS",
            "БАЛЛАС",
            "VAGOS",
            "ВАГОС",
            "AZTEC",  
            "АЦТЕК",
            "RIFA",
            "РИФА",
            "NW",
            "НВ",
        ];
        return manytags;
    }else if (name == 'rolesgg'){
        let rolesgg = ["⋆ Government ⋆", "⋆ Central Bank of Los-Santos ⋆", "⋆ Driving School ⋆", "⋆ Federal Bureau of Investigation ⋆", "⋆ Special Weapons Assault Team ⋆", "⋆ Los-Santos Police Department ⋆", "⋆ San-Fierro Police Department ⋆", "⋆ Red County Sheriff Department ⋆", "⋆ Los-Santos Army ⋆", "⋆ San-Fierro Army ⋆", "⋆ Maximum Security Prison ⋆", "⋆ Los-Santos Medical Center ⋆", "⋆ San-Fierro Medical Center ⋆", "⋆ Las-Venturas Medical Center ⋆", "⋆ YBC Network ⋆", "⋆ CNN San-Fierro ⋆", "⋆ CNN Las-Venturas ⋆", "⋆ Warlock MC ⋆", "⋆ Russian Mafia ⋆", "⋆ La Cosa Nostra ⋆", "⋆ Yakuza ⋆", "⋆ Grove Street Gang ⋆", "⋆ East Side Ballas Gang ⋆", "⋆ Vagos Gang ⋆", "⋆ Aztecas Gang ⋆", "⋆ Rifa Gang ⋆", "⋆ Night Wolfs ⋆"]
        return rolesgg;
    }else if (name == 'canremoverole'){
        let canremoverole = ["✫Deputy Leader✫", "✵Leader✵", "✮Ministers✮", "✔ Helper ✔"];
        return canremoverole;
    }else{
        return null;
    }
}
