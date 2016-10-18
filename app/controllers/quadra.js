//var greetings = require("./../greetings.js");

(function()
{

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('quadraCtrl', quadraCtrl);

	quadraCtrl.$inject = [ '$scope', '$timeout', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Coordenadas', 'Notify', 'uiGmapIsReady', 'uiGmapGoogleMapApi', '$geofire'];

	function quadraCtrl($scope, $timeout, $firebaseArray, $firebaseObject, Session, Constant, Coordenadas, Notify, uiGmapIsReady, uiGmapGoogleMapApi, $geofire) 
	{

		angular.extend($scope, {
			edit: false,
			arquivoCarregado: false,
			desabilitaFazenda: false,
			arquivoCarregado:false,
			fazendas: [],
			quadras: [],
			todascoordenadas:[],
			quadraFilial: [],
			data: {
				ativo:true				
			}
		});		

		var ref = new Firebase(Constant.Url + '/quadra');
		$scope.todasQuadras = $firebaseArray(ref);
		//var refFazendas = new Firebase(Constant.Url + '/filial');
		//$scope.todascoordenadas = [[25.774252, -80.190262],[18.466465, -66.118292],[32.321384, -64.75737],[25.774252, -80.190262]];

		$scope.center ={latitude: -20, longitude:  -55 };

		$scope.map = { 
			show: true,
			control:{},
			center: {latitude: -20, longitude:  -55 }, 
			zoom: 3,
			options: {mapTypeId: google.maps.MapTypeId.SATELLITE }
		};

		//$scope.center = [];
		atualizaListaFiliais();

		//console.log('O q tinha:' + Coordenadas.getCoordendas());
		//console.log('Setamdp:' + Coordenadas.setCoordenadas('setandooo'));
		//console.log('O q voltou:' + Coordenadas.getCoordendas());
		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA/FILIAL
		//############################################################################################################################

		function atualizaListaFiliais()
		{
			$('#myPleaseWait').modal('show');

			var refUser = new Firebase(Constant.Url + '/usuarioxauth/'+Session.getUser().uid);		
			var obj = $firebaseObject(refUser);
			var key_usuario;
			obj.$loaded().then(function() {
				key_usuario= obj.$value;
				
				$scope.fazendas=[];
				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovo = new Firebase.util.NormalizedCollection(
					[baseRef.child("/usuario/"+key_usuario+"/filial/"), "$key"],
					baseRef.child("/filial")
					).select(
					{"key":"$key.$key","alias":"key"},
					{"key":"filial.$value","alias":"filial"}
					).ref();

					refNovo.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');

						//console.log('Adicionou filial', snap.name(), snap.val());
						var obj= snap.val();
						$scope.fazendas.push(obj.filial);
						if(!$scope.$$phase) {
							$scope.$apply();
						}
					});

					refNovo.on('child_changed', function(snap) {
						//console.log('Houve uma atualização', snap.name(), snap.val());
						var objNovo= snap.val();

						var x=0;
						var posicao=null;
						$scope.fazendas.forEach(function(obj){
							if(obj.key === objNovo.filial.key)
							{ 
								posicao=x;
							}
							x++;

						});
						if(posicao!=null)
							$scope.fazendas[posicao]=objNovo.filial;

					});

					refNovo.on('child_removed', function(snap) {
						//console.log('Houve uma remoção', snap.name(), snap.val());
						atualizaListaFiliais();
					});

			});// final do load
		}		

		$scope.chengeFazenda = function(fazenda){
			if(fazenda === null) 
			{
				$scope.quadras =null;
			}
			else
			{
				$scope.quadras=[];

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
					});

					refNovoQuadra.on('child_changed', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();
						var x=0;
						var posicao=null;
						$scope.quadras.forEach(function(obj){
							if(obj.key === objNovo['quadras'].key)
							{ 
								posicao=x;
							}
							x++;

						});
						if(posicao!=null)
							$scope.quadras[posicao]=objNovo['quadras'];

						if(!$scope.$$phase) {
							$scope.$apply();
						}
					});

					refNovoQuadra.on('child_removed', function(snap) {
						$scope.chengeFazenda($scope.data.fazenda);
					});


					
				}
			};

		//############################################################################################################################
		//############################################################################################################################
		// QUADRA
		//############################################################################################################################


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

			var fazendaTmp=data.fazenda;
			delete data.fazenda;
			delete data.$$hashKey;	
			data['filial']=[];
			data['filial'][fazendaTmp.key]=true;
			var refQuadra = new Firebase(Constant.Url + '/quadra/');
			var key=refQuadra.push().key();
			var refQuadraNovo = new Firebase(Constant.Url + '/quadra/'+key);
			data.key=key;
			refQuadraNovo.set(data);
			var refQuadraNovo = new Firebase(Constant.Url + '/filial/'+fazendaTmp.key + '/quadra/'+key);
			refQuadraNovo.set(true);
			$scope.clear();			
			Notify.successBottom('Quadra inserida com sucesso!');
			$scope.setaFazenda(fazendaTmp);	
		};


		$scope.editarQuadra = function(data){
			if(validForm(data)) return false;
			var fazendaTmp=data.fazenda;
			delete data.fazenda;
			delete data.$$hashKey;
			var refQuadra = new Firebase(Constant.Url + '/quadra/'+data.key);
			refQuadra.set(data);
			data.fazenda=fazendaTmp;
			$scope.clear();

			Notify.successBottom('Quadra atualizada com sucesso!');

		};

		$scope.excluir = function(objeto){
			var fazendaTmp=$scope.data.fazenda;
			if(objeto.data_ultalt!=null)
			{
				if(objeto.data_ultalt!='')
				{
					setMessageError('Já foi feito vistoria. Apenas desative a quadra/região!');
					return;
				}
			}

			var refQuadraNovo = new Firebase(Constant.Url + '/quadra/'+objeto.key);
			refQuadraNovo.remove();
			var refQuadraNovo = new Firebase(Constant.Url + '/filial/'+ $scope.data.fazenda.key + '/quadra/'+objeto.key);
			refQuadraNovo.remove();
			Notify.successBottom('Quadra removida com sucesso!');
			$scope.setaFazenda(fazendaTmp);		

		};

		$scope.cancelar = function(){
			var fazendaTmp=$scope.data.fazenda;
			$scope.clear();
			$scope.setaFazenda(fazendaTmp);	
			$scope.chengeFazenda($scope.data.fazenda);	
			$scope.edit = false;
			setaCoordenadas();
		};

		$scope.chamaEditar = function(obj)
		{			
			$('#myPleaseWait').modal('show');
			$scope.map.control.getGMap().setZoom(3);
			$scope.desabilitaFazenda=true;
			var fazendaTmp=$scope.data.fazenda;
			$scope.data = obj;
			$scope.data.fazenda=fazendaTmp;
			$scope.edit = true;
			$scope.todascoordenadas=[];
			$scope.todascoordenadasCentroid=[];
			if(!$scope.data.coordenadas)
			{
				$('#myPleaseWait').modal('hide');
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
						$scope.todascoordenadas.push(novo);

						var novoCentroid=[];
						novoCentroid['x']=coordenadas.latitude;
						novoCentroid['y']=coordenadas.longitude;
						$scope.todascoordenadasCentroid.push(novoCentroid);						
					});
					console.log('terminou');
					setaCoordenadas();
					

					if(!$scope.$$phase) {
						$scope.$apply();
					}

					$('#myPleaseWait').modal('hide');

				});
			}
		};

		uiGmapIsReady.promise().then(function (maps) {

			$timeout(function(){
			});

		});

		


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
			if(data.fazenda.key == null){
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
			//var fazendaTmp=$scope.data.fazenda;
			angular.extend($scope.data, {
				nome: '',
				coordenadas: false,
				ativo: true,
				codigo: '',
				dataStr_ultalt:'',
				data_ultalt:'',
				key:''
			});
			//$scope.data.fazenda=fazendaTmp;
			$scope.desabilitaFazenda=false;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			//$scope.chengeFazenda($scope.fazenda);
			//$scope.data.fazenda=fazendaTmp;
		};
		
		//############################################################################################################################
		//############################################################################################################################
		//UPLOAD
		//############################################################################################################################

		$scope.salvarArquivo= function(data)
		{

			var refCoordenadasGeoFire = $firebaseArray(new Firebase(Constant.Url + '/coordenadageo/'+data.fazenda.key));

			refCoordenadasGeoFire.$loaded(function() {
				refCoordenadasGeoFire.forEach(function(coordenadas){
					var refCor = new Firebase(Constant.Url + '/coordenadageo/'+data.fazenda.key+'/'+coordenadas.key);
					refCor.remove();
				});
			});

			var listaProntaSalvar=[];
			var old;
			$scope.todascoordenadas.forEach(function(obj){
				if(old!=null)
				{
					//if(getDistanceFromLatLonInKm(old.latitude,  old.longitude, obj.latitude, obj.longitude)>2)
					//{
						listaProntaSalvar.push(obj);
					//	old=obj;
					//}
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
			listaProntaSalvar.forEach(function(obj)
			{			

				var key=refCoord.push().key();
				var refQuadraNovo = new Firebase(Constant.Url + '/coordenada/'+data.key+'/'+key);

				var objCoord=[];
				objCoord['key']=key;
				objCoord['key_quadra']=data.key;
				objCoord['tipo']=i;
				objCoord['latitude']=obj.latitude;
				objCoord['longitude']=obj.longitude;

				refQuadraNovo.set(objCoord);

				geoFire.set(data.key + '_pos'+ i, [obj.latitude, obj.longitude]);
				i++;
			});

			Notify.successBottom('Coordenadas adicionadas com sucesso!');
		}

		$scope.limparArquivo= function(data)
		{
			$scope.todascoordenadasCentroid=[];
			$scope.todascoordenadas=[];
			if(data!= null && data.coordenadas)
			{

			}
			else
			{
				var novoCetro=[];
				novoCetro['latitude']=-20;
				novoCetro['longitude']=-55;		
				$scope.map.control.getGMap().setZoom(3);
				$scope.map.center=novoCetro;
				$scope.refreshMap(novoCetro);
			}
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
			if($scope.todascoordenadasCentroid.length>0 && $scope.todascoordenadas.length>0)
			{
				var region = new Region($scope.todascoordenadasCentroid);
				var novoCetro=[];
				novoCetro['latitude']=region.centroid().x;
				novoCetro['longitude']=region.centroid().y;		
				$scope.map.control.getGMap().setZoom(14);
				$scope.map.center=novoCetro;
				$scope.refreshMap(novoCetro);
				$scope.polygons = [
				{
					id: 1,
					path: $scope.todascoordenadas,
					stroke: {
						color: '#212121',
						weight: 3
					},
					editable: true,
					draggable: true,
					geodesic: false,
					visible: true,
					fill: {
						color: '#fd541f',
						opacity: 0.8
					}
				}
				];

			}
			else
			{
				var novoCetro=[];
				novoCetro['latitude']=-20;
				novoCetro['longitude']=-55;		
				$scope.map.control.getGMap().setZoom(3);
				$scope.map.center=novoCetro;
				$scope.refreshMap(novoCetro);
			}
			if(!$scope.$$phase) {
				$scope.$apply();
			}

			$('#myPleaseWait').modal('hide');
		}

		$scope.uploadFiles = function(file, errFiles) 
		{
			try {
				var fileInputElement = document.getElementById("fileInputElement");
				var fr = new FileReader();
				if(fileInputElement.files[0].name.indexOf("kml") !== -1)
				{
					fr.onload = (function(theFile) {
						return function(e) {
							var xmlDoc = parseXML(e.target.result);
							$scope.processaArquivo_KML(xmlDoc);
						};
					})(fileInputElement.files[0]);						
					fr.readAsText(fileInputElement.files[0]);
				}
				else
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
				mListCoord = items[i].childNodes[0].nodeValue.replace(/(?:\r\n|\r|\n)/g, '').replace(" ", "").split(",0");
			}

			var mListCoord2=[];
			for(var i = 0; i < mListCoord.length; i++) {
				var mCoorSep = mListCoord[i].split(",");
				for(var i2 = 0; i2 < mCoorSep.length; i2++) {
					var n = Number(mCoorSep[i2]);
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
					var novo=[];
					novo['longitude']=old;
					novo['latitude']=mListCoord2[i2];
					$scope.todascoordenadas.push(novo);

					var novoCentroid=[];
					novoCentroid['y']=old;
					novoCentroid['x']=mListCoord2[i2];
					$scope.todascoordenadasCentroid.push(novoCentroid);		
					x=0;
				}
			}
			console.log('Terminou');
			setaCoordenadas();
			$scope.arquivoCarregado=true;
			alert('As coordenadas foram carregadas! Confira no mapa e clique no botao salvar coordenadas.');

		}

		$scope.processaArquivo_SHAPE = function(arquivoBruto) 
		{
			$scope.todascoordenadas=[];
			$scope.todascoordenadasCentroid=[];
			console.log("teste");


			var i=0;
			for(var poligno in arquivoBruto) 
			{
				for(var pol in arquivoBruto[poligno]) 
				{
					for(var arr in arquivoBruto[poligno][pol]) 
					{
						var novo=[];
						novo['latitude']=arquivoBruto[poligno][pol][arr][1];
						novo['longitude']=arquivoBruto[poligno][pol][arr][0];
						$scope.todascoordenadas.push(novo);

						var novoCentroid=[];
						novoCentroid['y']=arquivoBruto[poligno][pol][arr][0];
						novoCentroid['x']=arquivoBruto[poligno][pol][arr][1];
						$scope.todascoordenadasCentroid.push(novoCentroid);	
					}
				}

			}
			console.log('Terminou');
			setaCoordenadas();
			$scope.arquivoCarregado=true;
			alert('As coordenadas foram carregadas! Confira no mapa e clique no botao salvar coordenadas.')
		}

		function Point(x, y) {
			this.x = x;
			this.y = y;
		}

		function Region(points) {
			this.points = points || [];
			this.length = points.length;
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


	}
}());