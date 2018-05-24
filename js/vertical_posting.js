$(document).ready(function(){
	$('#config ul input[type="radio"]').change(redraw);
	$('#text').keyup(redraw);
});

function redraw() {
	var text = $('#text').val();
	var output = '';
	if (text.length > 0) {
		var style = $('input[name=style]:checked').val();
		switch (style) {
			case 'vtop':
				output = text + "\n" +
					text.split('').slice(1).join("\n");
				break;
			case 'vbottom':
				var padding = ' '.repeat(text.length - 1)
				output = text
					.split('')
					.slice(0, -1)
					.map(x => padding + x)
					.join("\n");
				output += "\n" + text;
				break;
			case 'plus':
				var intersect = Math.floor((text.length + 1) / 2);
				var padding = ' '.repeat(intersect - 1);
				var rows = text
					.split('')
					.map(x => padding + x);
				rows[intersect - 1] = text;
				output = rows.join("\n");
				break;
			case 'stairs':
				for (var i = 0; i < 5; i++) {
					var padding = ' '.repeat(i * 3)
					output += padding + text + "\n\n";
				}
				break;
			case 'slinky':
				for (var i = 0; i < 5; i++) {
					var reversed = text.split('').reverse().join('');
					var padding = ' '.repeat(i * (text.length - 1))
					var vtext = text
						.split('')
						.slice(i == 0 ? 0 : 1, -1)
						.map(x => padding + x)
						.join("\n");
					if (vtext.length > 0) {
						output += vtext + "\n";
					}
					output += padding + reversed + "\n";
				}
				break;
			case 'nestedv':
				output = nest(text, 5).join("\n");
				break;
			case 'square':
				switch (text.length) {
					case 1:
						output = text;
						break;
					case 2:
						output = text + "\n" + text.split('').reverse().join('');
						break;
					default:
						var padding = ' '.repeat(text.length - 2)
						output = text + "\n";
						output += text
							.split('')
							.slice(1, -1)
							.map(x => x + padding + x)
							.join("\n");
						output += "\n" + text;
						break;
				}
				break;
		}
	}
	output = output
		.replace(/ /g, '&nbsp;')
		.replace(/\n/g, '<br/>');
	$('#canvas').html(output);
}

function nest(text, i) {
	if (i == 0) {
		return [];
	}

	var nested = nest(text, i - 1);
	var rows = [text].concat(text.split('').slice(1));
	if (rows.length < 2) {
		rows[1] = ' ';
	}

	for (var j = 2; j < Math.max(nested.length + 2, rows.length); j++) {
		if (j >= rows.length) {
			rows[j] = ' ';
		}

		if (j < nested.length + 2) {
			rows[j] += '  ' + nested[j - 2];
		}
	}

	return rows;
}
