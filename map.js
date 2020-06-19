function CreateMap(lat, lon) {
    // Instantiate a map object
    var map = new atlas.Map("myMap", {
    view: "Auto",
  
      //Add your Azure Maps key to the map SDK. Get an Azure Maps key at https://azure.com/maps. NOTE: The primary key should be used as the key.
      authOptions: {
        authType: "subscriptionKey",
        subscriptionKey: "iIXj-Z0gp0y3n0h9njqb1uxmF-4D82qYXHZxfabr9nU"
      }
    });
     //Create a popup but leave it closed so we can update it and display it later.
    popup = new atlas.Popup();

    //Use SubscriptionKeyCredential with a subscription key
    const subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey());

    //Use subscriptionKeyCredential to create a pipeline
    const pipeline = atlas.service.MapsURL.newPipeline(subscriptionKeyCredential, {
        retryOptions: { maxTries: 4 } // Retry options
    });

    //Create an instance of the SearchURL client.
    searchURL = new atlas.service.SearchURL(pipeline);

    //If the user presses the search button, geocode the value they passed in.
    document.getElementById('searchBtn').onclick = performSearch;

    //If the user presses enter in the search textbox, perform a search.
    document.getElementById('searchTbx').onkeyup = function (e) {
        if (e.keyCode === 13) {
            performSearch();
        }
    };

    //If the user presses the My Location button, use the geolocation API to get the users location and center/zoom the map to that location.
    document.getElementById('myLocationBtn').onclick = setMapToUserLocation;
  
    //Wait until the map resources are ready.
    map.events.add("ready", function() {
      //Create a data source and add it to the map.
      datasource = new atlas.source.DataSource();
      map.sources.add(datasource);
  
      //Add the zoom control to the map.
      map.controls.add(new atlas.control.ZoomControl(), {
              position: 'top-right'
      });
      //Add an HTML marker to the map to indicate the center used for searching.
      centerMarker = new atlas.HtmlMarker({
          htmlContent: '<div class="mapCenterIcon"></div>',
          position: map.getCamera().center
      });
      map.markers.add(centerMarker);
  
      //Add a layer for rendering point data.
      var resultLayer = new atlas.layer.SymbolLayer(datasource, null, {
        iconOptions: {
          image: "pin-round-darkblue",
          anchor: "center",
          allowOverlap: true
        },
        textOptions: {
          anchor: "top"
        }
      });
  
      map.layers.add(resultLayer);
      //Add a layer for rendering the route lines and have it render under the map labels.
      map.layers.add(new atlas.layer.LineLayer(datasource, null, {
          strokeColor: '#2272B9',
          strokeWidth: 5,
          lineJoin: 'round',
          lineCap: 'round'
      }), 'labels');
  
      //Add a layer for rendering point data.
      map.layers.add(new atlas.layer.SymbolLayer(datasource, null, {
          iconOptions: {
              image: ['get', 'icon'],
              allowOverlap: true
         },
          textOptions: {
              textField: ['get', 'title'],
              offset: [0, 1.2]
          },
          filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
      }));
      // Use SubscriptionKeyCredential with a subscription key
      var subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(
        atlas.getSubscriptionKey()
      );
  
      // Use subscriptionKeyCredential to create a pipeline
      var pipeline = atlas.service.MapsURL.newPipeline(
        subscriptionKeyCredential
      );
  
      // Construct the SearchURL object
      var searchURL = new atlas.service.SearchURL(pipeline);
  
      var query = "hospital";
      var radius = 9000;
  
      searchURL
        .searchPOI(atlas.service.Aborter.timeout(10000), query, {
          limit: 20,
          lat: lat,
          lon: lon,
          radius: radius,
          view: "Auto"
        })
        .then(results => {
          // Extract GeoJSON feature collection from the response and add it to the datasource
          var data = results.geojson.getFeatures();
          datasource.add(data);
  
          // set camera to bounds to show the results
          map.setCamera({
            bounds: data.bbox,
            zoom: 10,
            padding: 15
          });
        });
  
      //Create a popup but leave it closed so we can update it and display it later.
      popup = new atlas.Popup();
  
      //Add a mouse over event to the result layer and display a popup when this event fires.
      map.events.add("mouseover", resultLayer, showPopup);
  
      function showPopup(e) {
        //Get the properties and coordinates of the first shape that the event occurred on.
  
        var p = e.shapes[0].getProperties();
        var position = e.shapes[0].getCoordinates();
  
        //Create HTML from properties of the selected result.
        var html = [
          '<div style="padding:5px"><div><b>',
          p.poi.name,
          "</b></div><div>",
          p.address.freeformAddress,
          "</div><div>",
          position[1],
          ", ",
          position[0],
          "</div></div>"
        ];
  
        //Update the content and position of the popup.
        popup.setPopupOptions({
          content: html.join(""),
          position: position
        });
  
        //Open the popup.
        popup.open(map);
      }
    });
  }
  
  function Initialize() {
    navigator.geolocation.getCurrentPosition(
      function(p) {
        // console.log(p.coords.latitude,p.coords.longitude);
        CreateMap(p.coords.latitude, p.coords.longitude);
      },
      function(err) {
        switch (error.code) {
              case error.PERMISSION_DENIED:
                  alert('User denied the request for Geolocation.');
                  break;
              case error.POSITION_UNAVAILABLE:
                  alert('Position information is unavailable.');
                  break;
              case error.TIMEOUT:
                  alert('The request to get user position timed out.');
                  break;
              case error.UNKNOWN_ERROR:
                  alert('An unknown error occurred.');
                  break;
          }
      }
    );
  }

function setMapToUserLocation() {
    //Request the user's location.
    navigator.geolocation.getCurrentPosition(function (position) {
        //Convert the geolocation API position into a longitude/latitude position value the map can understand and center the map over it.
        map.setCamera({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: maxClusterZoomLevel + 1
        });
    }, function (error) {
        //If an error occurs when trying to access the users position information, display an error message.
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert('User denied the request for Geolocation.');
                break;
            case error.POSITION_UNAVAILABLE:
                alert('Position information is unavailable.');
                break;
            case error.TIMEOUT:
                alert('The request to get user position timed out.');
                break;
            case error.UNKNOWN_ERROR:
                alert('An unknown error occurred.');
                break;
        }
    });
}
  function performSearch() {
    var query = document.getElementById('searchTbx').value;

    //Perform a fuzzy search on the users query.
    searchURL.searchFuzzy(atlas.service.Aborter.timeout(3000), query, {
        //Pass in the array of country ISO2 for which we want to limit the search to.
        view: 'Auto'
    }).then(results => {
        //Parse the response into GeoJSON so that the map can understand.
        var data = results.geojson.getFeatures();

        if (data.features.length > 0) {
            //Set the camera to the bounds of the results.
            map.setCamera({
                bounds: data.features[0].bbox,
                padding: 40
            });
        } else {
            document.getElementById('listPanel').innerHTML = '<div class="statusMessage">Unable to find the location you searched for.</div>';
        } 
    });

}

