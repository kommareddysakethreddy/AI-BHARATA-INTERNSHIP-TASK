const { BinanceClient } = require("ccxws");
const binance = new BinanceClient();
const market1 = {
    id: "BTCUSDT",
    base: "BTC",
    quote: "USDT",
};
const market2 = {
    id: "ETHUSDT",
    base: "ETH",
    quote: "USDT",
};

// handle trade events
exports.streamData = (req, res, next) => {
    console.log(req.query);
    let market;
    if (req.query.market === "ETHUSDT") {
        market = market2;
    } else if (req.query.market === "BTCUSDT") {
        market = market1;
    } else {
        res.status(404).json({
            status: "fail",
            message: "sorry! We are not client to that market",
        });
        return;
    }
    /* 
      binance.on("l2snapshot", snapshot => console.log(snapshot));
      // subscribe to trades
      binance.subscribeTrades(market);
      
      // subscribe to level2 orderbook snapshots
      binance.subscribeLevel2Snapshots(market); */

    binance.subscribeTrades(market);
    binance.on("trade", (trade) => {
        const { tradeId, price, side, amount } = trade;
        console.log(
            "{\ntradeId:" +
            tradeId +
            "\nprice:" +
            price +
            "\nside: " +
            side +
            "\namounttradeId: " +
            amount +
            "\n}\n"
        );
    });
    res.status(200).json({
        status: "success",
        data: [],
    });

    next();
};