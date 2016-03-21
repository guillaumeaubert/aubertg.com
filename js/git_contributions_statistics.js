$(document).ready(
	function()
	{
		// Retrieve git contribution information.
		$.getJSON('/data/git_contributions.json')
			.done(
				function(json)
				{
					// Commits by month.
					$('#commits_total').html( '(' + json.commits_total + ' commits)' );
					display_commits_by_month(json.commits_by_month);

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


function display_commits_by_month(commits)
{
	var margin = {top: 10, right: 20, bottom: 40, left: 40};
	var width = 960 - margin.left - margin.right;
	var height = 300 - margin.top - margin.bottom;

	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1)
		.domain(commits.map(function(d) { return d.month; }));

	var y = d3.scale.linear()
		.range([height, 0])
		.domain([0, Math.round((d3.max(commits, function(d) { return +d.commits; })+1)/50)*50  ]);

	var x_axis = d3.svg.axis()
		.scale(x)
		.tickFormat(function(d) {
			return /^Jan-/.test(d)
				? d.replace('Jan-','')
				: '';
		})
		.orient("bottom");

	var y_axis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var svg = d3.select("#commits_by_month").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(x_axis)
		.selectAll("text")
			.attr("y", 12)
			.attr("x", 5)
			.attr("dy", ".35em")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");

	svg.append("g")
		.attr("class", "y axis")
		.call(y_axis);

	svg.selectAll(".bar")
		.data(commits)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.month); })
		.attr("width", x.rangeBand())
		.attr("y", function(d) { return y(d.commits); })
		.attr("height", function(d) { return height - y(d.commits); })
		.append("title")
			.text(function(d) { return d.month.replace('-', ' ') + ': ' + d.commits; });
}


function display_commits_by_day(commits_by_day)
{
	// Configuration.
	var width = 960;
	var height = 136;
	var calendar_cell_size = 17;

	// Function to draw month outlines.
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

	// Create a color scale based on the data.
	var max_commits_in_a_day = d3.max(d3.values(commits_by_day));
	var color = d3.scale.quantize()
		.domain([0, Math.log(max_commits_in_a_day+1)])
		.range(d3.range(4).map(function(d) { return "q" + d + "-11"; }));

	// Determine the years to display.
	var years = d3.keys(commits_by_day).map(function(d){return parseInt(d.split('-')[0])});

	// Set up graph.
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

	// Add tiles for the days.
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
		.text(function(d) { return d + ': 0 commits'; });

	// Add month outlines.
	svg.selectAll(".month")
		.data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		.enter()
		.append("path")
		.attr("class", "month")
		.attr("d", calendar_month_path);

	// Colorize tiles baser on data.
	rect.filter(function(d) { return d in commits_by_day; })
		.attr("class", function(d) { return "day " + color(Math.log(commits_by_day[d]+1)); })
		.select("title")
		.text(function(d) { commits = commits_by_day[d]; return d + ": " + commits + ' commit' + (commits == 1 ? '' : 's'); });
}


function display_commits_by_weekday_hour(commits)
{
	// Configuration.
	var margin = { top: 20, right: 0, bottom: 40, left: 40 };
	var width = 960 - margin.left - margin.right;
	var height = 350 - margin.top - margin.bottom;
	var grid_size = Math.floor(width / 24);
	var legend_element_width = grid_size * 2;
	var buckets = 9;
	var colors = ["#d6e685", "#b7d174", "#98bc64", "#7aa754", "#5b9243", "#3c7d33", "#1e6823"];
	var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	var times = [
		'12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am',
		'12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'
	];

	// Prepare the graph space and its axes.
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
		.attr("class", function(d, i) { return ((i >= 8 && i <= 18) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

	// Prepare the data for d3.
	var data = [];
	var most_active_weekday_hour;
	for (day=0; day<7; day++) {
		for (hour=0; hour<24; hour++) {
			var value = +commits[days[day]][hour];
			var node =
				{
					"day": day,
					"hour": hour,
					"value": value,
				};
			if (!most_active_weekday_hour || value > most_active_weekday_hour.value) {
				most_active_weekday_hour = node;
			}
			data.push(node);
		}
	}
	$('#most_active_weekday_hour').html(
		'(most active: ' + days[most_active_weekday_hour.day] + ' '
		+ times[most_active_weekday_hour.hour] + ')'
	);

	// Create a color scale based on the data.
	var color_scale = d3.scale.quantile()
		.domain([1, buckets - 1, d3.max(data, function (d) { return d.value; })])
		.range(colors);

	// Add tiles to represent the data.
	var cards = svg.selectAll(".hour")
		.data(data);

	cards.enter().append("rect")
		.attr("x", function(d) { return d.hour * grid_size; })
		.attr("y", function(d) { return d.day * grid_size; })
		.attr("rx", 4)
		.attr("ry", 4)
		.attr("class", "hour bordered")
		.attr("width", grid_size)
		.attr("height", grid_size)
		.style("fill", function(d) { return d.value == 0 ? '#fff' : color_scale(d.value); })
		.append("title")
		.text(function(d) { return d.value + (d.value == 1 ? ' commit' : ' commits'); });

	cards.exit().remove();

	// Add the legend below the graph.
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
