/**
 * Attribute Model
 *
 * @module     FormAttributeModel
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['backbone', 'modules/config'],
	function(Backbone, config) {
		var valueToString = function(item) { return item.value; },

		FormAttributeModel = Backbone.Model.extend(
		{
			urlRoot: config.get('apiurl') + '/attributes',
			defaults : {
				cardinality: 1,
				required: false,
				options: {}
			},
			toString : function ()
			{
				return this.get('label');
			},
			schema : function ()
			{
				var input = this.get('input'),
					options = this.get('options') || {},
					fields = {
						label: 'Text',
						key: 'Text', // @todo auto-generate key
						required: 'Checkbox',
						cardinality: {
							title: 'Allowed entries',
							type: 'Number',
							help: 'Number of entries allowed in this field. 0 is unlimited.'
						}
					};

				if (! input) {
					return ddt.trace('debug', 'invalid form attribute');
				}

				// todo: stop reformatting input types between server/client
				if (input === 'textarea') {
					input = 'TextArea';
				} else if (input === 'datetime') {
					input = 'DateTime';
				} else {
					// JS equivalent of PHP's ucfirst()
					input = input.charAt(0).toUpperCase() + input.substr(1);
				}

				// Default value should use same input as the current attribute
				fields.default = {
					title: 'Default value',
					type: input,
					options: options
				};

				switch (input) {
					case 'Radio':
					case 'Select':
					case 'Checkboxes':
						fields.options = {
							title: 'Possible Options',
							type : 'List',
							itemToString : valueToString,
							itemType : 'Text'
						};
					break;
				}

				// todo: the preview field should be disabled, but some Backbone.Form
				// editors don't place nice with editorAttrs using `{disabled: "disabled}`
				// (Date, DateTime, and Location editors, possibly others)
				fields.preview = {
					type: input,
					options: options
				};

				return fields;
			}
		});

		return FormAttributeModel;
	});
