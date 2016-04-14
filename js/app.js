'use strict';
//Variable de configuracion basica de la aplicacion.
var configuration = {
	urlService:					"http://services.arcgis.com/K99CvydNYkQGvDRu/arcgis/rest/services/se%C3%B1ales_rivas/FeatureServer/0",
    tipo_incidencia:			["Alta","Baja","Modificacion", "Otros", "Sin Tipo"],
    basemap:     				"streets",
    zoom:    					18,
    center:   					[-3.510596, 40.33253],
	id_Aplicacion: 				"IxHuZnJXVrOYXgQT",
	popUP_autenticacion:		false,
	cabeceras_dashboard :		["Codigo", "Tipo de Incidencia", "Fecha Creacion", "Estado" ],
	atributos_feature :			["CODIGO", "Tipo_Incidencia", "created_date", "Estado", "OBSERVACIO" ],
	grupo_acceso:{
		Rivas_Unidad_Trafico:	['SUBSANADO'],
		Rivas_Mantenimiento:	['INICIADO'],
		Rivas_OITR:				['PENDIENTE OITR']
	}
};
/***********************************************************************************************************/


require([
  'esri/map',"esri/dijit/BasemapGallery","esri/dijit/BasemapLayer","esri/symbols/PictureMarkerSymbol",
  'esri/layers/FeatureLayer','esri/urlUtils','esri/tasks/query','esri/arcgis/Portal','esri/arcgis/OAuthInfo',
  'esri/IdentityManager','jquery',"esri/arcgis/utils","dijit/layout/BorderContainer", "dijit/layout/ContentPane", 
  "dijit/TitlePane",'dojo/Deferred','dojo/domReady!'
], function (Map, BasemapGallery, BasemapLayer, PictureMarkerSymbol, FeatureLayer, urlUtils, Query, arcgisPortal, OAuthInfo, esriId, $, Deferred){

    var url, info, query, map, featureLayer, feature;
    var featureURL= configuration.urlService;

	map = new Map('mapDiv', {
      center: configuration.center,
      zoom: configuration.zoom,
      basemap: configuration.basemap
    });

	var basemapGallery = new BasemapGallery({
        showArcGISBasemaps: true,
        map: map
      }, "basemapGallery");
    basemapGallery.startup();
    basemapGallery.on("error", function(msg) {
		console.log("basemap gallery error:  ", msg);
	});

    info = new OAuthInfo({
      appId: configuration.id_Aplicacion,
      popup: configuration.popUP_autenticacion
    });

    esriId.registerOAuthInfos([info]);
//Si el usuario está identificado se ejecuta la Aplicacion
    esriId.checkSignInStatus(info.portalUrl + '/sharing').then(function(){
		new arcgisPortal.Portal(info.portalUrl).signIn().then(function (portalUser){
			portalUser.getGroups().then(function(groups){
			url = urlUtils.urlToObject(window.location.href);
				groups.forEach(function(group){
/*De acuerdo al grupo al que el usuario registrado pertenezca, se cargaran los elementos de la interfaz correspondiente*/
					switch (group.title) {
						case "Rivas_OITR":
							if (url.query != null && url.query.id != "")
								renderApp(portalUser, group.title, configuration.grupo_acceso[group.title][0]);
							else
								dashboardApp(portalUser, group.title, configuration.grupo_acceso[group.title][0]);
						break;
						case "Rivas_Unidad_Trafico":
							if (url.query != null && url.query.id != "")
								renderApp(portalUser, group.title, configuration.grupo_acceso[group.title][0]);
							else
								dashboardApp(portalUser, group.title, configuration.grupo_acceso[group.title][0]);
						break;
						case "Rivas_Mantenimiento":
							if (url.query != null && url.query.id != "")
								renderApp(portalUser, group.title, configuration.grupo_acceso[group.title][0]);
							else
								dashboardApp(portalUser, group.title, configuration.grupo_acceso[group.title][0]);
						break;
					}
/***********************************************************************************************************************/
				});
			}, function(err){console.log(err);});
		}, function(err){console.log(err);});
    }, function(err){console.log(err);});

    $('#login').click(function (){
      esriId.getCredential(info.portalUrl + '/sharing');
    });

    $('#logout').click(function (){
      esriId.destroyCredentials();
      window.location.reload();
    });

/*Configuracion de los marcadores graficos que se colocan sobre el mapa, de acuerdo al estado de cada punto*/
	var symbolDefault = new PictureMarkerSymbol({"angle":0,"xoffset":0,"yoffset":10,"type":"esriPMS",//Coloca un marcador de color Azul en el mapa que visualizan los usuarios pertenecientes al grupo OITR
												"url":"http://static.arcgis.com/images/Symbols/Shapes/BluePin1LargeB.png",
												"contentType":"image/png","width":34,"height":34
	});
	var symbolRed = new PictureMarkerSymbol({"angle":0,"xoffset":0,"yoffset":10,"type":"esriPMS",//Coloca un marcador de color Rojo en el mapa que visualizan los usuarios pertenecientes al grupo de Mantenimiento
												"url":"http://static.arcgis.com/images/Symbols/Shapes/RedPin1LargeB.png",
												"contentType":"image/png","width":34,"height":34
	});
	var symbolGreen = new PictureMarkerSymbol({"angle":0,"xoffset":0,"yoffset":10,"type":"esriPMS",//Coloca un marcador de color Verde en el mapa que visualizan los usuarios pertenecientes al grupo Unidad de Trafico
												"url":"http://static.arcgis.com/images/Symbols/Shapes/GreenPin1LargeB.png",
												"contentType":"image/png","width":34,"height":34
	});
/***********************************************************************************************************/

//Funcion que se encarga de buscar y mostrar la informacion de un feature en los campos del formlario correspondiente.
function renderApp(usuario, grupo, estado){
/*Cambia la interfaz, ocultando el Dashboard y cargando el formulario de modificacion*/
	loadHTML("edicion");
	$('#userId').text(usuario.fullName);
	$('#avatar').attr('src','img/avatar_'+grupo+'.png');
/*De acuerdo al grupo al que el usuario registrado pertenezca, se cargaran los elementos de la interfaz correspondiente*/
	switch (grupo) {
	case "Rivas_OITR":
		$('#policia').hide();
		$('#mantenimiento').hide();
		$('#oitr').show();
	break;
	case "Rivas_Unidad_Trafico":
		$('#mantenimiento').hide();
		$('#policia').show();
		$('#detalles').prop('disabled', true);
		$('#oitr').hide();
	break;
	case "Rivas_Mantenimiento":
		$('#policia').hide();
		$('#mantenimiento').show();
		$('#oitr').hide();
	break;
	//Se pueden agregar acciones para la transformacion de la interfaz de acuerdo al grupo
	//al cual pertenece un usuario registrado.
	/*case "Rivas_Mantenimiento":
		$('#policia').hide();
		$('#mantenimiento').show();
		$('#oitr').hide();
	break;*/
	default:
		$('#policia').hide();
		$('#mantenimiento').hide();
		$('#detalles').prop('disabled', true);
		$('#oitr').hide();
	break;
}
/***********************************************************************************************************************/
//Cargamos la capa con el elemento seleccionado visible
	featureLayer = new FeatureLayer(featureURL,{
		mode: FeatureLayer.MODE_SNAPSHOT,
		definitionExpression: 'OBJECTID = ' + url.query.id,
		outFields: ['*'],
		hasAttachment: true,
		supportsAttachmentsByUploadId: true,
		isEditable: true,
		minScale: 0
	});
	featureLayer.setSelectionSymbol(symbolDefault);
	map.addLayer(featureLayer);
//Disparador: cuando se actualice el expediente
	featureLayer.on('edits-complete', function(evt){
		setTimeout(function(){
			$('#myModal').modal('hide');
			//window.alert('Expediente actualizado, nuevo Estado = ' + evt.target.graphics[0].attributes.Estado);
			document.location = "./"; 
			}, 2000);
		
    });
//Se configura el parametro de busqueda del feature que coincida con el id obtenido de la url.
	query = new Query();
	query.where = 'OBJECTID = ' + url.query.id;
	query.outSpatialReference = { wkid: 102100 };
/**************************************************************************************************************/
//Se ejecuta la busqueda sobre el feature layer y los datos correspondientes del feature se muestran en los campos
//correspondientes del formulario.
	featureLayer.selectFeatures(query,  FeatureLayer.SELECTION_NEW,  function(features) {
		if (features.length > 0) {
			feature = features[0];
			$('#codigo').val(feature.attributes[configuration.atributos_feature[0]]);
			$('#tipo').val(configuration.tipo_incidencia[feature.attributes[configuration.atributos_feature[1]]]);
			$('#fecha_alta').val(new Date(feature.attributes[configuration.atributos_feature[2]]).toLocaleDateString());
			$('#estado').val(feature.attributes[configuration.atributos_feature[3]]);
			$('#detalles').val(feature.attributes[configuration.atributos_feature[4]]);
			map.centerAt(feature.geometry);
			featureLayer.queryAttachmentInfos(feature.attributes['OBJECTID'], function(results){
				if(results.length > 0){
					$("#imagenAttach").attr('src',results[results.length-1].url);
					$("#imagenAttach").wrap($('<a>',{href:results[results.length-1].url, target:'_blank'}));
					$("#imagenAttach").show();
				}
				else{
					$("#imagenAttach").attr('src',"");
					$("#imagenAttach").hide();
				}
			});
		  if(estado != feature.attributes[configuration.atributos_feature[3]]){
			$('#detalles').prop('disabled', true);
			$('#policia').hide();
			$('#mantenimiento').hide();
			$('#oitr').hide();
			alert("La incidencia solicitada no puede ser editada por su usuario");
		  }
		}else{
			window.alert('El expediente ya no existe');
		}
	},function(error){console.log(error);dashboardApp(usuario, grupo);});
/**************************************************************************************************************/
}//end renderApp;
/***********************************************************************************************************/

//Funcion que se encarga de buscar todas las incidencias que el usuario registrdo tiene permiso de editar.
function dashboardApp(usuario, grupo, estado){
/*Cambia la interfaz, ocultando el formulario de modificacion y cargando el Dashboard*/
	loadHTML("dashboard");
	$('#userId').text(usuario.fullName);
	$('#avatar').attr('src','img/avatar_'+grupo+'.png');
//Creamos un objeto FetureLayer que contiene todos los puntos y sobre la cual se realizaran las consultas.
	featureLayer = new FeatureLayer(featureURL,{
			mode: FeatureLayer.MODE_SNAPSHOT,
			definitionExpression: "Estado = '"+estado+"'",//Se puede modificar el parametro de busqueda para ajustarlo a un caso particular de uso de la aplicacion.
			outFields: ['*'],
			minScale: 0
	});
/**************************************************************************************************************/
//El mapa se configura con los marcadores que coinciden con el color determinado por el estado y
	switch (grupo) {
		case "Rivas_OITR":
			featureLayer.setSelectionSymbol(symbolDefault);
			map.addLayers([featureLayer]);
		break;
		case "Rivas_Unidad_Trafico":
			featureLayer.setSelectionSymbol(symbolGreen);
			map.addLayers([featureLayer]);
		break;
		case "Rivas_Mantenimiento":
			featureLayer.setSelectionSymbol(symbolRed);
			map.addLayers([featureLayer]);
		break;
	}
/**************************************************************************************************************/
//Configuramos los parametros de busqueda para obtener todas las incidencias que cumplen con el estado
//que el usuario registrado tiene permiso de visualizar
	query = new Query();
	query.where = "Estado = '"+estado+"'";
	query.orderByFields = ["created_date DESC"];
	query.outSpatialReference = { wkid: 102100 };
/**************************************************************************************************************/

//Se ejecuta la busqeuda sobre el feature layer y si se encuentran incidencias que cumplen los parametros,
//se muestran en una tabla que se crea dinamicamente en la vista de Dashboard de la aplicacion.
	featureLayer.selectFeatures(query,  FeatureLayer.SELECTION_NEW,  function(features) {
		if (features.length > 0) {
			document.getElementById("dashboard_estados").innerHTML = "";
			var r = new Array(), j = 0;
			r[0] = '<thead><tr>'
			for(var header in configuration.cabeceras_dashboard){
				r[++j] = '<th>';
				r[++j] = configuration.cabeceras_dashboard[header];
				r[++j] = '</th>';
			}
			r[++j] = '</tr></thead><tbody>';
			for(var punto in features){
				r[++j] ="<tr><td>";
				r[++j] ="<input type='checkbox' value="+features[punto].attributes[configuration.atributos_feature[0]]+"></label>"+"<a href=.?id="+features[punto].attributes['OBJECTID']+">"+ features[punto].attributes['CODIGO']+"</a>";
				r[++j] = '</td><td>';
				r[++j] = configuration.tipo_incidencia[features[punto].attributes[configuration.atributos_feature[1]]];
				r[++j] = '</td><td>';
				r[++j] = new Date(features[punto].attributes[configuration.atributos_feature[2]]).toLocaleDateString();
				r[++j] = '</td><td>';
				r[++j] = features[punto].attributes[configuration.atributos_feature[3]];
				r[++j] = '</td></tr>';
			}
			r[j] = '</tbody>';
			$('#dashboard_estados').html(r.join(''));
			map.centerAt(features[0].geometry);
			map.setZoom(14);
		}
		else{
				window.alert('No existen expedientes pendientes de revision');
		}
	},function(error){console.log(error);});
/**************************************************************************************************************/	
}//end dashboardApp;
/***********************************************************************************************************/

//Accion que se ejecuta al hacer clic sobre el boton Procede de la Aplicacion. Marcamos como: PROCEDE
$('#procede').click(function(){
    feature.attributes.Estado = 'PENDIENTE OITR';
    feature.attributes.OBSERVACIO = $('#detalles').val();
    featureLayer.applyEdits(null, [feature], null);
    alert("Se han hecho los cambios satisfactoriamente.");
    document.location = "./";
  });
/***********************************************************************************************************/

//Accion que se ejecuta al hacer clic sobre el boton No Procede de la Aplicacion. Marcamos como: No Procede
$('#no_procede').click(function(){
    feature.attributes.Estado = 'NO-PROCEDE-FINALIZADO';
    feature.attributes.OBSERVACIO = $('#detalles').val();
    featureLayer.applyEdits(null, [feature], null);
    alert("Se han hecho los cambios satisfactoriamente.");
    document.location = "./";
  });
/***********************************************************************************************************/

//Accion que se ejecuta al hacer clic sobre el boton Subsanado de la Aplicacion. Marcamos como: Subsanado
$('#subsanado').click(function(){
	feature.attributes.Estado = 'INICIADO';
	feature.attributes.OBSERVACIO = $('#detalles').val();
	if(document.getElementById("imagenUp").value != ""){
		var formData = new FormData();
		formData.append('attachment',document.querySelector('input[type=file]').files[0]);
		featureLayer.addAttachment(feature.attributes['OBJECTID'],formData,
		function(callback){
			featureLayer.applyEdits(null, [feature], null);
			$('#myModal').modal('hide');
			console.log(callback);
		},
		function(err){
			console.log(err);
		});
		$('#myModal').modal('show');
	}
	else{
		$('#myModal').modal('show');
		featureLayer.applyEdits(null, [feature], null);
	}
  });
/***********************************************************************************************************/

//Accion que se ejecuta al hacer clic sobre el boton Finalizado de la Aplicacion. Marcamos como: Finalizado
$('#finalizado').click(function(){
	feature.attributes.Estado = 'FINALIZADO';
    feature.attributes.OBSERVACIO = $('#detalles').val();
    featureLayer.applyEdits(null, [feature], null);
    alert("Se han hecho los cambios satisfactoriamente.");
    document.location = "./";
});
/***********************************************************************************************************/

//Accion que se ejecuta al hacer clic sobre el boton Dashboard de la Aplicacion. Cargar Dashboard
$('#dashboard').click(function(){
	document.location = "./";
	});
/***********************************************************************************************************/

function loadHTML(estado){
	if(estado == "dashboard"){
		$('#dashboard_panel').show();
		$('#acceso').hide();
		$('#formulario').show();
		$('#login-status').show();
		$('#logo').removeClass("col-sm-12");
		$('#logo').addClass("col-sm-9");
		$('#informacion_feature').hide();
		$('#detalles_panel').hide();
		$('#mantenimiento').hide();
		$('#policia').hide();
		$('#oitr').hide();
	}
	else if(estado == "edicion"){
		$('#detalles_panel').show();
		$('#dashboard_panel').hide();
		$('#acceso').hide();
		$('#formulario').show();
		$('#login-status').show();
		$('#logo').removeClass("col-sm-12");
		$('#logo').addClass("col-sm-9");
	}
}
/***********************************************************************************************************/
});
/***********************************************************************************************************/
/***********************************************************************************************************/