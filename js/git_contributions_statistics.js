// Cell size for the calendar view.
var calendar_cell_size = 17;

$(document).ready(
	function()
	{
		// Retrieve git contribution information.
		$.getJSON('/data/git_contributions.json')
			.done(
				function(json)
				{
					// Commits by day.
					$('#total_days').html( '(' + Object.keys(json.commits_by_day).length + ' active days)' );
					display_commits_by_day(json.commits_by_day);
				}
			)
			.fail(
				function(jqxhr, textStatus, error)
				{
					var err = textStatus + ", " + error;
					console.log( "Request Failed: " + err );
				}
			);
	}
);

function display_commits_by_day(commits_by_day)
{
	var width = 960;
	var height = 136;

	var format = d3.time.format("%Y-%m-%d");

	var max_commits_in_a_day = d3.max(d3.values(commits_by_day));
	var color = d3.scale.quantize()
		.domain([0, Math.log(max_commits_in_a_day+1)])
		.range(d3.range(4).map(function(d) { return "q" + d + "-11"; }));

	var svg = d3.select("#commits_by_day")
		.selectAll("svg")
		.data(d3.range(2011, 2017))
		.enter()
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "RdYlGn")
		.append("g")
		.attr("transform", "translate(" + ((width - calendar_cell_size * 53) / 2) + "," + (height - calendar_cell_size * 7 - 1) + ")");

	svg.append("text")
		.attr("transform", "translate(-6," + calendar_cell_size * 3.5 + ")rotate(-90)")
		.style("text-anchor", "middle")
		.text(function(d) { return d; });

	var rect = svg.selectAll(".day")
		.data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		.enter().append("rect")
		.attr("class", "day")
		.attr("width", calendar_cell_size)
		.attr("height", calendar_cell_size)
		.attr("x", function(d) { return d3.time.weekOfYear(d) * calendar_cell_size; })
		.attr("y", function(d) { return d.getDay() * calendar_cell_size; })
		.datum(format);

	rect.append("title")
		.text(function(d) { return d; });

	svg.selectAll(".month")
		.data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		.enter()
		.append("path")
		.attr("class", "month")
		.attr("d", calendar_month_path);

	rect.filter(function(d) { return d in commits_by_day; })
		.attr("class", function(d) { return "day " + color(Math.log(commits_by_day[d]+1)); })
		.select("title")
		.text(function(d) { return d + ": " + commits_by_day[d]; });
}

function calendar_month_path(t0)
{
	var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
		d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
		d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
	return "M" + (w0 + 1) * calendar_cell_size + "," + d0 * calendar_cell_size
		+ "H" + w0 * calendar_cell_size + "V" + 7 * calendar_cell_size
		+ "H" + w1 * calendar_cell_size + "V" + (d1 + 1) * calendar_cell_size
		+ "H" + (w1 + 1) * calendar_cell_size + "V" + 0
		+ "H" + (w0 + 1) * calendar_cell_size + "Z";
}
