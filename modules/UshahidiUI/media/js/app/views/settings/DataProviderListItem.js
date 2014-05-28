/**
 * Tag List Item View
 *
 * @module     UserListItemView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['App','handlebars', 'marionette', 'text!templates/settings/DataProviderListItem.html'],
	function(App,Handlebars, Marionette, template)
	{
		//ItemView provides some default rendering logic
		return Marionette.ItemView.extend(
		{
			//Template HTML string
			template: Handlebars.compile(template),
			tagName: 'li',
			className: 'list-view-data-provider  data-provider-card__list-item',

			// Value to track if checkbox for this post has been selected
			selected : false,
			events: {
				'click .js-provider-status' : 'disableCard'
			},

			initialize: function()
			{
				// Refresh this view when there is a change in this model
				this.listenTo(this.model,'change', this.render);
			},

			modelEvents: {
				'sync': 'render'
			},

			showEdit : function (e)
			{
				e.preventDefault();
				App.vent.trigger('data-provider:edit', this.model);
			},
			disableCard : function (e)
			{
				e.preventDefault();

				this.$el.toggleClass('disabled');

				if ( this.$el.hasClass('disabled') ) {
					this.$('.js-provider-status').text('Enable');
				}
				else {
					this.$('.js-provider-status').text('Disable');
				}
			}
		});
	});
