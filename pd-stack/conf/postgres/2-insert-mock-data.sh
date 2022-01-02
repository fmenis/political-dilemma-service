#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO users (first_name, last_name, user_name, email, password)
    VALUES ('Dennis', 'Boanini', 'Il Boa', 'dennis@acme.com', '\$2b\$10\$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a');  

    INSERT INTO users (first_name, last_name, user_name, email, password)
    VALUES ('Filippo', 'Menis', 'Pippo', 'filippo@acme.com', '\$2b\$10\$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a');

    INSERT INTO users (first_name, last_name, user_name, email, password)
    VALUES ('Gaetano', 'Danelli', 'MaiSenzaPigiama', 'gaetano@acme.com', '\$2b\$10\$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a');


    INSERT INTO regions (name) VALUES ('Marche');
    INSERT INTO regions (name) VALUES ('Abruzzo');
    INSERT INTO regions (name) VALUES ('Basilicata');
    INSERT INTO regions (name) VALUES ('Molise');
    INSERT INTO regions (name) VALUES ('Trentino Alto Adige');
    INSERT INTO regions (name) VALUES ('Puglia');
    INSERT INTO regions (name) VALUES ('Calabria');
    INSERT INTO regions (name) VALUES ('Campania');
    INSERT INTO regions (name) VALUES ('Lazio');
    INSERT INTO regions (name) VALUES ('Sardegna');
    INSERT INTO regions (name) VALUES ('Sicilia');
    INSERT INTO regions (name) VALUES ('Toscana');
    INSERT INTO regions (name) VALUES ('Piemonte');
    INSERT INTO regions (name) VALUES ('Emilia Romagna');
    INSERT INTO regions (name) VALUES ('Friuli Venezia Giulia');
    INSERT INTO regions (name) VALUES ('Valle d''Aosta');
    INSERT INTO regions (name) VALUES ('Veneto');
    INSERT INTO regions (name) VALUES ('Liguria');
    INSERT INTO regions (name) VALUES ('Lombardia');
    INSERT INTO regions (name) VALUES ('Umbria');

    INSERT INTO provinces (name, code, id_region) VALUES ('Agrigento', 'AG', 11);
    INSERT INTO provinces (name, code, id_region) VALUES ('Alessandria', 'AL', 13);
    INSERT INTO provinces (name, code, id_region) VALUES ('Ancona', 'AN', 1);
    INSERT INTO provinces (name, code, id_region) VALUES ('Aosta', 'AO', 16);
    INSERT INTO provinces (name, code, id_region) VALUES ('L''Aquila', 'AQ', 2);
    INSERT INTO provinces (name, code, id_region) VALUES ('Arezzo', 'AR', 12);
    INSERT INTO provinces (name, code, id_region) VALUES ('Ascoli Piceno', 'AP', 1);
    INSERT INTO provinces (name, code, id_region) VALUES ('Asti', 'AT', 13);
    INSERT INTO provinces (name, code, id_region) VALUES ('Avellino', 'AV', 8);
    INSERT INTO provinces (name, code, id_region) VALUES ('Bari', 'BA', 6);
    INSERT INTO provinces (name, code, id_region) VALUES ('Barletta-Andria-Trani', 'BT', 6);
    INSERT INTO provinces (name, code, id_region) VALUES ('Belluno', 'BL', 17);
    INSERT INTO provinces (name, code, id_region) VALUES ('Benevento', 'BN', 8);
    INSERT INTO provinces (name, code, id_region) VALUES ('Bergamo', 'BG', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Biella', 'BI', 13);
    INSERT INTO provinces (name, code, id_region) VALUES ('Bologna', 'BO', 14);
    INSERT INTO provinces (name, code, id_region) VALUES ('Bolzano', 'BZ', 5);
    INSERT INTO provinces (name, code, id_region) VALUES ('Brescia', 'BS', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Brindisi', 'BR', 6);
    INSERT INTO provinces (name, code, id_region) VALUES ('Cagliari', 'CA', 10);
    INSERT INTO provinces (name, code, id_region) VALUES ('Caltanissetta', 'CL', 11);
    INSERT INTO provinces (name, code, id_region) VALUES ('Campobasso', 'CB', 4);
    INSERT INTO provinces (name, code, id_region) VALUES ('Carbonia-Iglesias', 'CI', 10);
    INSERT INTO provinces (name, code, id_region) VALUES ('Caserta', 'CE', 8);
    INSERT INTO provinces (name, code, id_region) VALUES ('Catania', 'CT', 11);
    INSERT INTO provinces (name, code, id_region) VALUES ('Catanzaro', 'CZ', 7);
    INSERT INTO provinces (name, code, id_region) VALUES ('Chieti', 'CH', 2);
    INSERT INTO provinces (name, code, id_region) VALUES ('Como', 'CO', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Cosenza', 'CS', 7);
    INSERT INTO provinces (name, code, id_region) VALUES ('Cremona', 'CR', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Crotone', 'KR', 7);
    INSERT INTO provinces (name, code, id_region) VALUES ('Cuneo', 'CN', 13);
    INSERT INTO provinces (name, code, id_region) VALUES ('Enna', 'EN', 11);
    INSERT INTO provinces (name, code, id_region) VALUES ('Fermo', 'FM', 1);
    INSERT INTO provinces (name, code, id_region) VALUES ('Ferrara', 'FE', 14);
    INSERT INTO provinces (name, code, id_region) VALUES ('Firenze', 'FI', 12);
    INSERT INTO provinces (name, code, id_region) VALUES ('Foggia', 'FG', 6);
    INSERT INTO provinces (name, code, id_region) VALUES ('Forlì-Cesena', 'FC', 14);
    INSERT INTO provinces (name, code, id_region) VALUES ('Frosinone', 'FR', 9);
    INSERT INTO provinces (name, code, id_region) VALUES ('Genova', 'GE', 18);
    INSERT INTO provinces (name, code, id_region) VALUES ('Gorizia', 'GO', 15);
    INSERT INTO provinces (name, code, id_region) VALUES ('Grosseto', 'GR', 12);
    INSERT INTO provinces (name, code, id_region) VALUES ('Imperia', 'IM', 18);
    INSERT INTO provinces (name, code, id_region) VALUES ('Isernia', 'IS', 4);
    INSERT INTO provinces (name, code, id_region) VALUES ('La Spezia', 'SP', 18);
    INSERT INTO provinces (name, code, id_region) VALUES ('Latina', 'LT', 9);
    INSERT INTO provinces (name, code, id_region) VALUES ('Lecce', 'LE', 6);
    INSERT INTO provinces (name, code, id_region) VALUES ('Lecco', 'LC', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Livorno', 'LI', 12);
    INSERT INTO provinces (name, code, id_region) VALUES ('Lodi', 'LO', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Lucca', 'LU', 12);
    INSERT INTO provinces (name, code, id_region) VALUES ('Macerata', 'MC', 1);
    INSERT INTO provinces (name, code, id_region) VALUES ('Mantova', 'MN', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Massa-Carrara', 'MS', 12);
    INSERT INTO provinces (name, code, id_region) VALUES ('Matera', 'MT', 3);
    INSERT INTO provinces (name, code, id_region) VALUES ('Medio Campidano', 'VS', 10);
    INSERT INTO provinces (name, code, id_region) VALUES ('Messina', 'ME', 11);
    INSERT INTO provinces (name, code, id_region) VALUES ('Milano', 'MI', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Modena', 'MO', 14);
    INSERT INTO provinces (name, code, id_region) VALUES ('Monza-Brianza', 'MB', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Napoli', 'NA', 8);
    INSERT INTO provinces (name, code, id_region) VALUES ('Novara', 'NO', 13);
    INSERT INTO provinces (name, code, id_region) VALUES ('Nuoro', 'NU', 10);
    INSERT INTO provinces (name, code, id_region) VALUES ('Ogliastra', 'OG', 10);
    INSERT INTO provinces (name, code, id_region) VALUES ('Olbia Tempio', 'OT', 10);
    INSERT INTO provinces (name, code, id_region) VALUES ('Oristano', 'OR', 10);
    INSERT INTO provinces (name, code, id_region) VALUES ('Padova', 'PD', 17);
    INSERT INTO provinces (name, code, id_region) VALUES ('Palermo', 'PA', 11);
    INSERT INTO provinces (name, code, id_region) VALUES ('Parma', 'PR', 14);
    INSERT INTO provinces (name, code, id_region) VALUES ('Pavia', 'PV', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Perugia', 'PG', 20);
    INSERT INTO provinces (name, code, id_region) VALUES ('Pesaro-Urbino', 'PU', 1);
    INSERT INTO provinces (name, code, id_region) VALUES ('Pescara', 'PE', 2);
    INSERT INTO provinces (name, code, id_region) VALUES ('Piacenza', 'PC', 14);
    INSERT INTO provinces (name, code, id_region) VALUES ('Pisa', 'PI', 12);
    INSERT INTO provinces (name, code, id_region) VALUES ('Pistoia', 'PT', 12);
    INSERT INTO provinces (name, code, id_region) VALUES ('Pordenone', 'PN', 15);
    INSERT INTO provinces (name, code, id_region) VALUES ('Potenza', 'PZ', 3);
    INSERT INTO provinces (name, code, id_region) VALUES ('Prato', 'PO', 12);
    INSERT INTO provinces (name, code, id_region) VALUES ('Ragusa', 'RG', 11);
    INSERT INTO provinces (name, code, id_region) VALUES ('Ravenna', 'RA', 14);
    INSERT INTO provinces (name, code, id_region) VALUES ('Reggio-Calabria', 'RC', 7);
    INSERT INTO provinces (name, code, id_region) VALUES ('Reggio-Emilia', 'RE', 14);
    INSERT INTO provinces (name, code, id_region) VALUES ('Rieti', 'RI', 9);
    INSERT INTO provinces (name, code, id_region) VALUES ('Rimini', 'RN', 14);
    INSERT INTO provinces (name, code, id_region) VALUES ('Roma', 'RM', 9);
    INSERT INTO provinces (name, code, id_region) VALUES ('Rovigo', 'RO', 17);
    INSERT INTO provinces (name, code, id_region) VALUES ('Salerno', 'SA', 8);
    INSERT INTO provinces (name, code, id_region) VALUES ('Sassari', 'SS', 10);
    INSERT INTO provinces (name, code, id_region) VALUES ('Savona', 'SV', 18);
    INSERT INTO provinces (name, code, id_region) VALUES ('Siena', 'SI', 12);
    INSERT INTO provinces (name, code, id_region) VALUES ('Siracusa', 'SR', 11);
    INSERT INTO provinces (name, code, id_region) VALUES ('Sondrio', 'SO', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Taranto', 'TA', 6);
    INSERT INTO provinces (name, code, id_region) VALUES ('Teramo', 'TE', 2);
    INSERT INTO provinces (name, code, id_region) VALUES ('Terni', 'TR', 20);
    INSERT INTO provinces (name, code, id_region) VALUES ('Torino', 'TO', 13);
    INSERT INTO provinces (name, code, id_region) VALUES ('Trapani', 'TP', 11);
    INSERT INTO provinces (name, code, id_region) VALUES ('Trento', 'TN', 5);
    INSERT INTO provinces (name, code, id_region) VALUES ('Treviso', 'TV', 17);
    INSERT INTO provinces (name, code, id_region) VALUES ('Trieste', 'TS', 15);
    INSERT INTO provinces (name, code, id_region) VALUES ('Udine', 'UD', 15);
    INSERT INTO provinces (name, code, id_region) VALUES ('Varese', 'VA', 19);
    INSERT INTO provinces (name, code, id_region) VALUES ('Venezia', 'VE', 17);
    INSERT INTO provinces (name, code, id_region) VALUES ('Verbania', 'VB', 13);
    INSERT INTO provinces (name, code, id_region) VALUES ('Vercelli', 'VC', 13);
    INSERT INTO provinces (name, code, id_region) VALUES ('Verona', 'VR', 17);
    INSERT INTO provinces (name, code, id_region) VALUES ('Vibo-Valentia', 'VV', 7);
    INSERT INTO provinces (name, code, id_region) VALUES ('Vicenza', 'VI', 17);
    INSERT INTO provinces (name, code, id_region) VALUES ('Viterbo', 'VT', 9);

EOSQL