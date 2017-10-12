var map = null;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		mapTypeControl: false,
		zoomControl: true,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		rotateControl: false
	});
};

function showDicas()
{
	$('#modalInstrucoes').modal('show');
};

(function()
{ 

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('quadraCtrl', quadraCtrl)

	quadraCtrl.$inject = [ '$scope', '$compile', '$sce', '$interval', '$timeout', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Coordenadas', 'Notify',  '$geofire', 'Controleacesso'];

	function quadraCtrl($scope,  $compile,  $sce,  $interval, $timeout, $firebaseArray, $firebaseObject, Session, Constant, Coordenadas, Notify,  $geofire, Controleacesso) 
	{

		angular.extend($scope, {
			edit: false,
			save: true,
			arquivoCarregado: false,
			desabilitaFazenda: false,
			arquivoCarregado:false,
			fazendas: [],
			quadras: [],
			todascoordenadas:[],
			todascoordenadasgeo:[],
			quadraFilial: [],
			data: {
				nome: '',
				coordenadas: false,
				ativo: true,
				codigo: '',
				dataStr_ultalt:'',
				data_ultalt:0,
				key:''			
			}
		});		

		$scope.menu  = $sce.trustAsHtml(window.localStorage.getItem('menu'));
		$scope.fazendas  = JSON.parse(window.localStorage.getItem('todasFiliais'));
		$scope.posicaoFilial = window.localStorage.getItem('posicaoFilial');
		$scope.fazenda  = $scope.fazendas[$scope.posicaoFilial];
		var key_usuario  = window.localStorage.getItem('key_usuario');

		function initMap(center, zoom){

			var mapOptions = {
				zoom: zoom,
				center: center,
				mapTypeId: google.maps.MapTypeId.HYBRID
			}

			map = new google.maps.Map(document.getElementById('map'), mapOptions);
		};

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "codigo", displayName: "Código", width: 80 },
			{ field: "nome", displayName: "Nome", width: 200 },
			{ field: "coordenadas", displayName: "Coordenadas", width: 150,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" },
			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.coordenadas ? 'Sim' : 'Não';
				}
			}
		};

		$scope.toggleMultiSelect = function() {
			$scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
		};


		$scope.gridOptions.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.chamaEditar(row.entity);
			});
		};


		//$scope.printRouter();


		//var ref = new Firebase(Constant.Url + '/coordenada');
		//$scope.todasQuadras = $firebaseArray(ref);

		//var ref = new Firebase('https://pragueirodebug.firebaseio.com/raiz/coordenada/');
		//$scope.todasQuadrasBKP = $firebaseArray(ref);

	//var ref2 = new Firebase(Constant.Url + '/quadra');
	//$scope.todasQuadrasMesmo = $firebaseArray(ref2);
	

	$scope.todasQuadrasMesmo =[];
/*
	var refCoordenadageo= new Firebase(Constant.Url + '/quadra');
	refCoordenadageo.on('child_added', function(snap) {
		var objNovo= snap.val();
		$scope.todasQuadrasMesmo.push(objNovo);
	});

	*/
	initMap(new google.maps.LatLng(-20, -55), 4 );




		//console.log('O q tinha:' + Coordenadas.getCoordendas());
		//console.log('Setamdp:' + Coordenadas.setCoordenadas('setandooo'));
		//console.log('O q voltou:' + Coordenadas.getCoordendas());
		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA/FILIAL
		//############################################################################################################################

		function atualizaListaFiliais()
		{
			$scope.chengeFazenda($scope.fazenda);

			var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
			var refNovo = new Firebase.util.NormalizedCollection(
				[baseRef.child("/usuario/"+key_usuario+"/filial/"), "$key"],
				baseRef.child("/filial")
				).select(
				{"key":"$key.$key","alias":"key"},
				{"key":"filial.$value","alias":"filial"}
				).ref();

				refNovo.on('child_changed', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo = snap.val();
					var posicao = null;
					$scope.fazendas.forEach(function(obj) {
						if (obj.key === objNovo['filial'].key) {
							posicao = $scope.fazendas.indexOf(obj);
						}
					});
					if (posicao != null)
						$scope.fazendas[posicao] = objNovo['filial'];

					if(objNovo['filial'].key==$scope.fazenda.key)
					{
						window.localStorage.setItem('filialCorrente', JSON.stringify( objNovo['filial']));
						$scope.fazenda=objNovo['filial'];
					}
					window.localStorage.setItem('todasFiliais', JSON.stringify( $scope.fazendas));

				});
			}		
		//--
		$scope.chengeFazenda = function(fazenda){
			$('#myPleaseWait').modal('show');

			//--------------------------------------
			//Controle Acesso	
			$scope.objetoTelaAcesso=fazenda.aceempsObj.quadra;

			if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
			{
				window.location.href = '#home';
			}
			//-------------------------------------
			else
			{
				$scope.clear();

				if(fazenda === null) 
				{
					$scope.quadras =null;
				}
				else
				{
					$scope.quadras=[];
					$scope.gridOptions.data = $scope.quadras;

					if(fazenda.quadra!=null)
					{
						$scope.qtde_quadras=castObjToArray(fazenda.quadra).length;
					}
					else
					{
						$scope.qtde_quadras=0;
						$('#myPleaseWait').modal('hide');	
					}

					$scope.todascoordenadasgeo =[];

					var refCoordenadageo= new Firebase(Constant.Url + '/coordenadageo/'+fazenda.key);
					refCoordenadageo.on('child_added', function(snap) {
						var objNovo= snap.val();
						objNovo['key']=snap.key();
						$scope.todascoordenadasgeo.push(objNovo);
					});

					refCoordenadageo.on('child_removed', function(snap) {
						var objNovo= snap.val();

						var x=0;
						var posicao=null;
						$scope.todascoordenadasgeo.forEach(function(obj){
							if(obj.key === snap.key())
							{ 
								posicao=x;
							}
							x++;

						});

						if(posicao!=null)
							$scope.todascoordenadasgeo.splice(posicao, 1);

					});



					var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
					var refNovoQuadra = new Firebase.util.NormalizedCollection(
						baseRef.child("/filial/"+fazenda.key+"/quadra"),
						[baseRef.child("/quadra"), "$key"]
						).select(
						{"key":"quadra.$value","alias":"filial"},
						{"key":"$key.$value","alias":"quadras"}
						).ref();

						refNovoQuadra.on('child_added', function(snap) {
							$('#myPleaseWait').modal('hide');
							var objNovo= snap.val();
							$scope.quadras.push(objNovo['quadras']);
							if(!$scope.$$phase) {
								$scope.$apply();
							}
							$scope.gridOptions.data = $scope.quadras;
						});

						refNovoQuadra.on('child_changed', function(snap) {
							$('#myPleaseWait').modal('hide');
							var objNovo= snap.val();
							var posicao=null;
							$scope.quadras.forEach(function(obj){
								if(obj.key === objNovo['quadras'].key)
								{ 
									posicao=$scope.quadras.indexOf(obj);
								}

							});
							if(posicao!=null)
								$scope.quadras[posicao]=objNovo['quadras'];

							if(!$scope.$$phase) {
								$scope.$apply();
							}
						});

						refNovoQuadra.on('child_removed', function(snap) {
							var posicao;
							$scope.quadras.forEach(function(obj){
								if(obj.key === snap.key())
								{ 
									posicao=$scope.quadras.indexOf(obj);
								}
							});
							if(posicao!=null)
								delete $scope.quadras[posicao];

						});



					}
				}
			};

		//############################################################################################################################
		//############################################################################################################################
		// QUADRA
		//############################################################################################################################
		$scope.check = function(){
			var quadrasAdd=[];
			
			$scope.todasQuadrasBKP.forEach(function(bkp){
				var tem=false;
				$scope.todasQuadras.forEach(function(item){
					if(bkp.$id==item.$id)
					{
						tem=true;

					}
				});
				if(!tem)
				{

					quadrasAdd.push(bkp);
				}
			});
			

			quadrasAdd.forEach(function(item){

				if(item!=null)
				{

						//if(tem)
						//{
							var caminho=Constant.Url + '/coordenada/'+item.$id;



							delete item.$$hashKey;	
							delete item.$id;	
							delete item.$priority;	
							//console.log('');
							var refQuadraNovo = new Firebase(caminho);
							refQuadraNovo.set(item);
						//}
					//	
				}
			});
		}
		$scope.getDadosQuadra = function(obj, nomeColuna){
			var retorno = '';
			if(nomeColuna=='nome')
			{
				$scope.todasQuadras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['nome'];
				});
			}
			if(nomeColuna=='codigo')
			{
				$scope.todasQuadras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['codigo'];
				});
			}
			if(nomeColuna=='ativo')
			{
				$scope.todasQuadras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['ativo'];
				});
			}
			if(nomeColuna=='coordenadas')
			{
				$scope.todasQuadras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['coordenadas'];
				});
			}
			return retorno;
		};

		$scope.salvarQuadra = function(data){
			if(validForm(data)) return false;
			if($scope.fazenda  == null) return false;

			delete data.$$hashKey;	
			data['filial']=[];
			data['filial'][$scope.fazenda.key]=true;
			var refQuadra = new Firebase(Constant.Url + '/quadra/');
			var key=refQuadra.push().key();
			var refQuadraNovo = new Firebase(Constant.Url + '/quadra/'+key);
			data.key=key;
			refQuadraNovo.set(data);
			var refQuadraNovo = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/quadra/'+key);
			refQuadraNovo.set(true);	
			Notify.successBottom('Quadra inserida com sucesso!');
			$scope.cancelar();

			//$('#modalAviso').modal('show');
		};


		$scope.editarQuadra = function(data){
			if(validForm(data)) return false;
			if($scope.fazenda ==null) return false;

			delete data.$$hashKey;
			var refQuadra = new Firebase(Constant.Url + '/quadra/'+data.key);
			refQuadra.set(data);
			$scope.cancelar();
			Notify.successBottom('Quadra atualizada com sucesso!');

		};

		$scope.excluir = function()
		{
			$('#modalDelete').modal('show');
			return true;

		};

		$scope.excluirQuadra = function(objeto)
		{
			$('#modalDelete').modal('hide');
			if($scope.fazenda ==null) return false;

			if(objeto!=null && objeto.key!=null)
			{
				if(objeto.data_ultalt!=null)
				{
					if(objeto.data_ultalt!='')
					{
						setMessageError('Já foi feito vistoria. Apenas desative a quadra/região!');
						return;
					}
				}

				var refQuadraNovo = new Firebase(Constant.Url + '/quadra/'+objeto.key);
			//refQuadraNovo.remove();
			var refQuadraNovo = new Firebase(Constant.Url + '/filial/'+ $scope.fazenda.key + '/quadra/'+objeto.key);
			refQuadraNovo.remove();
			Notify.successBottom('Quadra removida com sucesso!');
			$scope.cancelar();	
		}

	};

	$scope.cancelar = function(){
		$scope.clear();
		$scope.edit = false;
		$scope.save = true;
		setaCoordenadas();		
	};

	$scope.chamaEditar = function(obj)
	{			
		$('#myPleaseWait').modal('show');

			//$scope.map.control.getGMap().setZoom(3);
			$scope.desabilitaFazenda=true;
			$scope.data = obj;
			$scope.edit = true;
			$scope.save = false;
			$scope.todascoordenadas=[];
			$scope.todascoordenadasCentroid=[];
			if(!$scope.data.coordenadas)
			{
				$('#myPleaseWait').modal('hide');
				setaCoordenadas();
				return true;
			}
			else
			{
				var refCoordenadas = $firebaseArray(new Firebase(Constant.Url + '/coordenada/'+ $scope.data.key));
				var i=0;
				
				$scope.todascoordenadas=[];
				$scope.todascoordenadasCentroid=[];

				refCoordenadas.$loaded(function() {

					refCoordenadas.forEach(function(coordenadas){
						var novo=[];
						novo['latitude']=coordenadas.latitude;
						novo['longitude']=coordenadas.longitude;
						$scope.todascoordenadas.push(new google.maps.LatLng(coordenadas.latitude, coordenadas.longitude));

						//$scope.todascoordenadas.push(novo);

						var novoCentroid=[];
						novoCentroid['x']=coordenadas.latitude;
						novoCentroid['y']=coordenadas.longitude;
						$scope.todascoordenadasCentroid.push(novoCentroid);						
					});
					console.log('terminou');
					setaCoordenadas();
					return true;

					if(!$scope.$$phase) {
						$scope.$apply();
					}

					$('#myPleaseWait').modal('hide');

				});
			}
		};

/*
		uiGmapIsReady.promise().then(function (maps) {

			$timeout(function(){

			});

		});
		*/
		




		$scope.mostrarImportacao = function()
		{
			$scope.mostrarImportacao=false;
		}

		$scope.refreshMap = function(novo){
			$scope.map.show = true;

			uiGmapIsReady.promise()
			.then(function (map_instances) {
				$scope.map.control.refresh(novo);
			});
		}

		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################

		function clone(obj) {
			if (null == obj || "object" != typeof obj) return obj;
			var copy = obj.constructor();
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
			}
			return copy;
		}

		$scope.setaFazenda = function(fazenda){
			if(fazenda === null) return false;

			$scope.fazendas.forEach(function(item){
				if(item.key === fazenda.key) 	
				{
					$scope.data.fazenda = item;		
				}
			});
			
		};

		function setMessageError(message){
			Notify.errorBottom(message);
		};

		function validForm(data){
			if($scope.fazenda.key == null){
				setMessageError('O campo fazenda é inválido!');
				return true;
			}
			if(data.nome === ''){
				setMessageError('O campo nome é inválido!');
				return true;
			}
			if(data.ativo === ''){
				setMessageError('O campo ativo é inválido!');
				return true;
			}
			if(data.coordenadas === ''){
				setMessageError('O campo coordenada é inválido!');
				return true;
			}
			return false;
		};
		
		$scope.clear = function(){
			$scope.todascoordenadas=[];
			$scope.todascoordenadasCentroid=[];
			angular.extend($scope.data, {
				nome: '',
				coordenadas: false,
				ativo: true,
				codigo: '',
				dataStr_ultalt:'',
				data_ultalt:0,
				key:''
			});
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
			$scope.save=true;

			if(!$scope.$$phase) {
				$scope.$apply();
			}
		};
		
		//############################################################################################################################
		//############################################################################################################################
		//UPLOAD
		//############################################################################################################################

		$scope.salvarArquivo= function(data)
		{
			if(data==null || data.fazenda.key == null || data.key == null)
			{
				return true;
			}
			$('#myPleaseWait').modal('show');
			excluirCoordenadasGeo(data.fazenda.key, data.key);
			var refCoordenadasGeoFire = $firebaseArray(new Firebase(Constant.Url + '/coordenadageo/'+data.fazenda.key));

			refCoordenadasGeoFire.$loaded(function() {
				refCoordenadasGeoFire.forEach(function(coordenadas){
					if(coordenadas.key!=null)
					{
						var refCor = new Firebase(Constant.Url + '/coordenadageo/'+data.fazenda.key+'/'+coordenadas.key);
						refCor.remove();
					}
				});
			});

			var listaProntaSalvar=[];
			var old;
			$scope.todascoordenadas.forEach(function(obj){
				if(old!=null)
				{
					listaProntaSalvar.push(obj);
				}
				else
				{
					old=obj;
					listaProntaSalvar.push(obj);
				}
			});

			var i=0;


			var refCoord = new Firebase(Constant.Url + '/coordenada/'+data.key);
			refCoord.remove();
			var refCor = new Firebase(Constant.Url + '/coordenadageo/'+data.fazenda.key);

			var geoFire = new GeoFire(refCor);

			var refQuadra = new Firebase(Constant.Url + '/quadra/'+data.key+'/coordenadas');
			refQuadra.set(true);
			var listaProntaSalvarFirebase={};
			var listaProntaSalvarFirebaseGEOFIRE={};
			listaProntaSalvar.forEach(function(obj)
			{			
				geoFire.set(data.key + '_pos'+ i, [obj.lat(), obj.lng()]);

				var key=refCoord.push().key();
				var refQuadraNovo = new Firebase(Constant.Url + '/coordenada/'+data.key+'/'+key);

				listaProntaSalvarFirebase[key]={};
				listaProntaSalvarFirebase[key]['key'] = key;
				listaProntaSalvarFirebase[key]['key_quadra']=data.key;
				listaProntaSalvarFirebase[key]['tipo']=i;
				listaProntaSalvarFirebase[key]['latitude']=obj.lat();
				listaProntaSalvarFirebase[key]['longitude']=obj.lng();				
				i++;
			});		

			refCoord.set(listaProntaSalvarFirebase, function (err) {
				if (err) {
					Notify.errorBottom('Houve um problema ao salvar:' + err);
				} else {
					Notify.successBottom('Coordenadas adicionadas com sucesso!');
				}
				$('#myPleaseWait').modal('hide');
			});
		}

		$scope.limparArquivo= function(data)
		{
			$scope.todascoordenadasCentroid=[];
			$scope.todascoordenadas=[];
			if(data!= null && data.coordenadas)
			{
				$scope.chamaEditar(data);
			}
			else
			{
				setaCoordenadas();
			}
		}

		function excluirCoordenadasGeo(key_fazenda, key_quadra)
		{
			var listaDeletar=[];
			for(var i in $scope.todascoordenadasgeo) 
			{
				if($scope.todascoordenadasgeo[i].key.indexOf(key_quadra + '_pos')>-1)
				{
					listaDeletar[$scope.todascoordenadasgeo[i].key] = null;
				}
			}
			var refQuadraNovo = new Firebase(Constant.Url + '/coordenadageo/'+key_fazenda + '/' );
			refQuadraNovo.set(listaDeletar);						
		}

		function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) 
		{
			var R = 6371; 
			var dLat = deg2rad(lat2-lat1);  
			var dLon = deg2rad(lon2-lon1); 
			var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2)
			; 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c; 
			return d *1000;
		}

		function deg2rad(deg) {
			return deg * (Math.PI/180)
		}

		function setaCoordenadas()
		{
			if($scope.todascoordenadasCentroid != null && $scope.todascoordenadasCentroid.length>0 && $scope.todascoordenadas.length>0)
			{

				var region = new Region($scope.todascoordenadasCentroid);			
				initMap(new google.maps.LatLng(region.centroid().x, region.centroid().y), 14);

				var bermudaTriangle = new google.maps.Polygon({
					paths: $scope.todascoordenadas,
					strokeColor: '#212121',
					strokeOpacity: 0.8,
					strokeWeight: 3,
					fillColor: '#fd541f',
					fillOpacity: 0.90
				});
				bermudaTriangle.setMap(map);


			}
			else
			{
				initMap(new google.maps.LatLng(-20, -55), 4 );
			}
			if(!$scope.$$phase) 
			{
				$scope.$apply();
			}

			$('#myPleaseWait').modal('hide');
		}

		$scope.uploadFiles = function(file, errFiles) 
		{
			try {
				var fileInputElement = document.getElementById("fileInputElement");
				var fr = new FileReader();
				if(fileInputElement.files[0].name.indexOf(".kml") >-1)
				{
						//var xml = new KmlMapParser({ map: map, kml: fileInputElement.files[0], });

						fr.onload = (function(theFile) {
							return function(e) {
								var xmlDoc = parseXML(e.target.result);
								$scope.processaArquivo_KML(xmlDoc);
							};
						})(fileInputElement.files[0]);						
						fr.readAsText(fileInputElement.files[0]);
					}
					else if(fileInputElement.files[0].name.indexOf(".shp") > -1)
					{
						

						fr.readAsArrayBuffer(fileInputElement.files[0]);
						fr.onload = function () {
							var imageData = fr.result;
							shapefile.open(imageData)
							.then(source => source.read()
								.then(function log(result) {
									if (result.done) return;
									console.log(result.value);
									$scope.processaArquivo_SHAPE(result.value["geometry"]["coordinates"]);
									return source.read().then(log);
								}))
							.catch(error => mostrarAlerta(error.stack));
						};
					}
					else
					{
						alert('ATENÇÂO \n\n Fomato não suportado. Veja as instruções.')
						return true;
					}
				}
				catch(err) {
					mostrarAlerta(err.stack);
				}
				return true;
			}



			function mostrarAlerta(erro)
			{
				alert('Houve um problema ao carregar as coordenadas. Verifique as instruções e tente exportar o arquivo novamente e importar. \nCaso o problema persista envie o arquivo para nós verificarmos o problema detalhado.\n\n'+erro)
				$scope.arquivoCarregado=false;
			}

			function parseXML(val) {
				var xmlDoc;
				if (document.implementation && document.implementation.createDocument) {
					xmlDoc = new DOMParser().parseFromString(val, 'text/xml');
				}
				else if (window.ActiveXObject) {
					xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
					xmlDoc.loadXML(val);
				}
				else
				{
					alert('Seu navegador não é compatível. Use um navegador mais atualizado.ß');
					return null;
				}
				return xmlDoc;
			}

			$scope.processaArquivo_KML = function(xmlDoc) 
			{
				

				var items = xmlDoc.getElementsByTagName('coordinates');
				var mListCoord;
				for(var i = 0; i < items.length; i++) 
				{
					mListCoord = items[i].childNodes[0].nodeValue.replace(/\n/g, "###").split(",0");
				}

				var mListCoord2=[];
				for(var i = 0; i < mListCoord.length; i++) {
					var mCoorSep = mListCoord[i].split(",");
					for(var i2 = 0; i2 < mCoorSep.length; i2++) {
						var valorCorrente=mCoorSep[i2];
						if(valorCorrente.indexOf('###')==0)
						{
							valorCorrente= valorCorrente.replace("###" , "");
						}
						else if(valorCorrente.indexOf('###')>0)
						{
							valorCorrente= valorCorrente.substring(valorCorrente.indexOf('###')+3, valorCorrente.length);
						}

						var n = Number(valorCorrente);
						if(n!=0)
						{
							mListCoord2.push(n);
						}
					}
				}


				var x=0;
				var old;
				$scope.todascoordenadas=[];
				$scope.todascoordenadasCentroid=[];

				for(var i2 = 0; i2 < mListCoord2.length; i2++) {
					if(x==0)
					{
						old=mListCoord2[i2];
						x++;
					}
					else if(x==1)
					{

						var longitude=old;
						var latitude=mListCoord2[i2];
						
						$scope.todascoordenadas.push(new google.maps.LatLng(latitude, longitude ));
						
						var novoCentroid=[];
						novoCentroid['y']=longitude;
						novoCentroid['x']=latitude;
						$scope.todascoordenadasCentroid.push(novoCentroid);		
						x=0;
					}
				}
				console.log('Terminou');
				setaCoordenadas();
				$scope.arquivoCarregado=true;
				alert('As coordenadas foram carregadas! Confira no mapa e clique no botao salvar coordenadas.');
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}

			$scope.processaArquivo_SHAPE = function(arquivoBruto) 
			{
				$scope.todascoordenadas=[];
				$scope.todascoordenadasCentroid=[];
				console.log("teste");


				var i=0;
				for(var poligno in arquivoBruto) 
				{
					if( Object.prototype.toString.call( arquivoBruto[poligno][0] ) != "[object Number]" )
					{
						for(var pol in arquivoBruto[poligno]) 
						{
							if( Object.prototype.toString.call( arquivoBruto[poligno][pol][0] ) != "[object Number]" )
							{
								for(var arr in arquivoBruto[poligno][pol]) 
								{
									if( Object.prototype.toString.call( arquivoBruto[poligno][pol][arr][0] ) !="[object Number]" )
									{
										for(var arr2 in arquivoBruto[poligno][pol][arr]) 
										{
											if( Object.prototype.toString.call( arquivoBruto[poligno][pol][arr][arr2][0] ) == "[object Number]" )
											{
												$scope.todascoordenadas.push(new google.maps.LatLng(arquivoBruto[poligno][pol][arr][arr2][1], arquivoBruto[poligno][pol][arr][arr2][0]));

												var novoCentroid=[];
												novoCentroid['y']=arquivoBruto[poligno][pol][arr][arr2][0];
												novoCentroid['x']=arquivoBruto[poligno][pol][arr][arr2][1];
												$scope.todascoordenadasCentroid.push(novoCentroid);	
											}
										}
									}
									else
									{
										$scope.todascoordenadas.push(new google.maps.LatLng(arquivoBruto[poligno][pol][arr][1], arquivoBruto[poligno][pol][arr][0]));

										var novoCentroid=[];
										novoCentroid['y']=arquivoBruto[poligno][pol][arr][0];
										novoCentroid['x']=arquivoBruto[poligno][pol][arr][1];
										$scope.todascoordenadasCentroid.push(novoCentroid);	
									}
								}
							}
							else
							{
								$scope.todascoordenadas.push(new google.maps.LatLng(arquivoBruto[poligno][pol][1], arquivoBruto[poligno][pol][0]));

								var novoCentroid=[];
								novoCentroid['y']=arquivoBruto[poligno][pol][0];
								novoCentroid['x']=arquivoBruto[poligno][pol][1];
								$scope.todascoordenadasCentroid.push(novoCentroid);	
							}
						}
					}

				}
				console.log('Terminou');
				setaCoordenadas();
				$scope.arquivoCarregado=true;
				alert('As coordenadas foram carregadas! Confira no mapa e clique no botao salvar coordenadas.');
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}

			function Point(x, y) {
				this.x = x;
				this.y = y;
			}

			function Region(points) {
				this.points = points || [];
				this.length = points.length;
			}

			function castObjToArray(myObj)
			{
				if(myObj==null)
				{
					var sem_nada=[];
					return sem_nada;
				}
				else
				{
					var array = $.map(myObj, function(value, index) {
						return [value];
					});
					return array;

				}
			}

			Region.prototype.area = function () {
				var area = 0,
				i,
				j,
				point1,
				point2;

				for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
					point1 = this.points[i];
					point2 = this.points[j];
					area += point1.x * point2.y;
					area -= point1.y * point2.x;
				}
				area /= 2;

				return area;
			};

			Region.prototype.centroid = function () {
				var x = 0,
				y = 0,
				i,
				j,
				f,
				point1,
				point2;

				for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
					point1 = this.points[i];
					point2 = this.points[j];
					f = point1.x * point2.y - point2.x * point1.y;
					x += (point1.x + point2.x) * f;
					y += (point1.y + point2.y) * f;
				}

				f = this.area() * 6;

				return new Point(x / f, y / f);
			};


			atualizaListaFiliais();

		}
	}()
	);