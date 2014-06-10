/**
 * Attribute List Item View
 *
 * @module     AttributeListItemView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['underscore', 'handlebars', 'marionette', 'forms/UshahidiForms', 'text!templates/settings/AttributeListItem.html'],
	function(_, Handlebars, Marionette, BackboneForm, template)
	{
		return Marionette.ItemView.extend(
		{
			template: Handlebars.compile(template),
			tagName: 'li',
			className: 'list-view-attribute',

			form: null,
			attributes : function ()
			{
				var attributes = {
					'data-attribute-type' : this.model.get('type'),
					'data-attribute-input' : this.model.get('input'),
				};

				if (this.model.isNew()) {
					attributes['data-attribute-new'] = true;
				} else {
					attributes['data-attribute-id'] = this.model.get('id');
				}

				return attributes;
			},

			modelEvents: {
				'sync': 'render',
				'change': 'render'
			},

			events: {
				'click .js-edit-field' : 'editField',
				'click .js-cancel-edit' : 'cancelEdit',
				'submit form' : 'saveField'
			},

			initialize : function (/*options*/)
			{
				ddt.log('debug', 'form attrs', this.model.toJSON());

				var input = this.model.get('input'),
					options = this.model.get('options') || {},
					value = this.model.get('label'),
					fields = {
						name: 'Text',
						key: 'Text' // @todo auto-generate key
					};

				if (!input) {
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

				switch (input) {
					case 'DateTime':
						fields.format = 'Text';
					break;
					case 'Location':
						fields.default = {
							title: 'Default Location',
							type: 'Text'
						};
					break;
					case 'Radio':
					case 'Select':
						fields.options = {
							title: 'Possible Options',
							type: 'TextArea'
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

				try {
					this.form = new BackboneForm({
						schema: fields,
						data: {
							name: value
						}
					});
				} catch (err) {
					ddt.log('debug', 'could not create form for attr', err);
				}
			},

			onDomRefresh : function()
			{
				// Render the form and add it to the view
				this.form.render();

				var $form = this.form.$el;

				// add a cancel button to the form
				$form.append('<button class="js-cancel-edit">Cancel</button>');

				// add a submit button to the form
				// todo: use "submitButton: title" in Backbone.Form v0.15
				$form.append('<button type="submit">Save</button>');

				// hide the field editor form until activated
				$form.addClass('hide');

				this.$el.append($form);
			},

			editField : function(e)
			{
				e.preventDefault();

				var $section = this.$(e.currentTarget).closest('section');

				// show the form, hide the section
				$section.add(this.form.$el).toggleClass('hide');
			},

			cancelEdit : function(e)
			{
				e.preventDefault();

				var $section = this.$(e.currentTarget).closest('form').prev('section');

				// show the section, hide the form
				$section.add(this.form.$el).toggleClass('hide');
			},

			saveField : function(e)
			{
				e.preventDefault();

				var raw = this.form.$el.serializeArray(),
					data = {};

				_.each(raw, function(input)
				{
					data[input.name] = input.value;
				});

				if (data.name) {
					this.model.set('label', data.name);
					this.model.save();
				}
			}
		});
	});
