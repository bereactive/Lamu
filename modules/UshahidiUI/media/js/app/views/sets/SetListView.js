/**
 * Sets List View
 *
 * @module     SetLitView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['App', 'marionette', 'handlebars','underscore',
		'views/sets/SetListItemView',
		'text!templates/sets/SetList.html',
		'mixin/PageableViewBehavior'
	],
	function(App, Marionette, Handlebars, _,
		SetListItemView,
		template,
		PageableViewBehavior
	)
	{

		return Marionette.CompositeView.extend(
		{
			template: Handlebars.compile(template),
			modelName: 'sets',

			initialize: function()
			{
			},

			itemView: SetListItemView,
			itemViewOptions: {},

			itemViewContainer: '.sets-grid',

			events:
			{
			},

			collectionEvents :
			{
			},

			behaviors: {
				PageableViewBehavior: {
					behaviorClass : PageableViewBehavior,
					modelName : 'sets'
				}
			},

			serializeData : function ()
			{
				var data = { items: this.collection.toJSON() };
				data = _.extend(data, {
					pagination: this.collection.state,
					sortKeys: this.collection.sortKeys,
					modelName : this.modelName
				});

				return data;
			},

		});

	});