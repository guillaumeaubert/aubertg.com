$(document).ready(
	function()
	{
		// Retrieve git contribution information.
		$.getJSON('/data/git_contributions.json')
			.done(
				function(json)
				{
					// Display monthly commits.
					display_monthly_commits(json.monthly_commits);
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

function display_monthly_commits(commits)
{
	// Prepare the data for display.
	var commit_labels = [];
	var commit_numbers = [];
	$.each(
		commits,
		function(i, item)
		{
			commit_labels.push(
				/^Jan-/.test(item.month)
				? item.month.replace('Jan-','')
				: ''
			);
			commit_numbers.push(item.commits);
		}
	);

	// Create chart of commits.
	var commits_chart =
		new Chart(
			document.getElementById("commits_chart").getContext("2d")
		).Line(
			{
				labels: commit_labels,
				datasets:
				[
					{
						label: "Commits by date",
						fillColor: "rgba(198,217,241,0.5)",
						strokeColor: "rgba(23,54,93,1)",
						pointColor: "rgba(23,54,93,0)",
						pointStrokeColor: "rgba(23,54,93,0)",
						pointHighlightFill: "rgba(23,54,93,0)",
						pointHighlightStroke: "rgba(220,220,220,0)",
						data: commit_numbers
					},
				]
			},
			{
				pointHitDetectionRadius: 2,
				datasetStroke: false,
				showTooltips: false,
				scaleOverride: true,
				scaleSteps: 6,
				scaleStepWidth: 50,
				scaleStartValue: 0
			}
		);
}
