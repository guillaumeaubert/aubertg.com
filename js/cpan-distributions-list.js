/*! CPAN Distributions List - v0.1.0 - 2013-06-23
* https://github.com/guillaumeaubert/jquery-cpan-distributions-list
* Copyright (c) 2013 Guillaume Aubert; Licensed GPLv3 */
(
	function ( $ )
	{
		$.fn.createDistributionsList = function( options )
		{
			var container = this;
			
			// Parse options and add defaults if needed.
			var settings = $.extend(
				{
					pause_id: 'AUBERTG',
					github_id: 'guillaumeaubert',
					coveralls: true,
					travis_ci: true,
					repositories: {},
					repository_lowercase: false,
					template_row: this.find('tr.template:first')
				},
				options
			);
			
			// Retrieve the distribution information from MetaCPAN.
			$.ajax(
				{
					type: 'GET',
					async: true,
					dataType: "json",
					url: "http://api.metacpan.org/v0/release/_search?q=author:"+settings.pause_id+"%20AND%20status:latest&fields=version,distribution,date&size=100&sort=distribution",
					success: function(json)
					{
						if ( json.timed_out === 'false')
						{
							alert('MetaCPAN timed out (' + json.timed_out + ')!');
							return;
						}
						if ( json.hits.total === 0 )
						{
							alert('MetaCPAN returned no distributions for this author!');
							return;
						}
						
						// Display each distribution.
						json.hits.hits.forEach(
							function(element, index)
							{
								display_distribution(
									index,
									element.fields.distribution,
									element.fields.version,
									element.fields.date
								);
							}
						);
						
						// Callback for success, if needed.
						if ( settings.on_success )
						{
							settings.on_success( json );
						}
					},
					error: function(xhr)
					{
						alert('Error: ' + xhr.statusText);
					}
				}
			);
			
			function display_distribution(index, distribution, version, date)
			{
				// Sometimes, the repository name does not match the distribution.
				var repository = settings.repositories[distribution]
					? settings.repositories[distribution]
					: settings.repository_lowercase
						? distribution.toLowerCase()
						: distribution;
				
				// Gather all the data that we will use to build the table.
				var data =
				{
					distribution: distribution,
					version: version,
					date: date,
					travis_status_badge:
						settings.travis_ci
							? $('<a>')
								.attr('href', 'https://travis-ci.org/'+settings.github_id+'/'+repository)
								.html(
									$('<img>')
										.attr('src', 'https://travis-ci.org/'+settings.github_id+'/'+repository+'.png?branch=master')
										.attr('alt', 'Build Status')
								)
							: '',
					coveralls_badge:
						settings.coveralls
							? $('<a>')
								.attr('href', 'https://coveralls.io/r/'+settings.github_id+'/'+repository+'?branch=master')
								.html(
									$('<img>')
										.attr('src', 'https://coveralls.io/repos/'+settings.github_id+'/'+repository+'/badge.png?branch=master')
										.attr('alt', 'Coverage Status')
								)
							: '',
					github: $('<a>')
						.attr('href', 'https://github.com/'+settings.github_id+'/'+repository)
						.html('GitHub'),
					metacpan: $('<a>')
						.attr('href', 'https://metacpan.org/release/'+distribution)
						.html('MetaCPAN'),
					cpants: $('<a>')
						.attr('href', 'http://cpants.cpanauthors.org/dist/'+distribution)
						.html('CPANTS')
				};
				
				// Clone row.
				var tr = settings.template_row.clone();
				
				// Add information to the row.
				for ( var key in data )
				{
					tr.find('.'+key).html( data[key] );
				}
				tr.css('display', '');
				tr.attr('id', 'row_'+index);
				tr.addClass('distribution');
				tr.removeClass('template');
				
				// Append the row at the end of the table.
				container.find('tbody:last').append(tr);
			}
		};
	} ( jQuery )
);
