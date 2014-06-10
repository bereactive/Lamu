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
		var FormAttributeModel = Backbone.Model.extend(
		{
			urlRoot: config.get('apiurl') + '/attributes',
			toString : function ()
			{
				return this.get('label');
			}
		});

		return FormAttributeModel;
	});
