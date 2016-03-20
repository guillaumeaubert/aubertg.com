$(document).ready(
	function()
	{
		// Create table of CPAN distributions.
		$('#cpan_distributions').createDistributionsList(
			{
				pause_id: "AUBERTG",
				github_id: "guillaumeaubert",
			}
		);
	}
);
