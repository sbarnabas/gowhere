$(document)
    .ready(function () {
        if (typeof google != "undefined") {
            /* Data points defined as an array of LatLng objects */
            var heatmapData;
            var transactionData = {
                getData: function () {
                    return $.getJSON("/p/data/transactions.json", parseTransactionResponse);
                }
            }

            var eventData = {
            	getData: function() {
            		return $.getJSON("/p/data/events.json",parseEventResponse);
            	}
            }
            var evts= [];
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

            function displayMerchantInfo(data) {
                var elem = $("<div></div>")
                    .append($("<b></b>")
                        .text(data.CleansedMerchantName), $("<p></p>")
                        .text(data.CleansedMerchantStreetAddress), $("<p></p>")
                        .text(data.CleansedMerchantTelephoneNumber));
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
                console.dir(transactions);
            }
              var openWindow;
            function parseMerchantResponse(data) {
                console.dir(data);
              
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
                            console.log(transactions);
                            var heatmap = new google.maps.visualization.HeatmapLayer({
                                data: transactions
                            });
                            heatmap.set('radius', 40);
                            heatmap.setMap(map);
                            merchantData.getData();
                            console.log("Done Loading data");
                        });
                    eventData.getData().done(function() { console.log("loaded event data");})

                    })
                })
                //load merchant data for 5811,5812,5813,5814 as competitors
            }
            //load events nearby today
        } else if (jQuery()
            .dataTable) {
            console.log('transactions');
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