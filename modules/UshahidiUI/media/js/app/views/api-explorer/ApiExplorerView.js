/**
 * API Explorer View
 *
 * @module     ApiExplorerView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['App', 'modules/config', 'marionette', 'handlebars','underscore', 'alertify', 'syntaxhighlightjson',
	'text!templates/api-explorer/ApiExplorerView.html'],
	function( App, config, Marionette, Handlebars, _, alertify, syntaxHighlightJson, template)
	{
		return Marionette.ItemView.extend(
		{
			template: Handlebars.compile(template),
			apiBaseUrl : config.get('apiurl') +'/',

			events:
			{
				'click .js-api-endpoint' : 'endpointClick',
				'submit .js-api-explorer-form' : 'submitForm'
			},

			modelEvents :
			{
				'change' : 'render'
			},

			// Handle endpoint clicks
			endpointClick : function(e)
			{
				e.preventDefault();
				var $el = this.$(e.currentTarget),
					endpoint = $el.data('endpoint'),
					requestMethod = $el.data('method'),
					extraData = $el.data('extradata') || {};

				// Initialize the input field with the clicked endpoint
				this.$('.js-api-url').val(endpoint);

				// Change to the selected request method
				this.$('.js-request-method').val(requestMethod).change();

				this.executeRequest( endpoint, requestMethod, extraData);

			},

			// Make a call to the API
			executeRequest : function(apiUri, requestMethod, extraData)
			{
				var that = this;

				that.hideResponse();
				// Mostly borrowed from the api-explorer main.js file
				App.oauth.ajax({
					url : this.apiBaseUrl + apiUri,
					type: requestMethod,
					dataType : 'json',
					data : extraData
				}).done(function(data,jqXHR) {

					if (data) {
						that.model.set('data', JSON.stringify(data,undefined, 4));
						that.$('.js-response-code').syntaxHighlightJson(that.model.get('data'));
					} else {
						that.model.set('data','Server returned no data. (HTTP Status Code: ' + jqXHR.status + ' – ' + jqXHR.statusText + ')');
						that.$('.js-response-code').append(that.model.get('data'));
					}

					// Re-initialize param input field with the submitted API URI.
					// The field gets cleared after a successfull submission. Not ideal,
					// maintain it so it can be easily manipulated for subsequent API calls.
					that.$('.js-api-url').val(apiUri);

					that.showResponse();
				}).fail(function(jqXHR) {
					that.model.set('data',jqXHR.responseText ? JSON.parse(jqXHR.responseText) : {});
					that.$('.js-response-code').syntaxHighlightJson(that.model.get('data'));
					that.$('.js-api-url').val(apiUri);
					that.showResponse();
				});
			},

			submitForm : function(e)
			{
				e.preventDefault();
				var url = this.$('.js-api-url').val(),
					requestMethod = this.$('.js-request-method').val();
				this.executeRequest( url, requestMethod, {});
			},

			showResponse : function()
			{
				// Show response
				this.$('.js-show-response').removeClass('visually-hidden');

				// Hide loading spinner
				this.$('i.js-loading').addClass('visually-hidden');
			},

			hideResponse : function()
			{
				// Hide response
				this.$('.js-show-response').addClass('visually-hidden');

				// Show loading spinner
				this.$('i.js-loading').removeClass('visually-hidden');
			},

			serializeData : function ()
			{
				var data = {
					apiBaseUrl : this.apiBaseUrl
				};
				return data;
			}
		});
	});
