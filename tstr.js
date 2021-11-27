// var coinspot = require('coinspot-api');
//
// var key = 'bad396dae798b2b0358650577d31ca5f'; // insert your secret here
// var secret = '6D836BA9B5M5P3FLA3JV7J8NURBJ9R4KZKDED5QXB3FBFRL1D933NVLHJFUJ7R68C6RUV4LK42WCK2DK'; // insert your key here
//
// var https = require('https');
// var options = {
//     host: 'www.coinspot.com.au',
//     path: '/pubapi/v2/latest'
// };
//
// var bodyChunks = [];
// var body;
//
// var req = https.get(options, function(res) {
//     console.log('STATUS: ' + res.statusCode);
//     console.log('HEADERS: ' + JSON.stringify(res.headers));
//
//     // Buffer the body entirely for processing as a whole.;
//     res.on('data', function(chunk) {
//         console.log(res);
//         bodyChunks.push(chunk);
//     }).on('end', function() {
//         body = Buffer.concat(bodyChunks);
//         console.log('BODY: ' + body);
//         // ...and/or process the entire body here.
//     })
// });
//
// req.on('error', function(e) {
//     console.log('ERROR: ' + e.message);
// });
import WebSocket from 'ws';
//
// var ws = new WebSocket("www.coinspot.com.au/pubapi/v2/latest");
//
// ws.onopen = function() {
//
// };
//
// ws.onmessage = function (evt) {
//     var received_msg = evt.data;
//     //alert("Message is received...");
// };
//
// ws.onclose = function() {
//
//     // websocket is closed.
//     //alert("Connection is closed...");
// };

// // const io = require("socket.io-client");
// //
// // const socket = io("www.coinspot.com.au/pubapi/v2/latest");
// //
// // socket.on('data', () => {
// //     console.log("hjgjgjgjg"); // "G5p5..."
// // });
//

//  import rp from "request-promise";
//
// const requestOptions = {
//     method: 'GET',
//     uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
//     qs: {
//         'start': '1'
//     },
//     headers: {
//         'X-CMC_PRO_API_KEY': '9d9ac7e3-9369-4f75-8419-19616ba32fbe'
//     },
//     json: true,
//     gzip: true
// };
//
// rp(requestOptions).then(response => {
//     console.log('API call response:', response.data.length);
// }).catch((err) => {
//     console.log('API call error:', err.message);
// });

import fetch from "node-fetch";

const kp = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    keepalive : true
};
//https://api.nomics.com/v1/currencies/ticker?key=66dfb896439816c9de24f63c55e7ac0f468062aa
//https://api.binance.com/api/v3/ticker/price
//https://api.binance.com/api/v3/exchangeInfo



var symbolInfo;
var tempCountr = 0;
var set0, set1, set2;
var transTime, timeLogger, currentTime;
var trends = [];
var tickerData;
var tolerance = 0.8;
var toInvest = false;
var minCounter, avgCounter = 0;
var toUpdate = false;
var trendInfoCounter = 0;
var godList = [];
var luckyNums;
var fn = async function (){
    await fetch("https://api.binance.com/api/v3/exchangeInfo", kp)
        .then(response => response.json())
        .then(data => {

            symbolInfo = data;

            //console.log(symbolInfo.symbols[7]);
            for(var i = 0; i < data.symbols.length; i++){
                var trendCont = {
                    coinInfo : symbolInfo.symbols[i],

                    // The original symbol index of the coin
                    mainIndex : i,

                    // The highest that coin has got to, since induction into god list
                    highestYet : 1,

                    // The current variance in average value of the coin price
                    pres_slope : 1.00,

                    // The previous variance in average value of the coin price
                    past_slope : 1.00,

                    // The price value at which the coin enters the god list
                    start_point : 1.00,

                    // The current average price value of the coin
                    frontAvg : 1,
                    midAvg : 1,
                    backAvg : 1,

                    // Array containing all the price values of the coin so far
                    pointData : [],

                    lastSlope : -20,

                    qualifiedToCompete : false,

                    // Array containing all the average prices of the coin so far
                    slopeHist : [],
                    trendsInfo : [],

                    // Boolean indicating whether the coin is in the godList
                    isGod : false,

                    // Number of times it passes the god check; 3 means it enters god list
                    loyaltyCheck : 0

                }
                trends.push(trendCont);

            }
        })
}

var arrEq = function (arr1){
    var retArr = [];
    for(var i = 0; i < arr1.length; i++){
        retArr.push(parseFloat(arr1[i].price));
    }
    return retArr;
}

var swap = function(items, leftIndex, rightIndex){
    var temp = items[leftIndex];
    items[leftIndex] = items[rightIndex];
    items[rightIndex] = temp;
}

var startTime = 0, endTime = 175;
fn().then(function priceUpdater(){
    Promise.all([
        fetch("https://api.binance.com/api/v3/ticker/price", kp),
        fetch("https://api.binance.com/api/v3/time", kp)
    ])
        .then(response => {return Promise.all(response.map(function (response) {
            return response.json();
        }));})
        .then(async data => {


            toInvest = true;
            if(toUpdate){
                minCounter = currentTime;
                toUpdate = false;
            }

            tickerData = data[0];
            currentTime = data[1].serverTime;

            if(tempCountr === 0) minCounter = currentTime;



            //------------------ God List Monitor -------------------
            // Collects and flags data points for processing
            if(currentTime - minCounter >= 10000){
                trendInfoCounter += 1;
                //console.log("UPDATE!! Time Elapsed since last update : " + (currentTime - minCounter) + "ms");
                //console.log();
                toUpdate = true;

                //The god list monitor

                for(var i = 0; i < godList.length; i++){
                    avgCounter = 0;
                    for(var j = 0; j < godList[i].pointData.length; j++){
                        avgCounter += godList[i].pointData[j];
                    }
                    godList[i].frontAvg = avgCounter/godList[i].pointData.length;

                    // Sets highest point so far, this god run
                    if(godList[i].frontAvg > godList[i].highestYet) godList[i].highestYet = godList[i].frontAvg;

                    // Eliminates coins that fall below 80% of maximum rise
                    if((godList[i].start_point >= godList[i].frontAvg) ||
                        (godList[i].frontAvg) < (((tolerance)*(godList[i].highestYet - godList[i].start_point)) + godList[i].start_point)){
                        godList[i].qualifiedToCompete = false;
                        godList[i].lastSlope = -20;
                        godList[i].loyaltyCheck = 0;
                        godList[i].isGod = false;
                        godList.splice(i, 1);
                    }

                }
            }

            //---------------------------------------------------------

                transTime =  2;
                set2 = arrEq(tickerData);

                // The updating funtion
                for (var i = 0; i < tickerData.length; i++) {
                    if(toUpdate){
                        for(var j = 0; j < trends[i].pointData.length; j++){
                            avgCounter += trends[i].pointData[j];
                        }
                        trends[i].backAvg = trends[i].midAvg;
                        trends[i].midAvg = trends[i].frontAvg;
                        trends[i].frontAvg = avgCounter/trends[i].pointData.length;
                        avgCounter = 0;
                        trends[i].slopeHist.push(trends[i].frontAvg);
                        trends[i].pointData = [];
                        trends[i].past_slope = trends[i].pres_slope;
                        if(trendInfoCounter === 10) { //if (i===0) console.log("NOW");
                            if(!trends[i].isGod) {
                                toInvest = false;
                                if ((trends[i].slopeHist[trends[i].slopeHist.length - 1] / trends[i].slopeHist[0]) >= 1.001) trends[i].qualifiedToCompete = true;

                                if(trends[i].qualifiedToCompete) {
                                    if((trends[i].slopeHist[trends[i].slopeHist.length - 1] - trends[i].slopeHist[0]) >= trends[i].lastSlope) toInvest = true;
                                    trends[i].lastSlope = (trends[i].slopeHist[trends[i].slopeHist.length - 1] - trends[i].slopeHist[0]);
                                }

                                // Check to see if the recent change is above the investing threshold
                                if (toInvest) {
                                    trends[i].loyaltyCheck += 1;

                                    // Check to see if it's been consistently rising for a while
                                    if(trends[i].loyaltyCheck === 3){
                                        trends[i].start_point = trends[i].frontAvg;
                                        trends[i].highestYet = trends[i].frontAvg;
                                        trends[i].isGod = true;
                                        godList.push(trends[i]);
                                    }

                                } else {
                                    trends[i].loyaltyCheck = 0;
                                    trends[i].qualifiedToCompete = false;
                                }
                            }
                            trends[i].trendsInfo = [];
                            trends[i].slopeHist = [];
                        } else {
                            trends[i].pres_slope = (trends[i].frontAvg/trends[i].midAvg);
                            trends[i].trendsInfo.push(trends[i].pres_slope);
                        }

                    }
                    trends[i].pointData.push(set2[i]);

                    trends[i].pres_slope = (trends[i].frontAvg/trends[i].midAvg);

                }

            if (trendInfoCounter === 10) {console.log(godList[0]); console.log(godList.length);}
                if (trendInfoCounter === 10) trendInfoCounter = 0;


        }).then(r => {

            //console.log("Time Taken : " + (endTime - startTime));
        tempCountr += 1;
        priceUpdater();})
} );

// .then(r => {
//     fetch("https://api.binance.com/api/v3/ticker/price", kp)
//         .then(response => response.json())
//         .then(data => {
//
//         })
// })


//------------------------- Nomics -----------------------

// var fn = function (){
//     fetch("https://api.nomics.com/v1/currencies/ticker?key=66dfb896439816c9de24f63c55e7ac0f468062aa", kp)
//         .then(response => response.json())
//         .then(data => {
//             //console.log(data);
//         }).then(r => {})
// }
// fn();


//-----------------------------X--------------------------

//--------------------------- Coin Gecko ---------------------------

// import CoinGecko from "coingecko-api";
//
//
// //2. Initiate the CoinGecko API Client
// const CoinGeckoClient = new CoinGecko();
// const CoinGeckoClient2 = new CoinGecko();
// var tempPageCount = 200;
// let data = [];
// let page_count = 0;
// //3. Make calls
//
//
// let pars1 = {
//     order : CoinGecko.ORDER.GECKO_ASC,
//     per_page : 251,
//     page : 1,
//     localization : true,
//     sparkline : false
// }
// let pars2 = {
//     order : CoinGecko.ORDER.GECKO_ASC,
//     per_page : 251,
//     page : 2,
//     localization : true,
//     sparkline : false
// }
// let pars3 = {
//     order : CoinGecko.ORDER.GECKO_ASC,
//     per_page : 251,
//     page : 3,
//     localization : true,
//     sparkline : false
// }
// let pars4 = {
//     order : CoinGecko.ORDER.GECKO_ASC,
//     per_page : 251,
//     page : 4,
//     localization : true,
//     sparkline : false
// }
// let pars5 = {
//     order : CoinGecko.ORDER.GECKO_ASC,
//     per_page : 251,
//     page : 5,
//     localization : true,
//     sparkline : false
// }
// let pars6 = {
//     order : CoinGecko.ORDER.GECKO_ASC,
//     per_page : 251,
//     page : 6,
//     localization : true,
//     sparkline : false
// }
// let pars7 = {
//     order : CoinGecko.ORDER.GECKO_ASC,
//     per_page : 251,
//     page : 7,
//     localization : true,
//     sparkline : false
// }
// let pars8 = {
//     order : CoinGecko.ORDER.GECKO_ASC,
//     per_page : 251,
//     page : 8,
//     localization : true,
//     sparkline : false
// }
//
//
//
// var func = async() => {
//
//
//     var iter = 0;
//         data = await Promise.all([
//             CoinGeckoClient.coins.all(pars1),
//             CoinGeckoClient.coins.all(pars2)
//
//         ]) ;
//         console.log(data[7]);
//
// };
// func().then(r => {console.log("--------------- Completed --------------")});


//------------------------- X ---------------------------



// var EventSource = require("eventsource");
//
// let eventSource = new EventSource("https://www.coinspot.com.au/pubapi/v2/latest");
//
// eventSource.onopen = function(){
//     console.log('connection is opened.'+eventSource.readyState);
// };
//
// eventSource.onerror = function(){
//     console.log('error: '+eventSource.readyState);
// };
//
// eventSource.addEventListener("Object", function(e) {
//     // do your login specific logic
//     //var returnedData = JSON.parse(e);
//     console.log("returnedData");
// });
//
// // const Nomics = require("nomics");
// // const {NomicsNode} = require("nomics");
// // var kj = new NomicsNode("66dfb896439816c9de24f63c55e7ac0f468062aa");
// //
// // console.log(kj.currenciesArray())
//
// // const Nomics = require("nomics");
// //
// // // ...
// //
// // const nomics = new Nomics({
// //     apiKey: "66dfb896439816c9de24f63c55e7ac0f468062aa"
// // });
// // async function client() {
// //     // all currencies provided by the ticker with default options
// //     const currencies = await nomics.currenciesTicker();
// // }

//-------------------BINANCE-------------------

// import Spot from '@binance/connector';
//
// const apiKey = 'tpFXHrkNByLGTDqMn70cExFwUmHRN57gqjn3CUtUEUTugQVBpvmNlD8pvNcG6wVz'
// const apiSecret = 'hrsKt47rUaKNUVW0BGyBog1TdYtgoBb3QnVwgxKew4YeajbbM2YQF8yAcAMr7a3v'
// const client = new Spot(apiKey, apiSecret)
//
//



