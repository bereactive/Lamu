/**
 * Message List View
 *
 * @module     MessageListView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['App', 'marionette', 'handlebars','underscore',
		'views/messages/MessageListItemView',
		'text!templates/messages/MessageList.html',
		'mixin/PageableViewBehavior'
	],
	function( App, Marionette, Handlebars, _,
		MessageListItemView,
		template,
		PageableViewBehavior
	)
	{
		return Marionette.CompositeView.extend(
		{
			template: Handlebars.compile(template),
			modelName: 'messages',
			initialize: function()
			{
			},

			itemView: MessageListItemView,
			itemViewOptions: {},

			itemViewContainer: '.list-view-message-list',

			events:
			{
				'click .js-list-view-select' : 'showHideBulkActions',
				'change #filter-source' : 'updateMessageSource',
				'click .js-submit-search' : 'updateSearchTerm',
				'click .js-message-filter-box' : 'filterByBoxType',
				'click .js-message-reply' : 'toggleReply',
				'click .js-message-activity' : 'toggleMessageActivity',
				'click .excerpt, .show-rest-of-message' : 'showRestOfMessage',
				'click .card-actions-list__item a' : 'toggleActiveClass',
				'click .js-location-autofill' : 'autofillLocation',
				'click .js-more-info-autofill' : 'autofillMoreInfo'
			},

			behaviors: {
				PageableViewBehavior: {
					behaviorClass : PageableViewBehavior,
					modelName: 'messages',
				}
			},

			showHideBulkActions : function ()
			{
				var $checked = this.$('.js-list-view-select input[type="checkbox"]:checked');

				if ($checked.length > 0)
				{
					this.$('.js-list-view-bulk-actions').removeClass('visually-hidden');
					this.$('.js-list-view-bulk-actions').addClass('visible');
				}
				else
				{
					this.$('.js-list-view-bulk-actions').removeClass('visible');
					this.$('.js-list-view-bulk-actions').addClass('visually-hidden');
				}
			},

			serializeData : function ()
			{
				var data = { items: this.collection.toJSON() };
				data = _.extend(data, {
					pagination: this.collection.state,
					sortKeys: this.collection.sortKeys,
					sourceTypes: this.collection.sourceTypes,
					boxTypes: this.collection.boxTypes,
					modelName : this.modelName
				});

				return data;
			},
			updateMessageSource : function (e)
			{
				e.preventDefault();

				var source = this.$('#filter-source').val();
				App.Collections.Messages.setFilterParams({
						type : source
					});
			},
			updateSearchTerm : function(e)
			{
				e.preventDefault();

				var search = this.$('.js-message-search-input').val();
				App.Collections.Messages.setFilterParams({
						q : search
					});
			},
			filterByBoxType : function(e)
			{
				e.preventDefault();

				var $el = this.$(e.currentTarget),
					box = $el.attr('data-box-name'),
					params = App.Collections.Messages.setFilterParams({
						box : box
					});

				$el.closest('.js-filter-categories-list')
					.find('li')
						.removeClass('active')
						.find('.message-type > span').addClass('visually-hidden')
						.end()
					.filter('li[data-box-name="' + box + '"]')
						.addClass('active')
						.find('.message-type > span').removeClass('visually-hidden');

				this.$('.js-message-search-input').val(params.q);
			},
			toggleReply : function(e)
			{
				e.preventDefault();
				this.$(e.currentTarget).closest('.card-actions-wrapper').nextAll('.js-card-panel-reply').slideToggle(200);
			},
			toggleMessageActivity : function(e)
			{
				e.preventDefault();
				this.$(e.currentTarget).closest('.card-actions-wrapper').nextAll('.js-card-panel-activity').slideToggle(200);
			},
			showRestOfMessage : function(e)
			{
				e.preventDefault();

				this.$(e.currentTarget).closest('.card__excerpt-wrapper').not('.js-selected .card__excerpt-wrapper').toggleClass('show');

				var target = this.$(e.currentTarget).closest('.card__excerpt-wrapper');

				if (target.hasClass('show')) {
					target.find('.elipsis').hide();
					target.find('.rest-of-message').delay(100).fadeIn(200);
					target.parent('.card').prevAll('.js-card-panel-map').slideToggle(200);
				}
				else {
					target.find('.elipsis').delay(300).show(0); //.show(0) is required for delay to work
					target.find('.rest-of-message').fadeOut(200);
					target.parent('.card').prevAll('.js-card-panel-map').slideToggle(200);
				}
			},
			toggleActiveClass : function(e)
			{
				e.preventDefault();

				this.$(e.currentTarget).toggleClass('active');
			},
			autofillLocation : function(e)
			{
				e.preventDefault();

				this.$(e.currentTarget);
				this.$('.textarea').val('Greensboro, NC');
			},
			autofillMoreInfo : function(e)
			{
				e.preventDefault();

				this.$(e.currentTarget);
				this.$('.textarea').val('Thank you for the message. More information is needed, please provide details.');
			}
		});
	});
