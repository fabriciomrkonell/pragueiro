//var greetings = require("./../greetings.js");

(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('quadraCtrl', quadraCtrl);

	quadraCtrl.$inject = [ '$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Coordenadas', 'Notify', ];

	function quadraCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Coordenadas, Notify) {

		angular.extend($scope, {
			edit: false,
			desabilitaFazenda: false,
			fazendas: [],
			quadras: [],
			quadraFilial: [],
			data: {
				ativo:true				
			}
		});


		

		var ref = new Firebase(Constant.Url + '/quadra');
		$scope.todasQuadras = $firebaseArray(ref);
		//var refFazendas = new Firebase(Constant.Url + '/filial');

		atualizaListaFiliais();

		console.log('O q tinha:' + Coordenadas.getCoordendas());
		console.log('Setamdp:' + Coordenadas.setCoordenadas('setandooo'));
		console.log('O q voltou:' + Coordenadas.getCoordendas());
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

		$scope.subirShape = function(data){
			console.log("teste");
			shapefile.open(data)
			.then(source => source.read()
				.then(function log(result) {
					if (result.done) return;
					console.log(result.value);
					return source.read().then(log);
				}))
			.catch(error => console.error(error.stack));
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

		$scope.cancelar = function(){
			var fazendaTmp=$scope.data.fazenda;
			$scope.clear();
			$scope.setaFazenda(fazendaTmp);	
			$scope.chengeFazenda($scope.data.fazenda);	
			$scope.edit = false;
		};

		$scope.editar = function(obj){
			$scope.desabilitaFazenda=true;
			var fazendaTmp=$scope.data.fazenda;
			$scope.data = obj;
			$scope.data.fazenda=fazendaTmp;
			$scope.edit = true;

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


		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################

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
		

		//$scope.clear();

		$scope.file_changed = function(element) {

			var reader = new FileReader();
			reader.onload = function() {

				var arrayBuffer = this.result,
				array = new Uint8Array(arrayBuffer),
				binaryString = String.fromCharCode.apply(null, array);

				console.log('--:'  + binaryString);

			}
			reader.readAsArrayBuffer(element.files[0]);
			var buf = new ArrayBuffer(reader);


			$scope.load(element.files[0], 
				function(res) {
					console.log('ok', res);
					shapefile.open(res)
					.then(source => source.read()
						.then(function log(result) {
							if (result.done) return;
							console.log(result.value);
							return source.read().then(log);
						}))
					.catch(error => console.error(error.stack));
				},
				function(res){ console.log('error', res); }
				)


			

			$scope.$apply(function(scope) {
				var photofile = element.files[0];
				var reader = new FileReader();
				reader.onload = function(e) {
            // handle onload

        };
        reader.readAsDataURL(photofile);


    });
		};

		$scope.load = function(src, callback, onerror) {
			var xhr = new XMLHttpRequest();
			xhr.responseType = 'arraybuffer';
			xhr.onload = function() {
				console.log(xhr.response);
				var d = new SHPParser().parse(xhr.response);
				callback(d);
			};
			xhr.onerror = onerror;
			xhr.open('GET', src);
			xhr.send(null);
		};


	}



}());