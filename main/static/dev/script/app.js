$(document)
    .ready(function () {
        if (typeof google != "undefined" && isdashboard) {
            /* Data points defined as an array of LatLng objects */
            var heatmapData;
            var transactionData = {
                getData: function () {
                    return $.getJSON("/p/data/transactions.json", parseTransactionResponse);
                }
            }
            var eventData = {
                getData: function () {
                    return $.getJSON("/p/data/events.json", parseEventResponse);
                }
            }
            var evts = [];
            var transactions = [];
            var competitors = [];
            var nearbyEvents = [];
            var merchantData = {
                getData: function () {
                    var urls = [
                        //"http://dmartin.org:8026/merchantpoi/v1/merchantpoisvc.svc/merchantpoi?MCCCode=5812&postalCode=10013&format=json",
                        //"http://dmartin.org:8026/merchantpoi/v1/merchantpoisvc.svc/merchantpoi?MCCCode=5814&postalCode=10013&format=json",
                        "/p/data/5812.json"
                    ];
                    for (var idx in urls) {
                        $.getJSON(urls[idx], parseMerchantResponse);
                    }
                }
            }
            $("#showCompetitors")
                .change(function () {
                    if (this.checked) {
                        $.each(competitors, function (idx, obj) {
                            obj.setMap(map);
                        });
                    } else {
                        $.each(competitors, function (idx, obj) {
                            obj.setMap(null);
                        });
                    }
                });
            $("#showEvents")
                .change(function () {
                    if (this.checked) {
                        $.each(evts, function (idx, obj) {
                            obj.setMap(map);
                        });
                    } else {
                        $.each(evts, function (idx, obj) {
                            obj.setMap(null);
                        });
                    }
                })

            function displayMerchantInfo(data) {
                console.dir(data);
                var elem = $("<div></div>")
                    .append($("<h3></h3>")
                        .text(data.CleansedMerchantName), $("<p></p>")
                        .text("5812: Eating Places, Restaurants"), data.LocalFavorite == "Y" ? $("<b></b>")
                        .text("Local Favorite!") : "", $("<p></p>")
                        .text(data.CleansedMerchantStreetAddress), $("<p></p>")
                        .text(data.CleansedMerchantTelephoneNumber));
                $("#infopanel")
                    .html(elem);
            }

            function displayEventInfo(data) {
                console.log(data);
                var elem = $("<div></div>")
                    .append($("<b></b>")
                        .html(data.name.html), $("<p></p>")
                        .html(data.description.html));
                $("#infopanel")
                    .html(elem);
            }

            function parseTransactionResponse(data) {
                $.each(data.transactions, function (idx, obj) {
                    transactions.push({
                        location: new google.maps.LatLng(obj.lat, obj.lng),
                        weight: obj.amount / 100
                    });
                });
            }
            var openWindow;

            function parseMerchantResponse(data) {
                $.each(data.MerchantPOIList.MerchantPOIArray.MerchantPOI, function (idx, obj) {
                    var infowindow = new google.maps.InfoWindow({
                        content: obj.CleansedMerchantName
                    });
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(obj.Latitude, obj.Longitude),
                        map: null,
                        title: obj.CleansedMerchantName,
                    });
                    google.maps.event.addListener(marker, 'click', function () {
                        if (openWindow) {
                            openWindow.close();
                        }
                        infowindow.open(map, marker);
                        openWindow = infowindow;
                        displayMerchantInfo(obj);
                    });
                    competitors.push(marker);
                });
            }

            function parseEventResponse(data) {
                console.dir(data);
                $.each(data.events, function (idx, obj) {
                    var infowindow = new google.maps.InfoWindow({
                        content: obj.name.text
                    });
                    var marker = new google.maps.Marker({
                        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                        position: new google.maps.LatLng(obj.venue.address.latitude, obj.venue.address.longitude),
                        map: null,
                        title: obj.name.text
                    });
                    google.maps.event.addListener(marker, 'click', function () {
                        if (openWindow) {
                            openWindow.close();
                        }
                        infowindow.open(map, marker);
                        openWindow = infowindow;
                        displayEventInfo(obj);
                    });
                    evts.push(marker);
                });
            }
            var myPos;
            var map;
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    map = new google.maps.Map(document.getElementById('map'), {
                        center: myPos,
                        zoom: 15,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                    //load transaction data
                    transactionData.getData()
                        .done(function () {
                            var heatmap = new google.maps.visualization.HeatmapLayer({
                                data: transactions
                            });
                            heatmap.set('radius', 40);
                            heatmap.setMap(map);
                            merchantData.getData();
                            console.log("Done Loading data");
                        });
                    eventData.getData()
                        .done(function () {
                            console.log("loaded event data");
                        })
                })
            }
            //load merchant data for 5811,5812,5813,5814 as competitors
        }
        //load events nearby today
        else if (jQuery()
            .dataTable) {
            var geocoder = new google.maps.Geocoder;
            console.log('transactions');
            var cache = {};

            function location() {
                $("tr td:nth-child(3)")
                    .each(function (idx, obj) {
                        if (!isNaN(parseFloat($(this)
                            .text()
                            .split(',')[0]))) {
                            var tmp = geocode($(this)
                                .text());
                            if (tmp != "Loading...") {
                                $(this)
                                    .text(tmp);
                            }
                        }
                    });
            }

            function geocode(str) {
                //if string is in cache, return the location
                if (cache.hasOwnProperty(str)) return cache[str];
                //start a defered lookup for this location, cache the result, and call this again
                cache[str] = "Loading...";
                geocoder.geocode({
                    'location': {
                        lat: parseFloat(str.split(',')[0]),
                        lng: parseFloat(str.split(',')[1])
                    }
                }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        console.dir(results);
                        if (results[0]) {
                            cache[str] = results[0].formatted_address;
                            location();
                        } else {
                            cache[str] = str;
                            console.log("failed lookup for " + str);
                        }
                    } else {
                        cache[str] = str;
                        console.log("failed lookup for " + str);
                    }
                });
            }
            $('#transaction')
                .DataTable({
                    ajax: {
                        url: '/p/data/transactions.json',
                        dataSrc: 'transactions',
                    },
                    columns: [{
                        data: "timestamp"
                    }, {
                        data: "amount"
                    }, {
                        data: "lat"
                    }, {
                        data: "lng"
                    }, ],
                    "drawCallback": function (settings) {
                        location();
                    },
                    "columnDefs": [{
                        // The `data` parameter refers to the data for the cell (defined by the
                        // `data` option, which defaults to the column being worked with, in
                        // this case `data: 0`.
                        "render": function (data, type, row) {
                            return data + ', ' + row["lng"];
                        },
                        "targets": 2
                    }, {
                        "visible": false,
                        "targets": [3]
                    }]
                });
        }
    });
console.log('Loaded'); {}