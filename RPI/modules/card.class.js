class Card {
    constructor(cardID, cardType, expireTime, lastTransportID, balance, lastPaytime) {
        this.cardID = cardID;
        this.cardType = cardType;
        this.expireTime = expireTime;
        this.lastTransportID = lastTransportID;
        this.balance = balance;
        this.lastPaytime = lastPaytime;
    }
};

module.exports = Card;
