/**
 * Post Detail
 *
 * @module     PostDetailView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['underscore', 'App', 'handlebars', 'views/PostItemView', 'text!templates/PostDetail.html', 'ddt'],
	function(_, App, Handlebars, PostItemView, template, ddt)
	{
		Handlebars.registerHelper('formField', function(key, field, form_id)
		{
			var
				form = App.Collections.Forms.get(form_id),
				attribute = form.getAttribute(key),
				output = '',
				i;

			ddt.log('PostDetailView', 'Helper formField, attribute', attribute);

			output += attribute.label + ': ';
			if (_.isArray(field))
			{
				for (i = 0; i < field.length; i++)
				{
					output += field[i].id + ' ' + field[i].value + ', ';
				}
			}
			else if (_.isObject(field))
			{
				for (i in field)
				{
					output += i + ': ' + field[i] + '; ';
				}
			}
			else
			{
				output += field;
			}

			return output;
		});

		return PostItemView.extend(
		{
			//Template HTML string
			template: Handlebars.compile(template),

			modelEvents: {
				'sync': 'render',
				'destroy' : 'handleDeleted'
			},

			handleDeleted : function()
			{
				// Redirect user to previous page (probably post list)
				// @todo does this always make sense?
				window.history.back();
			}

		});
	});
