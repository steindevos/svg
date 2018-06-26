queue()
    .defer(d3.csv, "../data/Salaries.csv")
    .await(makeGraph);

function makeGraph(error, transactionsData) {
    let ndx = crossfilter(transactionsData);

    let rankDim = ndx.dimension(dc.pluck("rank"));
    let averageDim = ndx.dimension(dc.pluck("rank"));


    let salaryByRank = rankDim.group().reduceSum(dc.pluck("salary"));
    let averageGroup = averageDim.group().reduce( // custum reduce 
        function(p, v) {
            p.count++;
            p.total += +v.salary;
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
                p.total -= +v.salary;
                p.average = p.total / p.count;
            }
            return p;
        },
        function() {
            return { count: 0, total: 0, average: 0 };
        }
    );

    let totalSalaryByRankChart = dc.barChart("#chart-goes-here");
    let averageSalaryByRankchart = dc.barChart("#second-chart-goes-here")

    totalSalaryByRankChart
        .width(400)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 70 })
        .dimension(rankDim)
        .group(salaryByRank)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("rank")
        .transitionDuration(800)
        .elasticY(true)
        .yAxis().ticks(5);

    averageSalaryByRankchart
        .width(400)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(averageDim)
        .group(averageGroup)
        .valueAccessor(function(p) {
            return p.value.average;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("average per rank")
        .transitionDuration(800)
        .elasticY(true)
        .yAxis().ticks(5);
      

    dc.renderAll();

}
