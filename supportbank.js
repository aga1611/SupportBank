/* eslint-disable no-undef */

const parse = require("csv-parse/lib/sync");
const fs = require("fs");
const log4js = require("log4js");
const moment = require("moment");
const readlineSync = require("readline-sync");
//const TransactionClass = require("./TransactionClass.js");
//const Account = require("./TransactionClass.js");

class Transaction {
    constructor(date, from_who, to_who, description, amount) {
        this.date = date;
        this.from_who = from_who;    
        this.to_who = to_who;
        this.description = description;
        this.amount = Number(amount);
    }
}

class Account {
    constructor(name, money) {
        this.name = name;
        this.money = 0;
    }
}


log4js.configure({
    appenders: {
        file: { type: "fileSync", filename: "logs/debug.log" }
    },
    categories: {
        default: { appenders: ["file"], level: "debug"}
    }
});

const logger = log4js.getLogger("supportbank.js");

const csv = "csv";
const json = "json";
var rows;
var user_import = readlineSync.question("Import file: ");
if (user_import.indexOf(csv) > -1 ) {
    const fileContents = fs.readFileSync(user_import, "utf-8");
    rows = parse(fileContents);
    logger.info("The file has been opened successfully.");
}
if (user_import.indexOf(json) > -1 ) {
    const file_contents = fs.readFileSync(user_import, "utf-8");
    let lines = JSON.parse(file_contents);
    const number_of_lines = lines.length;
    var array_of_lines = [];
    array_of_lines.push([ "Date", "From", "To", "Narrative", "Amount" ]);
    for (i = 0; i <= (number_of_lines - 1); i++) {
        let one_transaction = [];
        let wrong_date = lines[i]["Date"];
        let good_date = wrong_date.replace("T00:00:00", "");
        let good_date_format = moment(good_date).format("DD/MM/YYYY");
        one_transaction.push(good_date_format);
        one_transaction.push(lines[i]["FromAccount"]);
        one_transaction.push(lines[i]["ToAccount"]);
        one_transaction.push(lines[i]["Narrative"]);
        one_transaction.push(lines[i]["Amount"]);
        array_of_lines.push(one_transaction); 
    }
    rows = array_of_lines;
    logger.info("The file has been opened successfully.");
}

const number_of_transactions = rows.length - 1;

let errors = 0;
for (i = 1; i <= number_of_transactions; i++) {
    let date = rows[i][0];
    if (!(moment(date, "DD/MM/YYYY",true).isValid())) {
        logger.error("Wrong date format in a transaction number " + (i + 1) +".");
        errors += 1;
    }
    let amount = rows[i][4];
    if (isNaN(amount)){
        logger.error("Wrong amount format in a transaction number " + (i + 1) +".");
        errors += 1;
    }
}

if (errors != 0){
    logger.fatal("Your data is in the wrong format. Program has been shut down.");
    throw new Error("Something is wrong with the data format. Please chack the debug for details");
}
else {
    logger.info("All data is in the correct format.");
}


let list_of_transactions = [];
for (i = 1; i <= number_of_transactions; i++) {
    let v = new Transaction(rows[i][0], rows[i][1], rows[i][2], rows[i][3], parseFloat(rows[i][4]));
    list_of_transactions.push(v);
}


let names_accountobject = {};
for (i = 0; i <= (number_of_transactions - 1); i++) {
    let name = list_of_transactions[i].from_who;
    names_accountobject [name] = 0;
}

const names = Object.keys(names_accountobject);

const number_of_people = names.length;


for(i = 0; i <= (number_of_people - 1); i++) {
    let z = new Account(names[i], 0);
    names_accountobject [names[i]] = z;
}


for (i = 0; i <= (number_of_transactions - 1); i++) {
    let person = list_of_transactions[i].from_who;
    names_accountobject[person].money -= list_of_transactions[i].amount; 
    let person_to = list_of_transactions[i].to_who;
    names_accountobject[person_to].money += list_of_transactions[i].amount;
}

var user_input = readlineSync.question("Choose an option: List ");
if (user_input == "All") {
    for(i = 0; i <= (number_of_people - 1); i++) {
        let person = names[i];
        console.log(names_accountobject[person].name + " : " + parseFloat(Math.round(names_accountobject[person].money * 100) / 100).toFixed(2));
    }
}
else {
    const heading = rows[0].join(" ");
    console.log(heading);
    for(i = 0; i <= (number_of_transactions - 1); i++) {
        let person = user_input;
        if (person == list_of_transactions[i].from_who || person == list_of_transactions[i].to_who){
            console.log(list_of_transactions[i].date + " " + list_of_transactions[i].from_who + " " + list_of_transactions[i].to_who + " " + list_of_transactions[i].description + " " + list_of_transactions[i].amount);
        }
    }
}

console.log("Done.");