import fetch from "node-fetch";


var currentTime = 0, prevTime = 0, currPrice = 1, prevPrice = 1, startPrice = 0, change = 0.0, ath = 0, tolerance = 0.8;
var avgCounter = 0;
var toInvest = false, checkPrice = false, checkChange = false;
var priceHistory = [], changeHistory = [], avgHistory = [];
const kp = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    keepalive : true,
    symbol : 'LUNABTC'
};


var fn = async function (){
    await fetch("https://api.binance.com/api/v3/ticker/price?symbol=LUNAAUD", kp)
        .then(response => response.json())
        .then(data => {
            console.log(data.price);
        })
}

fn().then(function priceUpdater(){
    Promise.all([
        fetch("https://api.binance.com/api/v3/ticker/price?symbol=LUNAAUD", kp),
        fetch("https://api.binance.com/api/v3/time", kp)
    ])
        .then(response => {return Promise.all(response.map(function (response) {
            return response.json();
        }));})
        .then(async data => {

            checkPrice = false;
            checkChange = false;
            toInvest = false;
            avgCounter = 0;

            if(currentTime === 0){
                currentTime = data[1].serverTime;
                prevTime = currentTime;
            }

            currentTime = data[1].serverTime;
            priceHistory.push(parseFloat(data[0].price));

            if ((currentTime - prevTime) > 2000) {
                prevTime = currentTime;
                checkPrice = true;
            }

            if (checkPrice){
                avgCounter = 0;
                for (var i = 0; i < priceHistory.length; i++){
                    avgCounter += priceHistory[i];
                }
                currPrice = avgCounter/priceHistory.length;
                console.log("Checking Price!! " + currPrice);
                priceHistory = []
                avgHistory.push(currPrice);
                //console.log(avgCounter + " currPrice = " + currPrice + " prevPrice = " + prevPrice);
                if (avgHistory.length > 20){ console.log("Average Taaaime!!"); console.log(avgHistory);
                    change = avgHistory[avgHistory.length - 1]/avgHistory[0];
                    changeHistory.push(change);
                    avgHistory = [];
                }

                if(changeHistory.length > 1) checkChange = true;
            }

            if (checkChange){ console.log("Checking Changes!!"); console.log(changeHistory);
                toInvest = true;
                for (var i = 1; i < changeHistory.length; i++){
                    if ((!(changeHistory[i] >= 1))) toInvest = false;
                }
                if (changeHistory[changeHistory.length - 1] <= 1) toInvest = false;
                changeHistory.shift();
            }

            if(checkChange && toInvest){
                console.log("INVEST");
            }



            }).then(r => { priceUpdater(); })
} );

// || (changeHistory[i] < changeHistory[i-1])
import Spot from '@binance/connector';

// const apiKey = 'tpFXHrkNByLGTDqMn70cExFwUmHRN57gqjn3CUtUEUTugQVBpvmNlD8pvNcG6wVz'
// const apiSecret = 'hrsKt47rUaKNUVW0BGyBog1TdYtgoBb3QnVwgxKew4YeajbbM2YQF8yAcAMr7a3v'
// const client = new Spot(apiKey, apiSecret)