/**
 * Handlebars Helpers
 *
 * @module     App.handlebars
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['handlebars', 'moment', 'modules/config', 'underscore.string', 'handlebars-paginate', 'text!templates/partials/pagination.html', 'text!templates/partials/list-info.html', 'text!templates/partials/tag-with-icon.html'],
	function(Handlebars, moment, config, _str, paginate, paginationTpl, listInfoTpl, tagWithIconTpl)
	{
		Handlebars.registerHelper('baseurl', function()
		{
			return config.get('baseurl');
		});

		Handlebars.registerHelper('url', function(url)
		{
			return config.get('baseurl')  + url;
		});

		Handlebars.registerHelper('imageurl', function(url)
		{
			return config.get('baseurl') + config.get('imagedir') +  '/' + url;
		});

		Handlebars.registerHelper('datetime-fromNow', function(timestamp)
		{
			return moment(timestamp).fromNow();
		});

		Handlebars.registerHelper('datetime-calendar', function(timestamp)
		{
			return moment(timestamp).calendar();
		});

		Handlebars.registerHelper('datetime', function(timestamp)
		{
			return moment(timestamp).format('LLL');
		});

		Handlebars.registerHelper('prune', function(text, length)
		{
			return _str.prune(text, length);
		});

		Handlebars.registerHelper('paginate', paginate);

		/**
		 * Based on newLineToBR here: https://github.com/elving/swag/blob/master/lib/swag.js
		 **/
		Handlebars.registerHelper('newLineToBr', function(options)
		{
			var str;

			// Has this helper been used directly or as a block helper?
			if (typeof options === 'string')
			{
				str = Handlebars.Utils.escapeExpression(options);
			}
			else
			{
				str = options.fn(this);
			}

			return new Handlebars.SafeString(str.replace(/\r?\n|\r/g, '<br>'));
		});

		Handlebars.registerHelper('feature', function (feature, options)
		{
			var App = require ('App');
			return App.feature(feature) ? options.fn(this) : '';
		});

		Handlebars.registerPartial('pagination', Handlebars.compile(paginationTpl));
		Handlebars.registerPartial('listinfo', Handlebars.compile(listInfoTpl));
		Handlebars.registerPartial('tag-with-icon', Handlebars.compile(tagWithIconTpl));

		return Handlebars;
	});
