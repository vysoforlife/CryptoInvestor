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
var invTemp = 0;
var transTime, timeLogger, currentTime;
var trends = [];
var tickerData;
var tolerance = 0.5;
var toInvest = false;
var minCounter, avgCounter = 0;
var toUpdate = false;
var trendInfoCounter = 0;
var godList = [];
var investProfit = 0
;
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

                    coinValue : 0,

                    // The highest that coin has got to, since induction into god list
                    highestYet : 1,

                    // The current variance in average value of the coin price
                    pres_slope : 1.00,

                    // The previous variance in average value of the coin price
                    past_slope : 1.00,

                    // The price value at which the coin enters the god list
                    start_point : 1.00,

                    god_verified : false,

                    // The current average price value of the coin
                    frontAvg : 1,
                    midAvg : 1,
                    backAvg : 1,

                    // Array containing all the price values of the coin so far
                    pointData : [],

                    // Array containing all the average prices of the coin so far
                    slopeHist : [],
                    trendsInfo : [],

                    // Boolean indicating whether the coin is in the godList
                    isGod : false,

                    // Number of times it passes the god check; 3 means it enters god list
                    loyaltyCheck : 0,

                    currSlope : 0,

                    godFront : 0,

                    godMid : 0

                }
                trends.push(trendCont);

            }
        })
}

//-------------------- Helper Function -----------------------

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

var partition = function(items, left, right) {
    var pivot   = items[Math.floor((right + left) / 2)].loyaltyCheck, //middle element
        i       = left, //left pointer
        j       = right; //right pointer
    //console.log("piv : " + pivot);
    while (i <= j) {
        while (items[i].loyaltyCheck < pivot) {
            i++;
        }
        while (items[j].loyaltyCheck > pivot) {
            j--;
        }
        if (i <= j) {
            swap(items, i, j); //sawpping two elements
            i++;
            j--;
        }
    }
    return i;
}

var quickSort = function(items, left, right) {
    var index;
    if (items.length > 1) {
        index = partition(items, left, right); //index returned from partition
        if (left < index - 1) { //more elements on the left side of the pivot
            quickSort(items, left, index - 1);
        }
        if (index < right) { //more elements on the right side of the pivot
            quickSort(items, index, right);
        }
    }
    return items;
}

//-------------------------------------------------------


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
                    //godList[i].godMid = godList[i].frontAvg;
                    godList[i].godFront = avgCounter/godList[i].pointData.length;
                    if(trendInfoCounter === 10) {
                        if((godList[i].godFront !== godList[i].start_point) && !godList[i].god_verified){
                            godList[i].god_verified = true;
                            godList[i].start_point = godList[i].godFront
                        }
                        godList[i].loyaltyCheck += 1;
                        godList[i].currSlope = godList[i].godFront / godList[i].slopeHist[0];
                    }
                    //godList[i].currSlope = godList[i].godFront/godList[i].godMid;

                    // Sets highest point so far, this god run
                    if(godList[i].godFront > godList[i].highestYet) godList[i].highestYet = godList[i].godFront;

                    // Eliminates coins that fall below 80% of maximum rise
                    if((godList[i].start_point > godList[i].godFront) ||
                        (godList[i].godFront) < (((tolerance)*(godList[i].highestYet - godList[i].start_point)) + godList[i].start_point)){
                        godList[i].isGod = false;
                        if ((godList[i].loyaltyCheck > 4) && godList[i].god_verified){
                            invTemp = (godList[i].godFront / godList[i].start_point);
                            console.log("Final Ratio : " + invTemp + " || Prof : " + (invTemp * 10) + " || Loss : " + (0.01 + (invTemp * 10 * 0.001))
                                + " - currDiff : " + (((invTemp * 10) - (0.01 + (invTemp * 10 * 0.001))) - 10) + " - investProfit : " + investProfit);

                            investProfit += (((invTemp * 10) - (0.01 + (invTemp * 10 * 0.001))) - 10);
                            console.log("Modified Invest profit : " + investProfit);
                        }

                        godList[i].god_verified = false;
                        godList[i].loyaltyCheck = 0;
                        godList.splice(i, 1);
                    }


                }

            }

            //---------------------------------------------------------

            transTime =  2;
            set2 = arrEq(tickerData);

            // The updating funtion
            for (var i = 0; i < tickerData.length; i++) {
                if(toUpdate && (trends[i].coinInfo.quoteAsset === 'BTC' ||
                    trends[i].coinInfo.quoteAsset === 'ETH' || trends[i].coinInfo.quoteAsset === 'USDC' ||
                    trends[i].coinInfo.quoteAsset === 'USDT' || trends[i].coinInfo.quoteAsset === 'BUSD')){
                    for(var j = 0; j < trends[i].pointData.length; j++){
                        avgCounter += trends[i].pointData[j];
                    }
                    trends[i].backAvg = trends[i].midAvg;
                    trends[i].midAvg = trends[i].frontAvg;
                    trends[i].frontAvg = avgCounter/trends[i].pointData.length;
                    avgCounter = 0;
                    trends[i].slopeHist.push(trends[i].frontAvg);
                    //trends[i].currSlope = trends[i].slopeHist[trends[i].slopeHist.length - 1] / trends[i].slopeHist[0];
                    trends[i].pointData = [];
                    trends[i].past_slope = trends[i].pres_slope;
                    if(trendInfoCounter === 10) {
                        if(!trends[i].isGod) {
                            toInvest = true;
                            if ((trends[i].slopeHist[trends[i].slopeHist.length - 1] / trends[i].slopeHist[0]) < 1.001) toInvest = false;

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

                            } else trends[i].loyaltyCheck = 0;
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



            if(godList.length > 1 && trendInfoCounter === 10) {

                console.log("entered");

                godList = quickSort(godList, 0, godList.length - 1);
            }


            if (godList.length > 1 && trendInfoCounter === 10) {
                console.log("sec");
                console.log(investProfit);
                for (var u = 0; u < godList.length; u++){
                    console.log(godList[u].loyaltyCheck);
                }
            }
            if (trendInfoCounter === 10) trendInfoCounter = 0;


        }).then(r => {

        //console.log("Time Taken : " + (endTime - startTime));
        tempCountr += 1;
        priceUpdater();})
} );