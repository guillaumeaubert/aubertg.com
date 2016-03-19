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

					// Commits by weekday and hour.
					display_commits_by_weekday_hour(json.commit_by_weekday_hour);
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
	var calendar_cell_size = 17;

	var calendar_month_path = function(t0)
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

	var format = d3.time.format("%Y-%m-%d");

	var max_commits_in_a_day = d3.max(d3.values(commits_by_day));
	var color = d3.scale.quantize()
		.domain([0, Math.log(max_commits_in_a_day+1)])
		.range(d3.range(4).map(function(d) { return "q" + d + "-11"; }));

	var years = d3.keys(commits_by_day).map(function(d){return parseInt(d.split('-')[0])});
	var svg = d3.select("#commits_by_day")
		.selectAll("svg")
		.data(d3.range(d3.min(years), d3.max(years)+1))
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


function display_commits_by_weekday_hour(commits)
{
	var margin = { top: 50, right: 0, bottom: 100, left: 40 };
	var width = 960 - margin.left - margin.right;
	var height = 430 - margin.top - margin.bottom;
	var grid_size = Math.floor(width / 24);
	var legend_element_width = grid_size * 2;
	var buckets = 9;
	var colors = ["#d6e685", "#8cc665", "#44a340", "#1e6823"];
	var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	var times = [
		"1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a",
		"1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"
	];

	var svg = d3.select("#commits_by_weekday_hour").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var day_labels = svg.selectAll(".dayLabel")
		.data(days)
		.enter().append("text")
		.text(function (d) { return d; })
		.attr("x", 0)
		.attr("y", function (d, i) { return i * grid_size; })
		.style("text-anchor", "end")
		.attr("transform", "translate(-6," + grid_size / 1.5 + ")")
		.attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

	var time_labels = svg.selectAll(".timeLabel")
		.data(times)
		.enter().append("text")
		.text(function(d) { return d; })
		.attr("x", function(d, i) { return i * grid_size; })
		.attr("y", 0)
		.style("text-anchor", "middle")
		.attr("transform", "translate(" + grid_size / 2 + ", -6)")
		.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

	var data = [];
	for (day=0; day<7; day++) {
		for (hour=0; hour<24; hour++) {
			data.push(
				{
					"day": day+1,
					"hour": hour+1,
					"value": +commits[days[day]][hour],
				}
			);
		}
	}

	var color_scale = d3.scale.quantile()
		.domain([1, buckets - 1, d3.max(data, function (d) { return d.value; })])
		.range(colors);

	var cards = svg.selectAll(".hour")
		.data(data);

	cards.append("title");

	cards.enter().append("rect")
		.attr("x", function(d) { return (d.hour - 1) * grid_size; })
		.attr("y", function(d) { return (d.day - 1) * grid_size; })
		.attr("rx", 4)
		.attr("ry", 4)
		.attr("class", "hour bordered")
		.attr("width", grid_size)
		.attr("height", grid_size)
		.style("fill", colors[0]);

	cards.transition()
		.duration(1000)
		.style("fill", function(d) { return d.value == 0 ? '#fff' : color_scale(d.value); });

	cards
		.select("title")
		.text(function(d) { return d.value; });

	cards.exit().remove();

	var legend = svg.selectAll(".legend")
		.data([1].concat(color_scale.quantiles()), function(d) { return d; });

	legend.enter().append("g")
		.attr("class", "legend");

	legend.append("rect")
		.attr("x", function(d, i) { return legend_element_width * i; })
		.attr("y", height)
		.attr("width", legend_element_width)
		.attr("height", grid_size / 2)
		.style("fill", function(d, i) { return colors[i]; });

	legend.append("text")
		.attr("class", "mono")
		.text(function(d) { return "≥ " + Math.round(d); })
		.attr("x", function(d, i) { return legend_element_width * i; })
		.attr("y", height + grid_size);

	legend.exit().remove();
}
