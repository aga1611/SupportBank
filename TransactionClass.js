class Transaction {
    constructor(date, from_who, to_who, description, amount) {
        this.date = date;
        this.from_who = from_who;    
        this.to_who = to_who;
        this.description = description;
        this.amount = Number(amount);
    }
}

exports.Transaction = Transaction;

class Account {
    constructor(name, money) {
        this.name = name;
        this.money = 0;
    }
}

module.exports = Account;