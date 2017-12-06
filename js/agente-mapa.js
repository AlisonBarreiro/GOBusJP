/* global google */

var map;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var waypts = [];
var checkboxArray = [];

var checkTuristicos;

var checkComerciais;

var myApp = new Framework7();

var nRotas = [];

var paradas = [];

var markers = [];

function carregarPontos() {
 
    $.getJSON('js/paradas.json', function(pontos) {
 
        $.each(pontos, function(index, ponto) {
            
            paradas.push({
                        Linhas: ponto.Linhas,
                        Paradara: ponto.Parada,
                        ProximoPonto: ponto.ProximoPonto,
                        Latitude: ponto.Latitude,
                        Longitude: ponto.Longitude
            });
        });
        initialize();
        addmarket();
        //setMapOnAll(null);  
    });
} 
carregarPontos();

var rendererOptions = {
   suppressMarkers: true
};

function initialize() {	
	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
	var latlng = new google.maps.LatLng(-7.1299493, -34.8447666);
	
    var options = {
        zoom: 13,
		center: latlng,
                styles: [
                    {
        "featureType": "transit.station.bus",
        "elementType": "labels.text",
        "stylers": [
            {
                "hue": "#ff0000"
            }
        ]
    }
                ],
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("mapa"), options);
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById("trajeto-texto"));
	
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {

			pontoPadrao = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			map.setCenter(pontoPadrao);
			
			var geocoder = new google.maps.Geocoder();
			
			geocoder.geocode({
				"location": new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
            },
            function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					$("#txtEnderecoPartida").val(results[0].formatted_address);
				}
            });
		});
	}
        
        var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(map);
        
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
       
}

/* ======================================== INICIO SENSORES================================================== */

async function sensorPontoProximoPartida(enderecoPartida,enderecoChegada){
   
        var menor = 9999999;
        var linha;
        var parada;
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': enderecoPartida}, function(resultado, status) {
        if (status == google.maps.GeocoderStatus.OK) {
                for(var i = 0;i<paradas.length;i++){
                    var r = 6371.0;
       
                    var p1LA = resultado[0].geometry.location.lat() * Math.PI / 180.0;
                    var p1LO = resultado[0].geometry.location.lng() * Math.PI / 180.0;
                    var p2LA = paradas[i].Latitude * Math.PI / 180.0;
                    var p2LO = paradas[i].Longitude * Math.PI / 180.0;
       
                    var dLat = p2LA - p1LA;
                    var dLong = p2LO - p1LO;
       
                    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(p1LA) * Math.cos(p2LA) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
     
                    $distance = Math.round(r * c * 1000); // resultado em metros.

                    if($distance<menor){
                    menor = $distance;
                    enderecoPartida = {lat: paradas[i].Latitude, lng: paradas[i].Longitude};
                    linha = paradas[i].Linhas;
                    parada = paradas[i].Parada;
                    
                    }  
                }
                sensorPontoProximoChegada(enderecoPartida,enderecoChegada,linha, parada);
            }
        });  
    
}

async function distanciaPonto(ponto1,ponto2){

        var r = 6371.0;
       
        ponto1.lat = ponto1.lat * Math.PI / 180.0;
        ponto1.lng = ponto1.lng * Math.PI / 180.0;
        ponto2.lat = ponto2.lat * Math.PI / 180.0;
        ponto2.lng = ponto2.lng * Math.PI / 180.0;
       
        var dLat = ponto2.lat - ponto1.lat;
        var dLong = ponto2.lng - ponto1.lng;
       
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(ponto1.lat) * Math.cos(ponto2.lat) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
     
        $distance = Math.round(r * c * 1000); // resultado em metros.

    
}


async function sensorPontoProximoChegada(enderecoPartida,enderecoChegada, linhaInicial, paradaInicial){
   
        var menor = 9999999;
        var geocoder = new google.maps.Geocoder();
        var linhaFinal;
        var paradaFinal;
        geocoder.geocode( { 'address': enderecoChegada}, function(resultado, status) {
        if (status == google.maps.GeocoderStatus.OK) {
                for(var i = 0;i<paradas.length;i++){
                   var r = 6371.0;
       
                    var p1LA = resultado[0].geometry.location.lat() * Math.PI / 180.0;
                    var p1LO = resultado[0].geometry.location.lng() * Math.PI / 180.0;
                    var p2LA = paradas[i].Latitude * Math.PI / 180.0;
                    var p2LO = paradas[i].Longitude * Math.PI / 180.0;

                    var dLat = p2LA - p1LA;
                    var dLong = p2LO - p1LO;

                    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(p1LA) * Math.cos(p2LA) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                    $distance = Math.round(r * c * 1000); // resultado em metros.
                    if($distance<menor){
                        menor = $distance;
                        enderecoChegada = {lat: paradas[i].Latitude, lng: paradas[i].Longitude};
                        linhaFinal = paradas[i].Linhas;
                        paradaFinal = paradas[i].Parada;

                    }  

                }
                sensorGetDirection(enderecoChegada,enderecoPartida);
                verifyLinha(enderecoPartida,enderecoChegada,linhaInicial, paradaInicial,linhaFinal,paradaFinal);
            }
        });  
    
}

function sensorGetDirection(endpoint, startpoint) {
    var radians = getAtan2((endpoint.lng - startpoint.lng), (endpoint.lat - startpoint.lat));

    function getAtan2(y, x) {
        return Math.atan2(y, x);
    };

    var compassReading = radians * (180 / Math.PI);

    //var coordNames = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
    var ucoordNames = ["N", "N", "N", "S", "S", "S", "S", "N", "N"];
    var coordIndex = Math.round(compassReading / 45);
    if (coordIndex < 0) {
        coordIndex = coordIndex + 8
    };
    console.log("DIR: "+ucoordNames[coordIndex]);
}

/* ========================================FIM SENSORES================================================== */

/* ========================================INICIO ATUADORES============================================== */

function validateTuristicos(){
        if(document.getElementById("pTuristicos").checked){
            checkTuristicos = true;
        }else{
            checkTuristicos = false;
        }  
}
function validateComerciais(){
        if(document.getElementById("pComerciais").checked){
            checkComerciais = true;
        }else{
            checkComerciais = false;
        }  
}

$("form").submit(function(event) {
	event.preventDefault();

	var enderecoPartida = $("#txtEnderecoPartida").val();
	var enderecoChegada = $("#txtEnderecoChegada").val();
            
        sensorPontoProximoPartida(enderecoPartida,enderecoChegada);        
});

function desenhaPontos() {
        if(document.getElementById("clikPontos").checked){
            setMapOnAll(map);
        }else{
            setMapOnAll(null);
        }
}

function addmarket(){
    for(var i = 0;i<paradas.length;i++){
            if(paradas[i].Linhas.indexOf("1001")!==-1){
              var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(paradas[i].Latitude, paradas[i].Longitude),
                    map: map,
                    icon: 'img/icons/bus-icon-1001.png'
                });  
                markers.push(marker);
            }if(paradas[i].Linhas.indexOf("1002")!==-1){
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(paradas[i].Latitude, paradas[i].Longitude),
                    map: map,
                    icon: 'img/icons/bus-icon-1002.png'
                });
                markers.push(marker);
            }if(paradas[i].Linhas.indexOf("1002")!==-1){
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(paradas[i].Latitude, paradas[i].Longitude),
                    map: map,
                    icon: 'img/icons/bus-icon-1002.png'
                });
                markers.push(marker);
            }if(paradas[i].Linhas.indexOf("1003")!==-1){
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(paradas[i].Latitude, paradas[i].Longitude),
                    map: map,
                    icon: 'img/icons/bus-icon-1003.png'
                });
                markers.push(marker);
            }if(paradas[i].Linhas.indexOf("1004")!==-1){
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(paradas[i].Latitude, paradas[i].Longitude),
                    map: map,
                    icon: 'img/icons/bus-icon-1004.png'
                });
                markers.push(marker);
            }if(paradas[i].Linhas.indexOf("1001")!==-1&&paradas[i].Linhas.indexOf("1002")!==-1){
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(paradas[i].Latitude, paradas[i].Longitude),
                    map: map,
                    icon: 'img/icons/bus-icon-all.png'
                });
                markers.push(marker);
            }
            
        }
        setMapOnAll(map);  
}

function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
    }
}
/* ========================================FIM ATUADORES================================================= */

/* ========================================INICIO MEDIDA DESEMPENHO====================================== */
function verifyLinha(enderecoPartida,enderecoChegada,linhaInicial, paradaInicial,linhaFinal,paradaFinal){

        var valid = false;
        for(var i = 0; i<linhaInicial.length ;i++){
            if(linhaFinal.indexOf(linhaInicial[i])!==-1){
               valid = true;
               break;
               
            }

        }
        if(valid){
            for (var i = 0; i < checkboxArray.length; i++) {
            
                    waypts.push({
                        location: checkboxArray[i],
                        stopover: false
                    });
                }
                ambienteDesenhaNoMAPA(enderecoPartida,enderecoChegada, waypts); 
        }else{
            
            
        }               
       // checkboxArray.push(new google.maps.LatLng(-7.14801, -34.8436));
        
         
}

/* ========================================FIM MEDIDA DESEMPENHO========================================= */

/* ========================================INICIO AMBIENTE=============================================== */

function ambienteDesenhaNoMAPA(enderecoPartida,enderecoChegada,waypts){
    var request = {
		origin: enderecoPartida,
		destination: enderecoChegada,
                waypoints: waypts,
                optimizeWaypoints: true,    
		travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
	};
	
	directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
                        var distanciaEmMetros = result.routes[0].legs[0].distance.value;
                         myApp.alert(distanciaEmMetros+' Metros','Distancia: ');
			directionsDisplay.setDirections(result); 
                        
                        
		}
	});
}
/* ========================================FIM AMBIENTE================================================== */








