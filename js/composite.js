queue()
    .defer(d3.json, "../data/transactions.json")
    .await(makeGraphs);

function makeGraphs(error, transactionsJson) {
    var ndx = crossfilter(transactionsJson);
    var parseDate = d3.time.format("%m/%d/%Y").parse;
    transactionsJson.forEach(function(d) {
        d.date = parseDate(d.date);
    });
    let dateDim = ndx.dimension(function(d) {
        return d.date;
    });
    let minDate = dateDim.bottom(1)[0].date;
    let maxDate = dateDim.top(1)[0].date;
    let tomSpendByMonth = dateDim.group().reduceSum(function(d) {
        if (d.name === "Tom") {
            return +d.spend; // + sign forces it to be a number
        }
        else {
            return 0;
        }
    });
    let bobSpendByMonth = dateDim.group().reduceSum(function(d) {
        if (d.name === "Bob") {
            return +d.spend;
        }
        else {
            return 0;
        }
    });
    let aliceSpendByMonth = dateDim.group().reduceSum(function(d) {
        if (d.name === "Alice") {
            return +d.spend;
        }
        else {
            return 0;
        }
    });
    let compositeChart = dc.compositeChart('#composite-chart');
    compositeChart
        .width(990)
        .height(200)
        .dimension(dateDim)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .yAxisLabel("The Y Axis")
        .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
        .renderHorizontalGridLines(true)
        .compose([
            dc.lineChart(compositeChart)
            .colors('green')
            .group(tomSpendByMonth, 'Tom'),
            dc.lineChart(compositeChart)
            .colors('red')
            .group(bobSpendByMonth, 'Bob'),
            dc.lineChart(compositeChart)
            .colors('blue')
            .group(aliceSpendByMonth, 'Alice')
        ])
        .brushOn(false)
        .render();
    dc.renderAll();
}