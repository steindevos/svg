queue()
    .defer(d3.csv, "../data/Salaries.csv")
    .await(makeGraph);

function makeGraph(error, transactionsData) {
    let ndx = crossfilter(transactionsData);
    // ---------------------------------------------------------------------dimensions
    let rankDim = ndx.dimension(dc.pluck("rank"));
    let averageDim = ndx.dimension(dc.pluck("rank"));
    let yearsServiceDim = ndx.dimension(function(d) {
        return [d.yrs_service, d.salary];
    });
    let averageSexDim = ndx.dimension(dc.pluck("sex"));
    let selectRankDim = ndx.dimension(dc.pluck("rank"));


    // ------------------------------------------------------------------------groups
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
    let salaryGroup = yearsServiceDim.group();
    let averageSexGroup = averageSexDim.group().reduce(
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
    let selectRankGroup = selectRankDim.group();



    // ------------------------------------------------------------------------------------charts
    let totalSalaryByRankChart = dc.barChart("#chart-goes-here");
    let averageSalaryByRankchart = dc.barChart("#second-chart-goes-here");
    let salaryChart = dc.scatterPlot("#scatterplot-here");
    let averageSexChart = dc.barChart("#fourth-chart-here")
    let selectRank = dc.selectMenu('#select-rank')



    totalSalaryByRankChart
        .width(500)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 70 })
        .dimension(rankDim)
        .group(salaryByRank)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Total by rank")
        .transitionDuration(800)
        .elasticY(true)
        .yAxis().ticks(5);

    averageSalaryByRankchart
        .width(500)
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

    salaryChart
        .width(1000)
        .height(480)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .x(d3.scale.linear().domain([0, 60]))
        .y(d3.scale.linear().domain([0, 250000]))
        .brushOn(false)
        .symbolSize(4)
        .clipPadding(100)
        .xAxisLabel("salary and years of service")
        .yAxisLabel("Salary")
        .dimension(yearsServiceDim)
        .group(salaryGroup);

    averageSexChart
        .width(500)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(averageSexDim)
        .group(averageSexGroup)
        .valueAccessor(function(p) {
            return p.value.average;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("average by sex")
        .transitionDuration(800)
        .elasticY(true)
        .yAxis().ticks(5);

    selectRank
        .dimension(selectRankDim)
        .group(selectRankGroup);

    dc.renderAll();

}

