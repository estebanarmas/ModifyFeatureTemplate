#Aplicación para el Mantenimiento de Incidencias Viales.
Esta aplicación fue desarrollada como solución para la gestión de las incidencias viales que se generan en el Municipio de Rivas. La aplicación es completamente responsive y aunque fue ideada como una aplicación para dispositivos móviles, funciona perfectamente en ordenadores de escritorio.

# Manual 

## Instalación

###Requisitos
Servidor Web, ej: Apache, IIS, Nginx, etc.

###Pasos
1. [Descargar](https://github.com/estebanarmas/ModifyFeatureTemplate/archive/master.zip) la aplicación del repositorio de GitHub.
2.	Descomprimirlo en la raíz del servidor web.
3.	Acceder a la página de inicio desde cualquier navegador.

## Configuración

### Configuración de la aplicación.

Para configurar la aplicación es necesario modificar la variable configuración dentro del fichero app.js que se encuentra en la carpeta JS de la aplicación.

````Javascript
var configuration = {
    urlService:				"http://services.arcgis.com/arcgis/rest/services/FeatureServer/0",
    tipo_incidencia:			["XXXX","XXXX"...],
    basemap:     				"streets",
    zoom:    					18,
    center:   					[-3.510596, 40.33253],
	id_Aplicacion: 				"XXXXXXXXXXXXX",
	popUP_autenticacion:		false,
	cabeceras_dashboard :		["XXXX", "XXXX", "XXXX"...],
	atributos_feature :			["XXXX", "XXXX", "XXXX",...],
	grupo_acceso:{
		Rivas_Unidad_Trafico:	['XXXX'],
		Rivas_Mantenimiento:	['XXXX'],
		Rivas_OITR:		['XXXX']
	}
};
````
* **urlService**:
En este campo se especifica la dirección del servicio sobre el cual la aplicación consumirá los datos que se modificaran.
* **tipo_incidencia**:
Se detallan los tipo de incidencias que la aplicación puede reportar. Ej: ````["Alta","Baja","Modificacion", "Otros", "Sin Tipo"] ````
* **basemap**:
Puede escogerse distintos tipos de mapas base sobre los cuales se mostraran los datos en la aplicación.
* **zoom**:
El zoom por defecto que tendrá el mapa al momento de mostrarse. Ej: 18
* **center**:
La ubicacion del centro del mapa, corresponde sobre al área que el servicio utilizado abarca. Ej: ````[-3.510596, 40.33253] ````
* **id_Aplicacion**:
Id de la aplicación que se obtiene del Portal de Arcgis Online, será de utilidad para el acceso de los usuarios autorizados a usar la aplicación.
* **popUP_autenticacion**:
Para la autenticación del usuario se puede mostrar la interfaz de acceso mediante una ventana emergente o dentro de la misma ventana de la aplicación, este campo puede ser: ````true```` o `````false ```.
* **cabeceras_dashboard**:
Se agregan las cabeceras de la tabla que en el Dashboard de la aplicación se mostrara, Ej: ````["Codigo", "Tipo de Incidencia", "Fecha Creacion", "Estado" ]````.
* **atributos_feature**:
Se debe especificar exactamente cada uno de los atributos del servicio que se va a utilizar. Ej: ````["CODIGO", "Tipo_Incidencia", "created_date", "Estado", "OBSERVACIO" ]````.
* **grupo_acceso**:
En esta sección se debe especificar el grupo al cual cada usuario con acceso a la aplicación pertenece y el tipo de "Estado" sobre el cual tiene permiso de modificación. Ej:
````Javascript
{
	Rivas_Unidad_Trafico:	['SUBSANADO'],
	Rivas_Mantenimiento:	['INICIADO'],
	Rivas_OITR:		['PENDIENTE OITR']
}
````
## Funciones Principales
El funcionamiento de la aplicación recae sobre dos funciones especificas, que son:
````Javascript
function renderApp(usuario, grupo, estado);
````
````Javascript
function dashboardApp(usuario, grupo, estado);
````
* **Funcion renderApp**:
Se encarga de generar el formulario que se utiliza para mostrar y modificar los atributos de un feature que se seleccione del dashboard y que su ID es obtenida desde la URL del navegado.
La función se encarga de verificar si es que el usuario tiene los permisos de modificación hacia el feature solicitado, de esta forma si el ID en la URL es modificado, el usuario puede mirar los detalles del feature pero no puede modificar ningún campo.
De igual manera, de acuerdo al rol del usuario, se habilitan las opciones específicas de cada rol para modificar un feature.
* **Funcion dashboardApp**:
Esta función genera el panel de dashboard de la aplicación, la cual permite mostrar todas las incidencias pendientes de gestión que un usuario tiene.
Los campos que se muestran en este panel son los que se especifican en la variable de configuración: ````cabeceras_dashboard & atributos_feature````.

## Interfaz de Usuario
### Modificación de Estado
La interfaz de modificación de estado, se genera a través de la función renderApp, antes mencionada.

![Interfaz de Modificación de Estado](https://i.imgsafe.org/fca3785.png "Formulario de Modificación de Estado")

Se muestran todos los campos que se seleccionan del servicio y además el ubica en el mapa el punto en donde se encuentra la incidencia.
El campo * **Imagen Actual** muestra la imagen que al momento de generarse la incidencia se coloco y permite ocultar o mostrar la imagen al hacer clic sobre la etiqueta "Imagen Actual".
### Dashboard de la Aplicación
En esta interfaz se muestran todas las incidencias que se correspondan al estado al cual el usuario registrado tiene permiso de acceso y modificación.

![Dashboard correspondiente a las incidencias reportadas](https://i.imgsafe.org/fb68f25.png "Panel de Administración de Incidencias de un usuario")

En el mapa se muestran todas las incidencias que en la tabla de dasboard se listan, el mapa se centraliza en la última incidencia reportada, pero se puede observar todas las incidencias reduciendo el zoom mediante el scroll del mouse, desde una navegador de escritorio, o con los dedos, desde un dispositivo móvil.

##Modificaciones
Se pueden realizar modificaciones de acuerdo a las necesidades que se requieran, esto se lo puede hacer de manera sencilla, modificando los campos de la variable configuración:

* **urlService**
* **cabeceras_dashboard**
* **atributos_feature**
* **grupo_acceso**

Cada uno de estos parámetros permite la utilización de un servicio diferente y se deben configurar de acuerdo a las características del servicio que se utilizara.
Los atributos del servicio deben corresponderse exactamente con los que se declaran en el parámetro ````atributos_feature```` y de igual manera los grupos de acceso y sus correspondientes estados a los que un usuario tiene permiso.

De igual forma, la interfaz deberá ser modificada adecuando a las nuevas características del servicio utilizado, para el cambio de cualquier atributo de un feature dentro del servicio.

* **El código de la aplicación se encuentra completamente comentado para que se pueda reutilizar y modificar sin problemas.**

## FAQ

Para dudas y sugerencias puede dirigirse a los [issues del proyecto](https://github.com/estebanarmas/ModifyFeatureTemplate/issues).
