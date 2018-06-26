queue()
    .defer(d3.json, "../data/transactions.json") // load in the transactions file
    .await(makeCharts); // when fully loaded, call function makeCharts()

function makeCharts(error, transactionsData) {

    let ndx = crossfilter(transactionsData);

    let parseDate = d3.time.format("%d/%m/%Y").parse;
    transactionsData.forEach(function(d) {
        d["date"] = parseDate(d["date"]);
    })

    let nameDim = ndx.dimension(dc.pluck("name"));
    let dateDim = ndx.dimension(dc.pluck("date"));
    let storeDim = ndx.dimension(dc.pluck("store"));
    let bigSmallDim = ndx.dimension(function(d) {
        if (d.spend >= 100 && d.spend < 200) {
            return "Medium"
        }
        if (d.spend >= 200) {
            return "Big";
        }
        else {
            return "Small";
        }
    });


    let totalSpend = nameDim.group().reduceSum(dc.pluck("spend"));
    let totalSpendByDate = dateDim.group().reduceSum(dc.pluck("spend"));
    let totalSpendByStore = storeDim.group().reduceSum(dc.pluck("spend"));
    let bigSmallGroup = bigSmallDim.group();
    var averageDim = ndx.dimension(dc.pluck('name'));
    var averageGroup = averageDim.group().reduce( // custum reduce 
        function(p, v) {
            p.count++;
            p.total += v.spend;
            p.average = p.total / p.count;
            return p;
        },
        function(p, v) {
            p.count--;
            if (p.count == 0) {
                p.total = 0;
                p.average = 0;
            }
            else {
                p.total -= v.spend;
                p.average = p.total / p.count;
            }
            return p;
        },
        function() {
            return { count: 0, total: 0, average: 0 };
        }
    );

    let minDate = dateDim.bottom(1)[0].date;
    let maxDate = dateDim.top(1)[0].date;

    let spendChart = dc.barChart("#spend-chart");
    let dateChart = dc.lineChart("#line-chart");
    let storeChart = dc.pieChart("#pie-chart");
    let bigSmallChart = dc.pieChart("#pie-chart-state")
    let averageChart = dc.barChart("#average-chart")


    spendChart
        .width(400)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(nameDim)
        .group(totalSpend)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Person")
        .transitionDuration(800)
        .elasticY(true)
        .yAxis().ticks(5);

    dateChart
        .width(1000)
        .height(200)
        .dimension(dateDim)
        .group(totalSpendByDate)
        .transitionDuration(800)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .xAxisLabel("Month")
        .elasticY(true)
        .yAxis().ticks(5);

    storeChart
        .height(400)
        .radius(150)
        .transitionDuration(800)
        .dimension(storeDim)
        .group(totalSpendByStore)
        .innerRadius(50);

    bigSmallChart
        .height(400)
        .radius(150)
        .transitionDuration(800)
        .dimension(bigSmallDim)
        .group(bigSmallGroup)
        .innerRadius(50);

    averageChart
        .width(500)
        .height(300)
        .dimension(averageDim)
        .group(averageGroup)
        .valueAccessor(function(p) {
            return p.value.average;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Person")
        .yAxis().ticks(4);

    dc.renderAll();
}
