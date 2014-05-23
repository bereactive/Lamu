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
			className: 'list-view-data-provider',

			// Value to track if checkbox for this post has been selected
			selected : false,
			events: {
				'click .js-data-provider-edit' : 'showEdit',
				'click .js-data-provider-card__list-item' : 'disableCard'
			},

			initialize: function()
			{
				// Refresh this view when there is a change in this model
				this.listenTo(this.model,'change', this.render);
			},

			modelEvent: {
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

				this.$(e.currentTarget);
				this.$(e.currentTarget).find('.data-provider-card').toggleClass('disabled');

				var $el = this.$(e.currentTarget).find('.data-provider-card');

				if ( $el.hasClass('disabled') ) {
					this.$(e.currentTarget).find('.data-provider-status').text('Enable');
				}
				else {
					this.$(e.currentTarget).find('.data-provider-status').text('Disable');
				}
			}
		});
	});
