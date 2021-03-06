/**
 * Map View
 *
 * @module     MapView
 * @author     Ushahidi Team <team@ushahidi.com>
 * @copyright  2013 Ushahidi
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero General Public License Version 3 (AGPL3)
 */

define(['marionette', 'handlebars', 'underscore', 'App',
		'modules/config',
		'leaflet',
		'text!templates/Map.html',
		'text!templates/Popup.html',
		'text!templates/MapAttribution.html',
		'text!templates/MapAttributionHOT.html',
		'l.markercluster'
	],
	function(Marionette, Handlebars, _, App,
		config,
		L,
		template,
		popupTemplate,
		mapAttributionTemplate,
		mapAttributionHOTTemplate
		)
	{
		// Hack to fix default image url
		L.Icon.Default.imagePath = config.get('baseurl') + 'media/kohana/images';

		return Marionette.ItemView.extend(
		{
			template : Handlebars.compile(template),
			popupTemplate : Handlebars.compile(popupTemplate),
			baseMaps : {
				'MapQuest': L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {attribution: mapAttributionTemplate, subdomains: '1234'}),
				'MapQuest Aerial': L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png', {attribution: mapAttributionTemplate, subdomains: '1234'}),
				'Humanitarian OSM': L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {attribution: mapAttributionHOTTemplate, subdomains: 'abcd'})
			},
			defaultMap : 'MapQuest',
			collapsed : false,
			clustering : false,
			defaultView : {
				lat : -36.85,
				lon : 174.78,
				zoom: 5,
				fitDataOnMap: true
			},
			className : 'map-view',
			modelEvents : {
			  'sync': 'updateMarkers'
			},
			collectionEvents : {
				'filter:change' : 'updateMarkers'
			},
			events : {
				'click .js-collapse-map' : 'collapseMap'
			},
			/**
			 * Initialize the map view
			 *
			 * @param <object> options - Configuration object. Possible params:
			 *   <boolean> collapsed  - Starting 'collapsed' state for the map
			 *   <string>  dataUrl    - Data Url to load geoJSON from. Takes precedence over model or collection URLs.
			 *   <object>  model      - Model to show location data for, used to populate dataUrl. Takes precedence over collection URL.
			 *   <object>  collection - Collection to show location data for, used to populate dataUrl
			 *   <boolean> clustering - Enable clustering of map points with leaflet.markercluster
			 *   <object>  defaultView - Starting view for the map. Expects lat, lon, zoom options.
			 **/
			initialize : function (options)
			{
				// ensure options is an object
				options = _.extend({}, options);

				// Should the view start collapsed
				this.collapsed = false;
				if (options.collapsed)
				{
					this.collapsed = true;
				}

				// Cluster objects on the map?
				this.clustering = false;
				if (options.clustering)
				{
					this.clustering = options.clustering;
				}

				// Map start location
				if (options.defaultView)
				{
					_.extend(this.defaultView, options.defaultView);
				}

				// Save custom dataUrl to view object
				if (typeof options.dataUrl !== 'undefined')
				{
					this.dataUrl = options.dataUrl;
				}


				App.vent.on('map:showValue', this.showPostValue, this);
			},

			// Use onDomRefresh rather than render() because we need this.$el in the DOM first
			onDomRefresh: function()
			{
				var that = this,
						map,
						overlayMaps,
						posts,
						markers;

				// Don't re-render the map
				if (this.map instanceof L.map)
				{
					return this;
				}

				// create a map in the 'map' div, set the view to a given place and zoom
				map = this.map = L.map(this.$('#map')[0], {
					center : new L.LatLng(this.defaultView.lat, this.defaultView.lon),
					zoom : this.defaultView.zoom,
					layers : [this.baseMaps[this.defaultMap]],
					scrollWheelZoom : false
				});
				// Expose map for hacking / debugging
				App.map = map;
				// Disable 'Leaflet prefix on attributions'
				map.attributionControl.setPrefix(false);

				// Add the posts marker layer
				// @TODO split this out so we can manually update the map layer, without redrawing the map
				posts = this.posts = L.geoJson([], {
					onEachFeature: function (feature, layer)
					{
						// does this feature have a property named popupContent?
						if (feature.properties && feature.properties.title)
						{
							layer.bindPopup(that.popupTemplate(feature.properties));

							// If we have an attribute key, bind showValue events
							// NB: not check feature.properties.value_id - this can be undefined sometimes and thats fine.
							if (feature.properties.attribute_key)
							{
								ddt.log('MapView', 'Binding event showValue:'+ feature.properties.attribute_key +':'+ feature.properties.value_id);
								that.stopListening(that, 'showValue:'+ feature.properties.attribute_key +':'+ feature.properties.value_id);
								that.listenTo(
									that,
									'showValue:'+ feature.properties.attribute_key +':'+ feature.properties.value_id,
									_.partial(that.showValuePopup, layer)
								);
							}
						}
					}
				});

				// Cluster markers on the map with Leaflet.markercluster
				if (this.clustering)
				{
					markers = this.cluster = new L.MarkerClusterGroup({
							maxClusterRadius: config.get('map').maxClusterRadius || 50,
							showCoverageOnHover: false
						})
						.addLayer(posts);
				}
				else
				{
					markers = posts;
				}

				markers.addTo(this.map);

				this.updateMarkers(this.defaultView.fitDataOnMap);

				overlayMaps = { 'Posts': markers };

				L.control.layers(this.baseMaps, overlayMaps).addTo(this.map);

				// Set initial collapsed state
				// @TODO Maybe move this into the view html: set classes when we render
				this.collapseMap(this.collapsed);

				// Fix any leaflet weirdness after map resizes
				// @TODO check if this works in older browsers, add backup delayed call if not
				this.$el.on('transitionend', function (e)
				{
					// Make sure we only trigger this on size change for the actual map div
					if ((e.originalEvent.target && e.originalEvent.target.id === 'map') ||
							(e.originalEvent.originalTarget && e.originalEvent.originalTarget.id === 'map'))
					{
						that.map.invalidateSize();
					}
				});

				return this;
			},

			onClose : function()
			{
				ddt.log('MapView', 'MapView.onClose', this.map);
				if (this.map)
				{
					// Manually remove layers, map.remove() doesn't do it for us.
					// https://github.com/Leaflet/Leaflet/issues/2657
					_.each(this.baseMaps, function (layer)
						{
							ddt.log('MapView', 'removing map layer', layer);
							this.map.removeLayer(layer);
						}, this);

					ddt.log('MapView', 'Calling map.remove()');
					this.map.remove();
					delete this.map;
				}
			},

			/**
			 * Toggle map size
			 *
			 * @param <Boolean> collapse - Set collapsed state rather than toggle (true = collapsed)
			 **/
			collapseMap : function (collapse)
			{
				if (collapse === true)
				{
					this.collapsed = true;
					this.$('#map').addClass('map-collapse');
					this.$('.js-collapse-tab').addClass('none');
					this.$('.js-expand-tab').removeClass('none');
					this.$('.leaflet-container .leaflet-control-zoom').hide();
				}
				else if (collapse === false)
				{
					this.collapsed = false;
					this.$('#map').removeClass('map-collapse');
					this.$('.js-collapse-tab').removeClass('none');
					this.$('.js-expand-tab').addClass('none');
					this.$('.leaflet-container .leaflet-control-zoom').show();
				}
				else
				{
					this.collapsed = this.collapsed ? false : true;
					this.$('#map').toggleClass('map-collapse');
					this.$('.js-collapse-tab').toggleClass('none');
					this.$('.js-expand-tab').toggleClass('none');
					this.$('.leaflet-container .leaflet-control-zoom').toggle();
				}

				return false;
			},

			getDataUrl : function()
			{
				var dataUrl;

				// Get data url
				if (typeof this.dataUrl !== 'undefined')
				{
					dataUrl = this.dataUrl;
				}
				else if (typeof this.model !== 'undefined')
				{
					dataUrl = typeof this.model.url === 'function' ? this.model.url() : this.model.url;
					dataUrl = dataUrl + (dataUrl.charAt(dataUrl.length - 1) === '/' ? '' : '/') + 'geojson';
				}
				else if (typeof this.collection !== 'undefined')
				{
					// @TODO improve this to handle query params, etc
					dataUrl = typeof this.collection.url === 'function' ? this.collection.url() : this.collection.url;
					dataUrl = dataUrl + (dataUrl.charAt(dataUrl.length - 1) === '/' ? '' : '/') + 'geojson';
				}
				else
				{
					throw {
						name:    'System Error',
						message: 'Error detected. Could not get dataUrl for MapView'
					};
				}

				return dataUrl;
			},

			/**
			 * Reload map markers from the server and add to map
			 * @param {Boolean} fitDataOnMap   Move map bounds to fit data on the map
			 */
			updateMarkers : function (fitDataOnMap)
			{
				var map = this.map,
					posts = this.posts,
					cluster = this.cluster;

				App.oauth.ajax({
					url : this.getDataUrl(),
					success: function (data) {
						posts.clearLayers();
						if (cluster)
						{
							cluster.clearLayers();
						}

						// If geojson was empty, return
						if (data.features.length === 0)
						{
							return;
						}

						posts.addData(data);
						if (cluster)
						{
							cluster.addLayer(posts);
						}

						// Center map on post markers
						if (fitDataOnMap)
						{
							map.fitBounds(cluster ? cluster.getBounds() : posts.getBounds());
							// Avoid zooming further than 15 (particularly when we just have a single point)
							if (map.getZoom() > 15)
							{
								map.setZoom(15);
							}
						}
					},
					data : (typeof this.collection !== 'undefined') ? this.collection.getFilterParams() : {}
				});
			},

			showPostValue : function(data)
			{
				ddt.log('MapView', 'showing post value', data);
				this.trigger('showValue:'+data.key+':'+data.value_id);
			},

			showValuePopup : function (layer)
			{
				ddt.log('MapView', 'showing popup', layer);
				layer.openPopup();
			}
		});
	});
