/**
 * Data Provider List
 *
 * @module     DataProviderListView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['App', 'marionette', 'handlebars', 'underscore', 'views/settings/DataProviderListItem', 'views/EmptyView', 'text!templates/settings/DataProviderList.html'],
	function( App, Marionette, Handlebars, _, DataProviderListItem, EmptyView, template)
	{
		return Marionette.CompositeView.extend(
		{
			template: Handlebars.compile(template),

			initialize: function ()
			{},

			itemView: DataProviderListItem,

			itemViewContainer: '.list-view-data-provider-list',

			itemViewOptions:
			{
				emptyMessage: 'No data providers found.',
			},

			emptyView: EmptyView,

			events :
			{
				'click .js-message-config-tab' : 'dataProviderActiveTab',
			},

			dataProviderActiveTab : function(e)
			{

				var $el = this.$(e.currentTarget);

				$el.closest('.js-tab-nav-list')
					.find('li')
						.hasClass('active')
						.removeClass('active');
				$el
					.addClass('active');
			}

		});
	});
