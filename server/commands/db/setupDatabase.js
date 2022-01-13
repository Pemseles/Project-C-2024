﻿require("dotenv").config();

const args = process.argv.slice(2);
const fs = require("fs");
const { promises: fs2 } = require("fs")
const path = require("path");
const DB = new (require("../../src/db/DB"))();
const Storage = new (require("../../src/Storage"))();
const testUri =
  "data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7";

const dbPath = path.normalize(process.cwd() + "\\kyndaDatabase.sqlite3");

if (args[0].toLowerCase() === "testdb.sql" && fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    fs.rmSync(Storage.storagePathAbsolute, { recursive: true, force: true });
    console.log("Succesfully deleted database");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

const sqlData = fs
  .readFileSync(path.join(__dirname, args[0]), { flag: "r" })
  .toString()
  .trim()
  .split(";");

console.log("Succesfully created database.");
console.log("Copying test data.");
(async () => {
    await copyDir("./storage testdata", "./storage");
})();
console.log("Test data copied.");

  //await Storage.addCompany(1, true);
  //await Storage.addCompany(2, true);
  //await Storage.addCompany(3, true);
  //Storage.addImage("test.gif", 1, testUri);

// DB CONNECTION START
const conn = DB.startConnection();

for (let i = 0; i < sqlData.length; i++) {
  const query = sqlData[i];

  if (query.length !== 0) {
    conn.createQuery(query, []);
  }
}

async function copyDir(src, dest) {
    await fs2.mkdir(dest, { recursive: true });
    let entries = await fs2.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory() ?
            await copyDir(srcPath, destPath) :
            await fs2.copyFile(srcPath, destPath);
    }
}

(async () => {
  console.log("Running queries...");

  // Deze method gebruiken we om meerdere statements achter elkaar te doen die zijn toegevoegd door de createQuery method.
  // Deze method gebruik je vaak om meerdere insert statements te maken bv voor test data.
  // LET OP: Hier kan je nog geen select statements mee runnen (technisch gezien wel maar er is nog geen manier
  // geimplementeerd om de resultaten te bekijken)
  // Gebruik de runStatement method om de resultaten te bekijken

  conn.runStatements();
  // Example
  // Uncomment de code eronder en run "npm run db-test" voor een test.

  //Deze method gebruiken we om een enkele statement te runnen.
  // conn.runStatement("INSERT INTO role (Name) VALUES (?)", ["Admin"]);

  // conn.runStatement("SELECT * FROM role", []).then(data => console.log(data));

  // Hierin kan je functies maken die testdata aanmaken.
  // Het is de bedoeling dat je alle statements in dit bestand toevoeg net als erboven.

  await conn.runStatement(
    `INSERT INTO role (Name) VALUES ('Admin'), ('Moderator'), ('Employee')`
  );

    await conn.runStatement(
        `INSERT INTO user
        (Email, Password, Role_Id, Name, Company_Id) VALUES
        ('admin@gmail.com', 'Admin1!', 1, 'Amadeus Mozart', -1),
        ('moderator1@gmail.com', 'Moderator1!', 2, 'Liesje Lompkop', 1),
        ('moderator2@gmail.com', 'Moderator1!', 2, 'Pieter Plasinjebroek', 2),
        ('moderator3@gmail.com', 'Moderator1!', 2, 'Karen Kartoffeln', 3),
        ('user1@gmail.com', 'User1!', 3, 'Pollination Technician 1', 1),
        ('user2@gmail.com', 'User1!', 3, 'Helma Hobbeltrut', 2),
        ('user3@gmail.com', 'User1!', 3, 'Qwerty Azerty', 3),
        ('user4@gmail.com', 'User1!', 3, 'Helena Hoopstrooi', 1),
        ('user5@gmail.com', 'User1!', 3, 'Barend Ballebak', 2),
        ('user6@gmail.com', 'User1!', 3, 'Liza Lepelaar', 3),
        ('user7@gmail.com', 'User1!', 3, 'Peter Petroleum', 1),
        ('user8@gmail.com', 'User1!', 3, 'Agnes Crumplebottom', 2),
        ('user9@gmail.com', 'User1!', 3, 'Bella Goth', 3),
        ('user10@gmail.com', 'User1!', 3, 'Mortimer Goth', 1),
        ('user11@gmail.com', 'User1!', 3, 'Katrina Caliente', 2),
        ('user12@gmail.com', 'User1!', 3, 'Sarah Suikerspin', 3),
        ('user13@gmail.com', 'User1!', 3, 'Eva Appelboom', 1),
        ('user14@gmail.com', 'User1!', 3, 'Jelte Jeukkruis', 2),
        ('user16@gmail.com', 'User1!', 3, 'Samira Skelterbaan', 1),
        ('user18@gmail.com', 'User1!', 3, 'Patricia Penicilline', 3),
        ('user19@gmail.com', 'User1!', 3, 'Cory Cannabis', 1),
        ('user20@gmail.com', 'User1!', 3, 'Karel Keutelbos', 2),
        ('user22@gmail.com', 'User1!', 3, 'Sam Spoorloos', 1),
        ('user23@gmail.com', 'User1!', 3, 'Helma Hulpeloos', 2),
        ('user25@gmail.com', 'User1!', 3, 'Pepijn Papierkreukel', 1),
        ('user26@gmail.com', 'User1!', 3, 'Jolanda Jeminee', 2),
        ('user27@gmail.com', 'User1!', 3, 'Kees Smetvrees', 3)`
    );

  await conn.runStatement(
    `INSERT INTO company (Name, Phonenumber, Email, Country, City, Postcode, Streetname, Housenumber) VALUES
        ('Google', '0123456789', 'google@gmail.com', 'everywhere', 'yours', 'allofthem', 'inyourhouse', '∞'),
        ('Meta(Facebook)', '98765432310', 'notfacebook@gmail.com', 'Verenigde Staten', 'Menlo Park', 'CA94025', 'Hacker Way', '1'),
        ('Hogeschool Rotterdam', '+31107944000', 'hr@gmail.com', 'Nederland', 'Rotterdam', '3011WN', 'Wijnhaven', '107')`
  );

  await conn.runStatement(
    `INSERT INTO template (Filepath, Company_id, Name) VALUES
        ('\\storage\\1\\templates\\template1_com1.html', '1', 'template1_com1'),
        ('\\storage\\1\\templates\\template2_com1.html', '1', 'template2_com1'),
        ('\\storage\\1\\templates\\template3_com1.html', '1', 'template3_com1'),
        ('\\storage\\2\\templates\\template1_com2.html', '2', 'template1_com2'),
        ('\\storage\\3\\templates\\template1_com3.html', '3', 'template1_com3'),
        ('\\storage\\3\\templates\\template2_com3.html', '3', 'template2_com3'),
        ('\\storage\\3\\templates\\template3_com3.html', '3', 'template3_com3'),
        ('\\storage\\3\\templates\\template4_com3.html', '3', 'template4_com3')`
  );

    //mm-dd-jjjj
  await conn.runStatement(
    `INSERT INTO design (Filepath, Created_at, Updated_at, Downloads, Verified, Template_id, Name) VALUES
        ('\\storage\\1\\designs\\1\\design1_template1_0.html', '6-11-2021', '0-0-0000', '', FALSE, 1, 'design1_template1'),
        ('\\storage\\1\\designs\\1\\design2_template1_0.html', '1-10-2021', '6-11-2021', '10', TRUE, 1, 'design2_template1'),
        ('\\storage\\1\\designs\\2\\design1_template2_0.html', '10-11-2020', '4-5-2021', '', FALSE, 2, 'design1_template2'),
        ('\\storage\\2\\designs\\4\\design1_template4_0.html', '18-2-2021', '0-0-0000', '', FALSE, 4, 'design1_template4'),
        ('\\storage\\2\\designs\\4\\design2_template4_0.html', '1-3-2021', '3-3-2021', '99999999999', TRUE, 4, 'design2_template4'),
        ('\\storage\\3\\designs\\7\\design1_template7_0.html', '4-4-2021', '0-0-0000', '-1', TRUE, 7, 'design1_template7'),
        ('\\storage\\3\\designs\\7design2_template7_0.html', '8-7-2021', '0-0-0000', '', FALSE, 7, 'design2_template7'),
        ('\\storage\\3\\designs\\7\\design3_template7_0.html', '7-8-2021', '8-7-2021', '69', TRUE, 7, 'design3_template7'),
        ('\\storage\\3\\designs\\7\\design4_template7_0.html', '4-24-1900', '0-0-0000', '', FALSE, 7, 'design4_template7'),
        ('\\storage\\3\\designs\\7\\design5_template7_0.html', '6-11-2021', '5-2-2019', '50', FALSE, 7, 'design5_template7'),
        ('\\storage\\3\\designs\\7\\design6_template7_0.html', '10-8-2021', '1-1-2000', '10', TRUE, 7, 'design6_template7'),
        ('\\storage\\3\\designs\\8\\design1_template8_0.html', '12-5-2021', '7-6-1800', '1000', TRUE, 8, 'design1_template8')`
  );

  await conn.runStatement(
    `INSERT INTO image (Filepath, Created_at, Updated_at, Company_id) VALUES
        ('${path.normalize(
          Storage.storagePathRelative + "/1/images/test.gif"
        )}', '6-11-2021', '8-11-2021', 1)`
  );

  // DB CONNECTION END
  conn.endConnection();

  console.log("Queries done and DB is closed");
})();
