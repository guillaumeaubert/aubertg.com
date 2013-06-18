$(document).ready(
	function()
	{
		$.ajax(
			{
				type: 'GET',
				async: true,
				dataType: "json",
				url: "http://api.metacpan.org/v0/release/_search?q=author:AUBERTG%20AND%20status:latest&fields=version,distribution,date&size=100&sort=distribution",
				success: function(json)
				{
					if ( json.timed_out == 'false')
					{
						alert('MetaCPAN timed out (' + json.timed_out + ')!');
						return;
					}
					if ( json.hits.total == 0 )
					{
						alert('MetaCPAN returned no distributions for this author!');
						return;
					}
					
					json.hits.hits.forEach(
						function(element, index, array)
						{
							display_distribution(
								index,
								element.fields.distribution,
								element.fields.version,
								element.fields.date
							);
						}
					);
				},
				error: function(xhr)
				{
					alert('Error: ' + xhr.statusText);
				}
			}
		);
	}
);

function display_distribution(index, distribution, version, date)
{
	var tr = $('#template_row').clone();
	var data =
	{
		distribution: distribution,
		version: version,
		date: date,
		travis_status_badge:
			$('<a>')
				.attr('href', 'https://travis-ci.org/guillaumeaubert/'+distribution)
				.html(
					$('<img>')
						.attr('src', 'https://travis-ci.org/guillaumeaubert/'+distribution+'.png?branch=master')
						.attr('alt', 'Build Status')
				),
		coveralls_badge:
			$('<a>')
				.attr('href', 'https://coveralls.io/r/guillaumeaubert/'+distribution+'?branch=master')
				.html(
					$('<img>')
						.attr('src', 'https://coveralls.io/repos/guillaumeaubert/'+distribution+'/badge.png?branch=master')
						.attr('alt', 'Coverage Status')
				),
		github: $('<a>')
			.attr('href', 'https://github.com/guillaumeaubert/'+distribution)
			.html('GitHub'),
		metacpan: $('<a>')
			.attr('href', 'https://metacpan.org/release/'+distribution)
			.html('MetaCPAN'),
		cpants: $('<a>')
			.attr('href', 'http://cpants.cpanauthors.org/dist/'+distribution)
			.html('CPANTS')
	};
	
	for ( var key in data )
	{
		tr.find('.'+key).html( data[key] );
	}
	tr.css('display', '');
	tr.attr('id', 'row_'+index);
	$('#cpan_distributions > tbody:last').append(tr);
}
