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
				try {
					this.form = new BackboneForm({
						model: this.model,
						idPrefix : 'attribute-',
						className : 'attribute-form',
					});
				} catch (err) {
					ddt.log('debug', 'could not create form for attr', err);
				}


				// BackboneValidation.bind(this, {
				// 	valid: function(/* view, attr */)
				// 	{
				// 		// Do nothing, displaying errors is handled by backbone-forms
				// 	},
				// 	invalid: function(/* view, attr, error */)
				// 	{
				// 		// Do nothing, displaying errors is handled by backbone-forms
				// 	}
				// });

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

				var data = this.form.getValue();

				ddt.log('debug', 'form data', data);

				this.model.set(_.pick(data, 'label', 'key', 'options', 'default', 'format', 'required'));
				ddt.log('debug', 'updated model', this.model.toJSON());
				this.model.save();
			}
		});
	});
