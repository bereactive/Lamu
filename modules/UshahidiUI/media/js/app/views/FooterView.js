/**
 * Footer View
 *
 * @module     FooterView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['marionette', 'handlebars', 'App', 'modules/config', 'text!templates/Footer.html'],
	function(Marionette, Handlebars, App, config, template)
	{
		return Marionette.ItemView.extend(
		{
			template : Handlebars.compile(template),
			initialize: function() {
				App.vent.on('config:change', this.render, this);
			},
			serializeData : function()
			{
				return {
					site_name : config.get('site').site_name,
					owner_name : config.get('site').owner_name
				};
			}
		});
	});
