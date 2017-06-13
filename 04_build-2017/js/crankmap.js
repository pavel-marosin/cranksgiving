var CRANK = CRANK || {};

CRANK.map = (function() {
	var mapInitted = false;

	function showMap() {
		$('#googft-mapCanvas').show();
		if (!mapInitted) {
			initializeMap();
		}
	};

	function initializeMap() {
		google.maps.visualRefresh = true;
		var isMobile = (navigator.userAgent.toLowerCase().indexOf('android') > -1) ||
			(navigator.userAgent.match(/(iPod|iPhone|iPad|BlackBerry|Windows Phone|iemobile)/));
		if (isMobile) {
			var viewport = document.querySelector("meta[name=viewport]");
			viewport.setAttribute('content', 'initial-scale=1.0, user-scalable=no');
		}
		var mapDiv = document.getElementById('googft-mapCanvas');
		mapDiv.style.width = isMobile ? '100%' : '864px';
		mapDiv.style.height = isMobile ? '100%' : '500px';
		var map = new google.maps.Map(mapDiv, {
			center: new google.maps.LatLng(33.94339, -96.23195),
			zoom: 4,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('googft-legend-open'));
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('googft-legend'));
		

		layer = new google.maps.FusionTablesLayer({
			map: map,
			heatmap: { enabled: false },
			query: {
				select: "col0",
				from: "1hle2oFTYXISybVlMfSWcaYPdkEowbW_lo6hR7MJ0",
				where: "col1 \x3c\x3d \x27Jan 1, 2017\x27 and col1 \x3e\x3d \x27Oct 1, 2016\x27"
			},


			options: {
				styleId: 3,
				templateId: 2
			}
		});

		if (isMobile) {
			var legend = document.getElementById('googft-legend');
			var legendOpenButton = document.getElementById('googft-legend-open');
			var legendCloseButton = document.getElementById('googft-legend-close');
			legend.style.display = 'none';
			legendOpenButton.style.display = 'block';
			legendCloseButton.style.display = 'block';
			legendOpenButton.onclick = function() {
				legend.style.display = 'block';
				legendOpenButton.style.display = 'none';
			}
			legendCloseButton.onclick = function() {
				legend.style.display = 'none';
				legendOpenButton.style.display = 'block';
			}
		}

		mapInitted = true;
	};



	function fetchTableData() {
		var baseurl = 'https://www.googleapis.com/fusiontables/v1/query?';
		var query = 'sql=SELECT * FROM 1hle2oFTYXISybVlMfSWcaYPdkEowbW_lo6hR7MJ0 where DATE >= \'2016-10-01 00:00:00\' AND DATE <= \'2016-12-31 00:00:00\' order by DATE';
		var key = '&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ';
		var tableApiUrl = baseurl + query + key;

		$.ajax({
			dataType: "json",
			url: tableApiUrl,
			success: function ( data ) {
				makeListHtml( data.rows.map(function(row) {
					return makeRideObject(data.columns, row);
				}));
			}
		});
	};

	function makeRideObject( cols, ride ) {
		var rideObj = {};
		for ( var i = 0; i < cols.length; i++ ) {
			rideObj[cols[i].toLowerCase()] = ride[i];
		}

		return rideObj;
	};

	function makeListHtml( data ) {
		var totalRides = data.length;
		var byDate = mapTableDataByDate( data );
		var totalDates = Object.keys(byDate).length

		var totalSpace = (totalDates * 2) + totalRides;
		var perCol = Math.floor(totalSpace / 4);

		var locsDiv = $(document.createElement('div'));
		var cols = [];
		var col = $(document.createElement('div')).addClass('icon4col');
		var colSpace = 0;

		for ( var date in byDate ) {
			if ( colSpace + 2 + byDate[date].length > (perCol + 4) ) {
				// push current col into cols
				locsDiv.append(col);
				// make new col
				col = $(document.createElement('div')).addClass('icon4col');
				colSpace = 0;
			}

			// add 2 for date label
			colSpace += 2;
			var dateDiv = $(document.createElement('div'));
			dateDiv.append('<h3>' + date + '</h3>');
			var ridesList = $(document.createElement('ul'));
			byDate[date].forEach(function(ride) {
				colSpace += 1; // add 1 for each ride
				ridesList.append('<li><a href="'+ride.website+'" target="_blank">'+ride.city+'</a></li>');
			});
			dateDiv.append(ridesList);
			col.append(dateDiv);
		}

		locsDiv.append(col);
		$('#location-list').append(locsDiv);
	};

	function mapTableDataByDate( data ) {
		var dates = {};
		data.forEach(function(ride) {
			if(ride.date) {
				if(dates[ride.date]) {
					dates[ride.date].push(ride);
				} else {
					dates[ride.date] = [ride];
				}
			}
		});
		return dates;
	};

	function init() {
		$('.list-link').on('click', function( event ) {
			event.preventDefault();
			$('#location-list').show();
			$('#googft-mapCanvas').hide();
		});

		$('.map-link').on('click', function( event ) {
			event.preventDefault();
			showMap();
			$('#location-list').hide();
		});
		initializeMap();
		fetchTableData();
	}

	return {
		init: init
	}

})();