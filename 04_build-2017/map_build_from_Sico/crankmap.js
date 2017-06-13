CRANK = CRANK || {};

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
		mapDiv.style.width = isMobile ? '100%' : '800px';
		mapDiv.style.height = isMobile ? '100%' : '500px';
		var map = new google.maps.Map(mapDiv, {
			center: new google.maps.LatLng(43.069955587420736, -103.87034199375),
			zoom: 5,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('googft-legend-open'));
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('googft-legend'));

		layer = new google.maps.FusionTablesLayer({
			map: map,
			heatmap: { enabled: false },
			query: {
				select: "col0",
				from: "1pAzMpSk9jTTm4gwiwIIzr_WgqSef10ZuPA5DfhlM",
				where: ""
			},
			options: {
				styleId: 2,
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
		var tableApiUrl = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT%20*%20FROM%201pAzMpSk9jTTm4gwiwIIzr_WgqSef10ZuPA5DfhlM&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ';

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
		var byDate = mapTableDataByDate( data );

		for ( var date in byDate ) {
			var dateDiv = $(document.createElement('div'));
			dateDiv.append('<h3>' + date + '</h3>');
			var ridesList = $(document.createElement('ul'));
			byDate[date].forEach(function(ride) {
				ridesList.append('<li><a href="'+ride.website+'" target="_blank">'+ride.city+'</a></li>');
			});
			dateDiv.append(ridesList);
			$('#location-list').append(dateDiv);
		}
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
		$('.list-link').on('click', function() {
			$('#location-list').show();
			$('#googft-mapCanvas').hide();
		});

		$('.map-link').on('click', function() {
			showMap();
			$('#location-list').hide();
		});

		fetchTableData();
	}

	return {
		init: init
	}

})();