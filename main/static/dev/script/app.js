$(document).ready(function() {
if(typeof google !="undefined") {
/* Data points defined as an array of LatLng objects */
var heatmapData;

var transactionData = {
	getData: function() {

		return [
  {location:new google.maps.LatLng(40.719893, -74.001717),weight:5.25},
  {location:new google.maps.LatLng(40.719893, -74.001717),weight:1.25},
  {location:new google.maps.LatLng(40.719893, -74.001717),weight:6.25},
  {location:new google.maps.LatLng(40.719893, -74.001717),weight:2.25},
  {location:new google.maps.LatLng(40.719893, -74.001717),weight:4.25},
  {location:new google.maps.LatLng(40.719893, -74.001717),weight:3.25},
  {location:new google.maps.LatLng(40.719893, -74.001717),weight:0.25},
 
   {location:new google.maps.LatLng(40.716722, -74.004395),weight:2.25},
];
	}
}

var merchantData = {
	getData: function() {
		var urls = 
		[
"http://dmartin.org:8026/merchantpoi/v1/merchantpoisvc.svc/merchantpoi?MCCCode=5812&postalCode=10013&format=json",
"http://dmartin.org:8026/merchantpoi/v1/merchantpoisvc.svc/merchantpoi?MCCCode=5814&postalCode=10013&format=json",
];
	
	for(var idx in urls) {
		$.getJSON(urls[idx],parseMerchantResponse);
	}

	}
}
function parseMerchantResponse(data) {
	console.dir(data);
	$.each(
	data.MerchantPOIList.MerchantPOIArray.MerchantPOI,
	function(idx,obj) {
		 var infowindow = new google.maps.InfoWindow({
      content:  obj.CleansedMerchantName
    });
		var marker = new google.maps.Marker({
    position: new google.maps.LatLng(obj.Latitude,obj.Longitude),
    map: map,
    title: obj.CleansedMerchantName,
  });
		google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
	});
	

}

var myPos;
if("geolocation" in navigator) {
	navigator.geolocation.getCurrentPosition(function(position) {
  myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  map = new google.maps.Map(document.getElementById('map'), {
  center: myPos,
  zoom: 15,
  mapTypeId: google.maps.MapTypeId.ROADMAP
});
//load transaction data
var loadTransaction = $.Deferred();
loadTransaction.promise(transactionData);

transactionData.done(function() {

var heatmap = new google.maps.visualization.HeatmapLayer({
  data: transactionData.getData()
});
  heatmap.set('radius',40);
  heatmap.setMap(map);
  console.log("Done Loading data");
});

loadTransaction.resolve();
})

//load merchant data for 5811,5812,5813,5814 as competitors
merchantData.getData();

}

//load events nearby today


}
});
console.log('Loaded');

