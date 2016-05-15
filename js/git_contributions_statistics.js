$(document).ready(
	function()
	{
		// Retrieve git contribution information.
		$.getJSON('/data/git_contributions.json')
			.done(
				function(json)
				{
					// Commits by month.
					$('#commits_total').html( '(' + d3.format(",d")(json.commits_total) + ' commits)' );
					display_commits_by_month(json.commits_by_month);

					// Commits by day.
					$('#total_days').html( '(' + Object.keys(json.commits_by_day).length + ' active days)' );
					display_commits_by_day(json.commits_by_day);

					// Commits by weekday and hour.
					display_commits_by_weekday_hour(json.commit_by_weekday_hour);

					// Commits by language.
					display_commits_by_language(json.lines_by_language);

					// Lines by month.
					display_lines_by_month(json.lines_by_month);
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


/**
 * Display lines added/deleted by month.
 *
 * @param {json} data - The data to display.
 */
function display_lines_by_month(data) {
	var series = ['deleted', 'added'];
	var margin = {top: 10, right: 20, bottom: 10, left: 60};
	var width = 960 - margin.left - margin.right;
	var height = 400 - margin.top - margin.bottom;
	var center_space = 40;

	var svg = d3.select("#lines_changed_by_month").append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Calculate total lines added/deleted for the header.
	var format_lines_count = d3.format(",d");
	var total_lines_added = d3.sum(data, function(d) { return +d.added; });
	var total_lines_deleted = d3.sum(data, function(d) { return +d.deleted; });
	$('#total_lines_changed').html(
		'(total: +' + format_lines_count(total_lines_added)
		+ ' -' + format_lines_count(total_lines_deleted) + ')'
	);

	// Set up X scale and axis.
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1)
		.domain(data.map(function(d) { return d.month; }));

	var x_axis = d3.svg.axis()
		.scale(x)
		.tickFormat(function(d) {
			return /^Jan-/.test(d)
				? d.replace('Jan-','')
				: '';
		})
		.tickValues(x.domain().filter(function(d, i) { return /^Jan-/.test(d); }));

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height-center_space)/2 + ")")
		.call(x_axis.orient("bottom"))
		.selectAll("text")
			.attr("y", 16)
			.style("text-anchor", "middle");

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height+center_space)/2 + ")")
		.call(x_axis.orient("top"))
		.selectAll("text")
			.style("display", "none");

	// Determine the max lines added/deleted across the month range.
	// This allows giving each graph (lines added, lines deleted) the same scale.
	var max_changed_lines = Math.max(
		d3.max(data, function(d) { return +d.added; }),
		d3.max(data, function(d) { return +d.deleted; })
	);

	// Set up scale and axis for lines added.
	var y_added = d3.scale.linear()
		.range([(height-center_space)/2, 0])
		.domain([0, max_changed_lines]);

	var y_axis_added = d3.svg.axis()
		.scale(y_added)
		.orient("left")
		.ticks(5)
		.tickFormat(d3.format("s"));

	svg.append("g")
		.attr("class", "y axis lines_added")
		.call(y_axis_added);

	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.attr("x", -(height)/4)
		.attr("y", -40)
		.attr("class", "lines_added")
		.text("Lines added");

	// Set up scale and axis for lines deleted.
	var y_deleted = d3.scale.linear()
		.range([(height+center_space)/2, height])
		.domain([0, max_changed_lines]);

	var y_axis_deleted = d3.svg.axis()
		.scale(y_deleted)
		.orient("left")
		.ticks(5)
		.tickFormat(d3.format("s"));

	svg.append("g")
		.attr("class", "y axis lines_deleted")
		.call(y_axis_deleted);

	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.attr("x", -(height)/4*3)
		.attr("y", -40)
		.attr("class", "lines_deleted")
		.text("Lines deleted");

	// Display bars.
	svg.selectAll(".bar_added")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar_added lines_added")
		.attr("x", function(d) { return x(d.month); })
		.attr("width", x.rangeBand())
		.attr("y", function(d) { return y_added(d.added); })
		.attr("height", function(d) { return (height-center_space)/2 - y_added(d.added); })
		.append("title")
			.text(function(d) { return d.month.replace('-', ' ') + ': ' + format_lines_count(d.added) + ' line' + (d.added==1 ? '' : 's'); });

	svg.selectAll(".bar_deleted")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar_deleted lines_deleted")
		.attr("x", function(d) { return x(d.month); })
		.attr("width", x.rangeBand())
		//.attr("y", function(d) { return y_deleted(d.deleted); })
		//.attr("height", function(d) { return (height+center_space)/2 + y_deleted(d.deleted); })
		.attr("height", function(d) { return y_deleted(d.deleted)-(height+center_space)/2; })
		.attr("y", function(d) { return (height+center_space)/2+1; })
		.append("title")
			.text(function(d) { return d.month.replace('-', ' ') + ': ' + format_lines_count(d.deleted) + ' line' + (d.deleted==1 ? '' : 's'); });
}


/**
 * Display commits by language
 *
 * @param {json} data - The data to display.
 */
function display_commits_by_language(data) {
	var margins =
	{
		"left": 60,
		"right": 30,
		"top": 30,
		"bottom": 35
	};

	var width = 960;
	var height = 500;

	// Prepare data.
	data = d3
		.entries(data)
		.map(
			function(d) {
				d.lines_added = d.value.added;
				d.lines_deleted = d.value.deleted;
				d.commits = d.value.commits;
				d.language = d.key;
				delete d.value;
				delete d.key;
				return d;
			}
		)
		.filter(
			function(d) {
				return !d.language.match(/^Text$/);
			}
		);
	$('#total_languages').html('(' + data.length + ' found)');

	// Ordinal color scale.
	var colors = d3.scale.category10();

	var svg = d3.select("#commits_by_language").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
			.attr("transform", "translate(" + margins.left + "," + margins.top + ")");

	// X-axis scale.
	var x = d3.scale.log()
		.domain([1, d3.max(data, function (d) { return d.lines_added; })])
		.clamp(true)
		.range([0, width - margins.left - margins.right]);

	// Y-axis scale.
	var y = d3.scale.log()
		.domain([1, d3.max(data, function (d) { return d.lines_deleted; })])
		.clamp(true)
		.range([height - margins.top - margins.bottom, 0]);

	// Circle radius scale.
	var r = d3.scale.log()
		.domain(d3.extent(data, function(d) { return d.commits; }))
		.range([5,25]);

	// X-axis label.
	svg.append("text")
		.attr("text-anchor", "end")
		.attr("x", width / 2)
		.attr("y", height - 30)
		.text("Lines added");

	// Y-axis label.
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.attr("x", -(height-60)/2)
		.attr("y", -40)
		.text("Lines deleted");

	// Define X and Y axis.
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickPadding(2)
		.tickFormat(
			function (d) {
				return x.tickFormat(10,d3.format(",s"))(d)
			}
		);
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickPadding(2)
		.tickFormat(
			function (d) {
				return y.tickFormat(10,d3.format(",s"))(d)
			}
		);

	// Add axis to the graph.
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + y.range()[0] + ")")
		.call(xAxis);

	// Function to format numbers with a separator for thousands.
	var format_thousands = d3.format(",d");

	// Add points.
	var points = svg.selectAll("g.node")
		.data(
			data,
			function (d) { return d.language; }
		);
	var pointsGroup = points.enter()
		.append("g")
		.attr("class", "node")
		.attr('transform', function (d) { return "translate(" + x(d.lines_added) + "," + y(d.lines_deleted) + ")"; });
	pointsGroup
		.append("circle")
		.attr("r", function(d){ return r(d.commits); })
		.attr("class", "dot")
		.style("fill", function (d) { return colors(d.commits); });
	pointsGroup
		.append("text")
		.style("text-anchor", "middle")
		.attr("dy", -10)
		.text(function (d) { return d.language; });
	pointsGroup
		.append("title")
		.text(
			function(d) {
				return d.language + ': +' + format_thousands(d.lines_added) + " -"
					+ format_thousands(d.lines_deleted) + ' lines and '
					+ format_thousands(d.commits) + ' commit(s)';
			}
		);
}


/**
 *  Display commits by month.
 *
 * @param {json} data - The data to display.
 */
function display_commits_by_month(data)
{
	var margin = {top: 10, right: 20, bottom: 40, left: 40};
	var width = 960 - margin.left - margin.right;
	var height = 300 - margin.top - margin.bottom;

	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1)
		.domain(data.map(function(d) { return d.month; }));

	var y = d3.scale.linear()
		.range([height, 0])
		.domain([0, Math.round((d3.max(data, function(d) { return +d.commits; })+1)/50)*50  ]);

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
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.month); })
		.attr("width", x.rangeBand())
		.attr("y", function(d) { return y(d.commits); })
		.attr("height", function(d) { return height - y(d.commits); })
		.append("title")
			.text(function(d) { return d.month.replace('-', ' ') + ': ' + d.commits + ' commit' + (d.commits==1 ? '' : 's'); });
}


/**
 * Display commits by day.
 *
 * @param {json} data - The data to display.
 */
function display_commits_by_day(data)
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
	var max_commits_in_a_day = d3.max(d3.values(data));
	var color = d3.scale.quantize()
		.domain([0, Math.log(max_commits_in_a_day+1)])
		.range(d3.range(4).map(function(d) { return "q" + d + "-11"; }));

	// Determine the years to display.
	var years = d3.keys(data).map(function(d){return parseInt(d.split('-')[0])});

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
	rect.filter(function(d) { return d in data; })
		.attr("class", function(d) { return "day " + color(Math.log(data[d]+1)); })
		.select("title")
		.text(function(d) { commits = data[d]; return d + ": " + commits + ' commit' + (commits == 1 ? '' : 's'); });
}


/**
 * Display commits by day of the week and by hour.
 *
 * @param {json} data - The data to display.
 */
function display_commits_by_weekday_hour(data)
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
	var formatted_data = [];
	var most_active_weekday_hour;
	for (day=0; day<7; day++) {
		for (hour=0; hour<24; hour++) {
			var value = +data[days[day]][hour];
			var node =
				{
					"day": day,
					"hour": hour,
					"value": value,
				};
			if (!most_active_weekday_hour || value > most_active_weekday_hour.value) {
				most_active_weekday_hour = node;
			}
			formatted_data.push(node);
		}
	}
	$('#most_active_weekday_hour').html(
		'(most active: ' + days[most_active_weekday_hour.day] + ' '
		+ times[most_active_weekday_hour.hour] + ')'
	);

	// Create a color scale based on the data.
	var color_scale = d3.scale.quantile()
		.domain([1, buckets - 1, d3.max(formatted_data, function (d) { return d.value; })])
		.range(colors);

	// Add tiles to represent the data.
	var cards = svg.selectAll(".hour")
		.data(formatted_data);

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
