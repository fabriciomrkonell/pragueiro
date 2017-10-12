(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('variedadeCtrl', variedadeCtrl);

	variedadeCtrl.$inject = ['$scope', '$compile', '$sce',  '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify', 'Controleacesso'];

	function variedadeCtrl($scope,  $compile,  $sce, $firebaseArray, $firebaseObject, Session, Constant, Notify, Controleacesso) {

		angular.extend($scope, {
			edit: false,
			save:true,
			desabilitaFazenda: false,
			fazendas: [],
			variedades: [],
			cultura:[],
			culturas:[],
			variedadeFilial: [],
			data: {
				key_cultura: '',
				ativo: true,
				key_tecnologia: '',
				nome_tecnologia: '',
				nome: '',
				qtd:0,
				dias:'',
				key:''
				
			}
		});


		var ref = new Firebase(Constant.Url + '/variedade');
		$scope.todasVariedades = $firebaseArray(ref);
		//var refFazendas = new Firebase(Constant.Url + '/filial');


		$scope.menu  = $sce.trustAsHtml(window.localStorage.getItem('menu'));
		$scope.fazendas  = JSON.parse(window.localStorage.getItem('todasFiliais'));
		$scope.todasFazendasAceemps = JSON.parse(window.localStorage.getItem('todasFazendasAceemps'));
		$scope.posicaoFilial = window.localStorage.getItem('posicaoFilial');
		$scope.fazenda  = $scope.fazendas[$scope.posicaoFilial];
		var key_usuario  = window.localStorage.getItem('key_usuario');



		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "cultura.nome", displayName: "Cultura", width: 150 },
			{ field: "nome", displayName: "Variedade", width: 200 },
			{ field: "nome_tecnologia", displayName: "Tecnologia", width: 150 },
			]
		};

		$scope.toggleMultiSelect = function() {
			$scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
		};


		$scope.gridOptions.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.editar(row.entity);
			});
		};


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
					{
						objNovo['filial'].aceempsObj= $scope.fazendas[posicao].aceempsObj;
						$scope.fazendas[posicao] = objNovo['filial'];
					}

					if(objNovo['filial'].key==$scope.fazenda.key)
					{						
						window.localStorage.setItem('filialCorrente', JSON.stringify( objNovo['filial']));
						$scope.fazenda=objNovo['filial'];
						$scope.fazenda.aceempsObj = $scope.todasFazendasAceemps[$scope.fazenda.key].aceempsObj;
					}
					window.localStorage.setItem('todasFiliais', JSON.stringify( $scope.fazendas));

				});				
			}		

		//---
		$scope.chengeFazenda = function(fazenda)
		{
			$('#myPleaseWait').modal('show');

			$scope.clear();

			if(fazenda === null) 
			{
				$scope.variedades =null;
			}
			else
			{

				//--------------------------------------
				//Controle Acesso	
				fazenda.aceempsObj = $scope.todasFazendasAceemps[fazenda.key].aceempsObj;
				$scope.objetoTelaAcesso= fazenda.aceempsObj.variedade;

				if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
				{
					window.location.href = '#home';
				}
				//-------------------------------------
				$scope.variedades=[];
				$scope.gridOptions.data = $scope.variedades;


				$scope.clear();

				if(fazenda.variedade!=null)
				{
					$scope.qtde_variedade = castObjToArray(fazenda.variedade).length;

				}
				else
				{
					$('#myPleaseWait').modal('hide');
					$scope.qtde_variedade=0;
				}

				$('#myPleaseWait').modal('hide');

				var refVariedade= new Firebase(Constant.Url + '/variedade/'+fazenda.key);

				refVariedade.on('child_added', function(snap) {
					$('#myPleaseWait').modal('hide');	
					var objNovo= snap.val();
					if(snap.key()<20)
					{
						return;
					}

					$scope.culturas.forEach(function(obj) {
						if (obj.key == objNovo.key_cultura) {
							objNovo['cultura']=obj;
						}
					});

					var posicao;
					$scope.variedades.forEach(function(obj) {
						if (obj.key === objNovo.key) {
							posicao = $scope.variedades.indexOf(obj);
						}
					});
					if (posicao == null)
						$scope.variedades.push(objNovo);

					if(!$scope.$$phase) {
						$scope.$apply();
					}
					$scope.gridOptions.data = $scope.variedades;

					if($scope.qtde_variedade>=$scope.variedades.length)
					{

					}
				});

				refVariedade.on('child_changed', function(snap) {
					$('#myPleaseWait').modal('hide');
					var objNovo = snap.val();
					var x = 0;
					var posicao = null;

					$scope.culturas.forEach(function(obj) {
						if (obj.key == objNovo.key_cultura) {
							objNovo['cultura']=obj;
						}
					});

					$scope.variedades.forEach(function(obj) {
						if (obj.key === objNovo.key) {
							posicao = $scope.variedades.indexOf(obj);
						}
					});
					if (posicao != null)
						$scope.variedades[posicao] = objNovo;

					if (!$scope.$$phase) {
						$scope.$apply();
					}
				});

				refVariedade.on('child_removed', function(snap) {
					var posicao = null;
					$scope.variedades.forEach(function(obj) {
						if (obj.key == snap.key()) {
							posicao = $scope.variedades.indexOf(obj);
						}
					});
					if (posicao != null)
						delete $scope.variedades[posicao];

					$scope.gridOptions.data = $scope.variedades;
				});


			}
		};

		//--
		function recuperaQtdeCultura() {

			var baseRef = new Firebase(Constant.Url+'/cultura');
			baseRef.on('value', function(snapshot2) {

				$scope.qtde_culturas= snapshot2.numChildren();
				if(	$scope.qtde_culturas==0)
				{
					atualizaListaFiliais();
				}
				else
				{				
					atualizaCulturas();
				}
			});
		}

		//--
		function atualizaCulturas()
		{
			var refCultura = new Firebase(Constant.Url + '/cultura');
			refCultura.ref().on('child_added', function(snap) {
				$scope.culturas.push(snap.val());
				if($scope.culturas.length == $scope.qtde_culturas)
				{
					$('#myPleaseWait').modal('hide');
					atualizaListaFiliais();
				}
			});
		}

		//############################################################################################################################
		//############################################################################################################################
		// QUADRA
		//############################################################################################################################
		
		$scope.salvarVariedade = function(data){
			if(validForm(data)) return false;
			if($scope.fazenda==null) return false;

			data['key_filial']=$scope.fazenda.key;
			var nome_tecnologia;
			if(data.key_tecnologia=='-KQkw5zcA_s8e1GizcjZ')
			{
				nome_tecnologia='Convencional';
			}
			else
			{
				nome_tecnologia='Transgênico';
			}
			data['nome_tecnologia']=nome_tecnologia;

			
			delete data.cultura;
			delete data.$$hashKey;	

			var refVariedade = new Firebase(Constant.Url + '/variedade/'+$scope.fazenda.key+'/');
			data.key=refVariedade.push().key();

			var refVariedadeNovo = new Firebase(Constant.Url + '/variedade/'+$scope.fazenda.key+'/'+data.key);
			refVariedadeNovo.set(data);

			var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key+'/variedade'+'/'+data.key);
			refFilial.set(true);

			$scope.clear();			
			Notify.successBottom('Variedade inserida com sucesso!');
		};

		$scope.editarVariedade = function(data){
			if(validForm(data)) return false;
			delete data.cultura;
			delete data.$$hashKey;
			var nome_tecnologia;
			if(data.key_tecnologia=='-KQkw5zcA_s8e1GizcjZ')
			{
				nome_tecnologia='Convencional';
			}
			else
			{
				nome_tecnologia='Transgênico';
			}
			data['nome_tecnologia']=nome_tecnologia;
			var refVariedade = new Firebase(Constant.Url + '/variedade/'+$scope.fazenda.key+'/'+data.key);
			refVariedade.set(data);
			Notify.successBottom('Variedade atualizada com sucesso!');
			$scope.clear();
		};

		$scope.cancelar = function(){
			$scope.clear();
			$scope.edit = false;
			$scope.save=true;
		};

		$scope.editar = function(obj){

			$scope.desabilitaFazenda=true;
			$scope.data = obj;
			$scope.edit = true;
			$scope.save = false;
			/*
			$scope.culturas.forEach(function(item){
				if(item.key === $scope.data.key_cultura) 	
				{
					$scope.data.cultura = item;		
				}
			});
			*/

			$scope.desabilitaFazenda=true;		

		};

		$scope.excluir = function(objeto){
			$('#modalDelete').modal('show');
			return true;			
		};

		$scope.excluirVariedade = function(objeto){
			$('#modalDelete').modal('hide');
			if(objeto.qtd!=null)
			{
				if(objeto.qtd>0)
				{
					setMessageError('Já foi associado em quadra. Impossível continuar.');
					return true;
				}
			}
			
			var refVariedadeNovo = new Firebase(Constant.Url + '/variedade/'+$scope.fazenda.key+'/'+'/'+objeto.key);
			refVariedadeNovo.remove();

			var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key+'/variedade'+'/'+objeto.key);
			refFilial.remove();
			
			Notify.successBottom('Variedade removida com sucesso!');
			$scope.cancelar();
			return true;
			
		};

		$scope.chamaClonar = function()
		{
			$('#modalClonar').modal('show');
			//$scope.consertoVariedades();

		}

		$scope.consertoVariedades2= function()
		{
			return;
			$scope.variedadesConserto=[];
			var refVariedade= new Firebase(Constant.Url + '/equipe/');

			refVariedade.on('child_added', function(snap) {
				
				var funcionario=snap.val();



				for(var objFil in funcionario.filial ){
					

					//delete funcionario.filial;

					var refVariedadeNovo = new Firebase(Constant.Url + '/equipe/'+objFil+'/'+funcionario.key);
					refVariedadeNovo.set(funcionario);
					var refFilial = new Firebase(Constant.Url + '/filial/'+objFil+'/equipe/'+funcionario.key);
					refFilial.set(true);


				}
				console.log('terminou');
				



			});
		}

		$scope.consertoVariedades= function()
		{
			$scope.variedadesConserto=[];
			var refVariedade= new Firebase(Constant.Url + '/variedade/');

			refVariedade.on('child_added', function(snap) {
				if(snap.key()!='-KNhveilZ009PI7QHdTx')
				{
					var filiais=snap.val();

					for(var objFil in filiais ){
						var variedades_brutas = filiais[objFil];
						for(var obj in variedades_brutas ){
							var objVar=variedades_brutas[obj];
							objVar['key_filial']=snap.key();

							var refVariedadeNovo = new Firebase(Constant.Url + '/variedade/'+snap.key()+'/'+obj);
							refVariedadeNovo.set(objVar);
							var refFilial = new Firebase(Constant.Url + '/filial/'+snap.key()+'/variedade/'+obj);
							refFilial.set(true);

						};
					}
					console.log('terminou');
				}



			});
		}

		$scope.clonar = function()
		{	
			if($scope.fazendaCopia==null)
			{
				Notify.errorBottom('É preciso selecionar uma fazenda!');
				return;
			}

			if($scope.fazendaCopia.key == $scope.fazenda.key)
			{
				Notify.errorBottom('É preciso selecionar uma fazenda diferente da atual!');
				return;
			}


			$scope.variedades.forEach(function(obj){
				var classeClonada = clone(obj);

				delete classeClonada.$$hashKey;	
				delete classeClonada.cultura;	

				var refClapra= new Firebase(Constant.Url + '/variedade/' + $scope.fazendaCopia.key + '/' + classeClonada.key  );

				refClapra.set(classeClonada);

				var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazendaCopia.key + '/variedade/'+classeClonada.key);
				refFilial.set(true);
			});

			Notify.successBottom('Variedade copiadas com sucesso!');

			$('#modalClonar').modal('hide');
		}


		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################

		$scope.setaFazenda = function(fazenda){
			if(fazenda === null) return false;

			$scope.fazendas.forEach(function(item){
				if(item.key === fazenda.key) 	
				{
					$scope.$scope.fazenda = item;		
				}
			});
			
		};

		function setMessageError(message){
			Notify.errorBottom(message);
		};

		function validForm(data){

			if($scope.fazenda==null || $scope.fazenda.key == null){
				setMessageError('O campo fazenda é inválido!');
				return true;
			}
			if(data.key_cultura == null){
				setMessageError('O campo cultura é inválido!');
				return true;
			}
			if(data.key_tecnologia == null){
				setMessageError('O campo tecnologia é inválido!');
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
			angular.extend($scope.data, {
				ativo: true,
				key_tecnologia: '',
				nome_tecnologia: '',
				nome: '',
				qtd:0,
				dias:'',
				key:''
			});
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
			$scope.save=true;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
		};
		

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

		function clone(obj) {
			if (null == obj || "object" != typeof obj) return obj;
			var copy = obj.constructor();
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
			}
			return copy;
		}
		
		recuperaQtdeCultura();

	}

}());