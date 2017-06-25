/***** Config *****/

var username = {
	'github': 'guillaumeaubert',
	'dockerhub': 'aubertg'
};


/***** Prototypes *****/

Array.prototype.intersect = function(array) {
	return $.grep(this, function(i) {
		return $.inArray(i, array) > -1;
	});
};

String.prototype.ucfirst = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}


/***** Supporting functions *****/

function get_badges(repo) {
	badges = new Array();

	var travis_tags = new Array('travis-ci', 'cpan', 'golang', 'jquery-plugin', 'ansible-plugin', 'ruby-gem');
	if (travis_tags.intersect(repo.topics).length > 0) {
		badges.push(
			{
				'link': 'https://travis-ci.org/'+username['github']+'/'+repo.name,
				'badge': 'https://travis-ci.org/'+username['github']+'/'+repo.name+'.svg?branch=master',
				'title': 'Build Status'
			}
		);
	}

	var coveralls_tags = new Array('coveralls', 'cpan', 'jquery-plugin');
	if (coveralls_tags.intersect(repo.topics).length > 0) {
		badges.push(
			{
				'link': 'https://coveralls.io/r/'+username['github']+'/'+repo.name+'?branch=master',
				'badge': 'https://coveralls.io/repos/'+username['github']+'/'+repo.name+'/badge.svg?branch=master',
				'title': 'Coverage Status'
			}
		);
	}

	if ($.inArray('docker-hub', repo.topics) > -1) {
		badges.push(
			{
				'link': 'https://hub.docker.com/r/'+username['dockerhub']+'/'+repo.name+'/builds/',
				'badge': 'https://img.shields.io/docker/build/'+username['dockerhub']+'/'+repo.name+'.svg',
				'title': 'Docker Build Status'
			}
		);
	}

	if ($.inArray('golang', repo.topics) > -1) {
		badges.push(
			{
				'link': 'https://goreportcard.com/report/github.com/'+username['github']+'/'+repo.name,
				'badge': 'https://goreportcard.com/badge/github.com/'+username['github']+'/'+repo.name,
				'title': 'Go Report Card'
			}
		);
	}

	if ($.inArray('ruby-gem', repo.topics) > -1) {
		badges.push(
			{
				'link': 'http://inch-ci.org/github/'+username['github']+'/'+repo.name,
				'badge': 'http://inch-ci.org/github/'+username['github']+'/'+repo.name+'.svg?branch=master&style=shields',
				'title': 'Inline Docs'
			}
		);
	}

	return $.map(badges, function(e, i) {
		return $('<a>')
			.attr('href', e.link)
			.append(
				$('<img>')
					.attr('src', e.badge)
					.attr('title', e.title)
			)
	});
}

function get_website(url) {
	if (!url) return;

	var tag = $('<a>')
		.attr('href', url)

	var title = function () {
		switch (tag.prop('hostname')) {
			case 'metacpan.org':
				return 'MetaCPAN';
			case 'hub.docker.com':
				return 'Docker Hub';
			case 'plugins.jquery.com':
				return 'JQuery Plugins';
			case 'rubygems.org':
				return 'RubyGems';
			default:
				return 'Website';
		}
	}
	tag.text(title);

	return tag;
}


/***** Main *****/

$(document).ready(function() {
	$.ajax({
		url: 'https://api.github.com/users/'+username['github']+'/repos?page=1&per_page=1000&sort=pushed',
		async: true,
		dataType: "json",
		type: "GET",
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Accept', 'application/vnd.github.mercy-preview+json');
		},
		success: function(json) {
			json.forEach(function(element, index) {
				if (element.fork) return 1;
				if (element.name.slice(-9) === '_archives') return 1;

				var tr = $('<tr>');

				// Project name and description.
				tr.append(
					$('<td>')
						.addClass('name')
						.text(element.name)
						.attr('title', element.description)
				);

				// Links.
				link = get_website(element.homepage)
				tr.append(
					$('<td>')
						.addClass('links')
						.append(
							$('<a>')
								.attr('href', element.html_url)
								.text('GitHub'),
							link ? $('<span>').text(', ') : null,
							link
						)
				);

				// Last commit.
				tr.append(
					$('<td>')
						.addClass('last-commit')
						.attr('title', new Date(element.pushed_at))
						.text(jQuery.timeago(element.pushed_at).ucfirst())
				);

				// Badges.
				tr.append(
					$('<td>')
						.addClass('badges')
						.append(
							get_badges(element)
						)
				);

				$('#github-projects').find('tbody').append(tr);
			});

			$('#github-projects .loading').hide();
		},
		error: function(xhr) {
			console.log('Error while trying to retrieve the repository information from GitHub: ' + xhr.statusText);
		}
	});
});
