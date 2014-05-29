/**
 * Ushahidi Main Controller
 *
 * @module     Controller
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license	https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['App', 'backbone', 'marionette',
	'controllers/ModalController',

	'views/AppLayout',
	'views/HomeLayout',

	'views/HeaderView',
	'views/FooterView',

	'views/WorkspacePanelView',

	'collections/PostCollection',
	'collections/TagCollection',
	'collections/FormCollection',
	'collections/SetCollection',
	'collections/RoleCollection',
	'collections/UserCollection',

	'models/UserModel'
	],
	function(App, Backbone, Marionette,
		ModalController,

		AppLayout,
		HomeLayout,

		HeaderView,
		FooterView,

		WorkspacePanelView,

		PostCollection,
		TagCollection,
		FormCollection,
		SetCollection,
		RoleCollection,
		UserCollection,

		UserModel
		)
	{
		return Backbone.Marionette.Controller.extend(
		{
			initialize : function()
			{
				var user = new UserModel({ id: 'me' });

				if (App.loggedin()) {
					// only fetch the user when logged in
					user.fetch();
				}

				this.layout = new AppLayout();
				App.body.show(this.layout);

				this.layout.headerRegion.show(new HeaderView());
				this.layout.footerRegion.show(new FooterView());
				this.layout.workspacePanel.show(new WorkspacePanelView({ model: user }));

				App.vent.on('workspace:toggle', function (close)
				{
					if (close)
					{
						App.body.$el.removeClass('active-workspace');
					}
					else
					{
						App.body.$el.toggleClass('active-workspace');
					}
				});

				App.Collections = {};
				App.Collections.Posts = new PostCollection();
				App.Collections.Posts.fetch();

				App.Collections.Forms = new FormCollection();
				App.Collections.Forms.fetch();
				App.Collections.Sets = new SetCollection();
				App.Collections.Sets.fetch();

				// Fake roles collection
				App.Collections.Roles = new RoleCollection([
					{
						name : 'admin',
						display_name : 'Admin',
						description : 'Administrator'
					},
					{
						name : 'user',
						display_name : 'Member',
						description : 'Default logged in user role'
					},
					{
						name : 'guest',
						display_name : 'Guest',
						description : 'Unprivileged role given to users who are not logged in'
					}
				]);

				// Open the user collection, but do not fetch it until necessary
				App.Collections.Users = new UserCollection();

				// Grab tag collection, use client-side paging and fetch all tags from server at once
				App.Collections.Tags = new TagCollection([], { mode: 'client' });
				App.Collections.Tags.fetch();

				this.homeLayout = new HomeLayout({
					collection : App.Collections.Posts
				});
				App.vent.trigger('views:change', 'full');

				this.modalController = new ModalController({
					modal : this.layout.modal
				});
			},
			//gets mapped to in AppRouter's appRoutes
			index : function()
			{
				App.vent.trigger('page:change', 'posts');
				App.Collections.Posts.setFilterParams({}, true);
				this.showHomeLayout();
			},
			postsAll : function()
			{
				App.vent.trigger('page:change', 'posts/all');
				App.Collections.Posts.setFilterParams({
					status : 'all'
				}, true);
				this.showHomeLayout();
			},
			postsUnpublished : function()
			{
				App.vent.trigger('page:change', 'posts/unpublished');
				App.Collections.Posts.setFilterParams({
					status : 'draft'
				}, true);
				this.showHomeLayout();
			},
			postsPublished : function()
			{
				this.index();
			},
			viewsFull : function()
			{
				App.vent.trigger('views:change', 'full');
				this.homeLayout.setViews({
					map: true,
					search: true,
					list: true
				});
				this.showHomeLayout();
			},
			viewsList : function()
			{
				App.vent.trigger('views:change', 'list');
				this.homeLayout.setViews({
					map: false,
					search: true,
					list: true
				});
				this.showHomeLayout();
			},
			viewsMap : function()
			{
				App.vent.trigger('views:change', 'map');
				this.homeLayout.setViews({
					map: true,
					search: true,
					list: false
				});
				this.showHomeLayout();
			},
			showHomeLayout : function()
			{
				if (this.layout.mainRegion.currentView instanceof HomeLayout === false)
				{
					ddt.log('Controller', 'showHomeLayout');
					this.layout.mainRegion.show(this.homeLayout);
				}
				this.homeLayout.showRegions();
			},
			postDetail : function(id)
			{
				var that = this,
						postDetailLayout,
						model,
						relatedPosts;

				require(['views/posts/PostDetailLayout', 'views/posts/PostDetailView', 'views/posts/RelatedPostsView', 'views/MapView', 'models/PostModel'],
					function(PostDetailLayout, PostDetailView, RelatedPostsView, MapView, PostModel)
				{
					App.vent.trigger('page:change', 'posts/:id');
					// @TODO find a way to reuse post detail views
					postDetailLayout = new PostDetailLayout();
					that.layout.mainRegion.show(postDetailLayout);

					// @todo improve this to avoid double loading of model (and race conditions)
					//model = App.Collections.Posts.get({id : id});
					model = new PostModel({id: id});
					model.fetch().done(function ()
					{
						model.fetchRelations();

						// If post has tags, load related posts
						if (model.get('tags').length > 0)
						{
							relatedPosts = new PostCollection();
							relatedPosts
								.setPageSize(4, {
									first : true,
									fetch : false,
									data : {
										tags : model.get('tags').join(',')
									}
								})
								.done(function () {
									// Remove current post from the collection
									relatedPosts.remove(model);
									// Remove extra posts if we still have 4 posts..
									relatedPosts.remove(relatedPosts.at(3));
								});
						}
					});

					// Make sure we have loaded the form and user before we render the post details
					model.relationsCallback.done(function()
					{
						postDetailLayout.postDetailRegion.show(new PostDetailView({
							model: model
						}));

						// If post has tags, show related posts
						if (model.get('tags').length > 0)
						{
							postDetailLayout.relatedPostsRegion.show(new RelatedPostsView({
								collection : relatedPosts,
								model : model
							}));
						}
					});

					postDetailLayout.mapRegion.show(new MapView({
						className : 'map-view post-details-map-view',
						collapsed : true,
						model : model
					}));
				});
			},
			sets : function ()
			{
				var that = this;
				require(['views/sets/SetListView'], function(SetListView)
				{
					App.vent.trigger('page:change', 'sets');
					that.layout.mainRegion.show(new SetListView({
						collection : App.Collections.Sets
					}));
				});
			},

			setDetail : function(/* id */)
			{
				var that = this;
				require(['views/sets/SetDetailView'], function(SetDetailView)
				{
					App.vent.trigger('page:change', 'sets/:id');
					that.layout.mainRegion.show(new SetDetailView());
				});
			},

			users : function()
			{
				var that = this;
				require(['views/users/UserListView'], function(UserListView)
				{
					App.Collections.Users.fetch();

					App.vent.trigger('page:change', 'users');

					that.layout.mainRegion.show(new UserListView({
						collection : App.Collections.Users
					}));
				});
			},

			tags : function()
			{
				var that = this;
				require(['views/tags/TagListView'], function(TagListView)
				{
					App.vent.trigger('page:change', 'tags');
					App.Collections.Tags.fetch();

					that.layout.mainRegion.show(new TagListView({
						collection : App.Collections.Tags
					}));
				});
			},

			// Extra postCreate handler to give us a direct URL to posts/create
			postCreate : function ()
			{
				if (typeof this.layout.mainRegion.currentView === 'undefined')
				{
					this.index();
				}

				this.modalController.postCreate();
			},
			settings : function()
			{
				var that = this;
				require(['views/SettingsView'], function(SettingsView)
				{
					App.vent.trigger('page:change', 'settings');
					that.layout.mainRegion.show(new SettingsView());
				});
			},
			messages : function (view)
			{
				var that = this;
				this.homeLayout.close();
				require(['views/messages/MessageListView', 'collections/MessageCollection'], function(MessageListView, MessageCollection)
				{
					App.vent.trigger('page:change', view ? 'messages/' + view : 'messages');

					App.Collections.Messages = new MessageCollection();
					//App.Collections.Messages.fetch();

					switch (view)
					{
						// Filter by type. Will also default to incoming + received status
						case 'email':
							App.Collections.Messages.fetch({data : {type : 'email'}});
							break;
						case 'sms':
							App.Collections.Messages.fetch({data : {type : 'sms'}});
							break;
						case 'twitter':
							App.Collections.Messages.fetch({data : {type : 'twitter'}});
							break;
						// Filter by archived status. Will also default to incoming only
						case 'archived':
							App.Collections.Messages.fetch({data : {status : 'archived'}});
							break;
						// Show all statuses. Will still default to incoming only
						case 'all':
							App.Collections.Messages.fetch({data : {status : 'all'}});
							break;
						// Grab default: incoming + received + all types
						default:
							App.Collections.Messages.fetch();
							break;
					}

					that.layout.mainRegion.show(new MessageListView({
						collection : App.Collections.Messages
					}));
				});
			},
			apiExplorer : function ()
			{
				// Api Explorer not enabled, show index page
				if (!App.feature('api_explorer'))
				{
					// Go to index page.
					this.index();
					App.appRouter.navigate('', { trigger : true });

					return;
				}

				var that = this;
				require(['views/api-explorer/ApiExplorerView','models/ApiExplorerModel',], function(ApiExplorerView, ApiExplorerModel)
				{
					App.vent.trigger('page:change', 'apiexplorer');
					that.layout.mainRegion.show(new ApiExplorerView({
						model : new ApiExplorerModel()
					}));
				});
			},
		});
	});
