/**
 * Data Provider Model
 *
 * @module     DataProviderModel
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['jquery', 'underscore', 'backbone', 'App'],
	function($, _, Backbone, App) {
		// Map API 'input' to Backbone Forms Fields
		var inputFieldMap = {
			'text' : 'Text',
			'textarea' : 'TextArea',
			'radio' : 'Radio',
			'checkbox' : 'Checkbox',
			'date' : 'Date',
			'datetime' : 'DateTime',
			'select' : 'Select',
			'location' : 'Location',
			'number' : 'Number',
			'file' : 'Text'
		},

		DataProviderModel = Backbone.Model.extend(
		{
			urlRoot: App.config.baseurl + App.config.apiuri + '/dataproviders',
			toString : function ()
			{
				return this.get('name');
			},

			schema : function ()
			{
				var schema = {};

				_.each(this.get('form'), function (element, index) {
					schema['config-'+index] = {
						type : inputFieldMap[element.input] ? inputFieldMap[element.input] : 'Text',
						title : element.label
					};
				});

				ddt.log('DataProviderModel', 'schema', schema);

				return schema;
			},
			// Overriding the parse method to handle nested JSON config
			parse : function (data)
			{
				var key;

				ddt.log('DataProviderModel', 'parse() data', data);

				for (key in data.config)
				{
					if( data.config.hasOwnProperty( key ) )
					{
						data['config-'+key] = data.config[key];
					}
				}
				delete data.config;

				return data;
			},
			// Overriding toJSON to reverse parsing of config
			toJSON : function ()
			{
				var data = Backbone.Model.prototype.toJSON.call(this),
					config = {},
					key;

				for (key in data)
				{
					if (data.hasOwnProperty( key ) &&
						key.substr(0, 7) === 'config-')
					{
						config[key.substr(7)] = data[key];
						delete data[key];
					}
				}
				data.config = config;

				return data;
			}
		});

		return DataProviderModel;
	});
