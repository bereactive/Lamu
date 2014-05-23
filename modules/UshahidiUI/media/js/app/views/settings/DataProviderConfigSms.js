/**
 * Data Sources
 *
 * @module     DataSources
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

 // FIXME: temp js file for sms hard coding

define(['App', 'marionette', 'handlebars', 'underscore', 'text!templates/settings/DataProviderConfigSms.html', 'forms/UshahidiForms'],
	function(App, Marionette, Handlebars, _, template, BackboneForm)
	{
		return Marionette.CompositeView.extend(
		{
			template: Handlebars.compile(template),
			initialize: function ()
			{
				// Set up the form
				this.form = new BackboneForm({
					model: this.model,
					idPrefix : 'post-',
					className : 'create-post-form',
					//fieldsets : _.result(this.model, 'fieldsets')
					});

				ddt.log('DataProviderConfig', 'model', this.model);
			},
			onDomRefresh : function()
			{
				// Render the form and add it to the view
				this.form.render();

				// Set form id, backbone-forms doesn't do it.
				this.form.$el.attr('id', 'data-provider-config-form');

				this.$('.js-form').append(this.form.el);
			},
		});
	});
