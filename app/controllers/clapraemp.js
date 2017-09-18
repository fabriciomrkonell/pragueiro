(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('clapraempCtrl', clapraempCtrl);

	clapraempCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function clapraempCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			save: true,
			clapras: [],
			clapraFilial: [],
			data: {
				ativo:true				
			}
		});

		$scope.tipo = ['Praga', 'Doença'];
		$scope.numeracao_codigo = 1;
		$scope.todasClapras=[];
		
		atualizaListaFiliais();
		//listenerCodigo();
		//recuperaClapra();

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "codigo", displayName: "Código", width: 80 },
			{ field: "nome", displayName: "Nome", width: 240 },
			{ field: "ordem", displayName: "Ordem", width: 100 },
			{ field: "ativo", displayName: "Ativo", width: 150,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" },
			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
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

					var i=0;
					
					refNovo.on('child_added', function(snap) {
						
						
						//console.log('Adicionou filial', snap.name(), snap.val());
						var obj= snap.val();
						//recuperaTipequi(obj);

						$scope.fazendas.push(obj.filial);

						if(i==0)
						{
							$scope.chengeFazenda($scope.fazendas[0]);
							$scope.fazenda=$scope.fazendas[0];
							$('#myPleaseWait').modal('hide');
						}


						if(!$scope.$$phase) {
							
							$scope.$apply();
						}
						i++;
					});

					if($scope.fazendas.length==0)
					{
						$('#myPleaseWait').modal('hide');
					}
			});// final do load
		}		

		$scope.chengeFazenda = function(fazenda){
			if(fazenda === null) 
			{
				$scope.todasClapras =null;
			}
			else
			{			
				$('#myPleaseWait').modal('show');	

				$scope.todasClapras=[];
				$scope.gridOptions.data = $scope.todasClapras;

				if(fazenda.clapraemp!=null)
				{
					$scope.qtde_clapras=castObjToArray(fazenda.clapraemp).length;
				}
				else
				{
					$scope.data.ordem=1;
				}
				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/"+fazenda.key+"/clapraemp"),
					[baseRef.child("/clapraemp/"+fazenda.key), "$key"]
					).select(
					{"key":"clapraemp.$value","alias":"filial"},
					{"key":"$key.$value","alias":"clapraemps"}
					).ref();


					var i=1;
					refNovoQuadra.on('child_added', function(snap) {

						var objNovo= snap.val();
						$scope.todasClapras.push(objNovo['clapraemps']);
						if(!$scope.$$phase) {
							$scope.$apply();
						}
						$scope.gridOptions.data = $scope.todasClapras;

						if($scope.qtde_clapras==$scope.todasClapras.length)
						{
							$('#myPleaseWait').modal('hide');	
							$scope.data.ordem=$scope.todasClapras.length + 1;
						}
						i++;


					});

					refNovoQuadra.on('child_changed', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo = snap.val();
						var x = 0;
						var posicao = null;
						$scope.todasClapras.forEach(function(obj) {
							if (obj.key === objNovo['clapraemps'].key) {
								posicao = x;
							}
							x++;

						});
						if (posicao != null)
							$scope.todasClapras[posicao] = objNovo['clapraemps'];

						if (!$scope.$$phase) {
							$scope.$apply();
						}
					});

					
					

					//-------------------------------------------------------------------



				}
			};

		//############################################################################################################################
		//############################################################################################################################
		// 
		//############################################################################################################################

		function recuperaClapra() {

			var baseRef = new Firebase(Constant.Url+'/clapra');

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.todasClapras.push(objNovo);
				$scope.gridOptions.data=$scope.todasClapras;	
				if (!$scope.$$phase) {
					$scope.$apply();

					$scope.gridOptions.data=$scope.todasClapras;	
				}


			});

			baseRef.on('child_changed', function(snap) {
				var objNovo= snap.val();
				var x=0;
				var posicao=null;
				$scope.todasClapras.forEach(function(obj){
					if(obj.key === objNovo.key)
					{ 
						posicao=x;
					}
					x++;

				});
				if(posicao!=null)
					$scope.todasClapras[posicao]=objNovo;

				if(!$scope.$$phase) {
					$scope.$apply();
				}
			});
		}


		function listenerCodigo() {


			var refOrdser = new Firebase(Constant.Url + '/clapra/' );

			refOrdser.on('child_added', function(snap) {
				$scope.numeracao_codigo++;
				if (!$scope.edit) {
					$scope.data.key=$scope.numeracao_codigo;
					$scope.data.codigo = zeroFill($scope.numeracao_codigo, 3);
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				}
			});

			refOrdser.on('child_removed', function(snap) {
				$scope.numeracao_codigo--;
				if (!$scope.edit) {
					$scope.data.key=$scope.numeracao_codigo;
					$scope.data.codigo = zeroFill($scope.numeracao_codigo, 3);
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				}
			});
			
		}



		//############################################################################################################################
		//############################################################################################################################
		// QUADRA
		//############################################################################################################################

		

		$scope.getDadosClapra = function(obj, nomeColuna){
			var retorno = '';
			if(nomeColuna=='nome')
			{
				$scope.todasClapras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['nome'];
				});
			}
			if(nomeColuna=='codigo')
			{
				$scope.todasClapras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['codigo'];
				});
			}
			if(nomeColuna=='ativo')
			{
				$scope.todasClapras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['ativo'];
				});
			}
			if(nomeColuna=='coordenadas')
			{
				$scope.todasClapras.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['coordenadas'];
				});
			}
			return retorno;
		};

		$scope.salvarClapra = function(data){
			if(validForm(data)) return false;	
			if($scope.fazenda==null) return false;				
			delete data.$$hashKey;	
			
			var qtde = $scope.todasClapras.length+2;
			var refClapra= new Firebase(Constant.Url + '/clapraemp/' + $scope.fazenda.key );
			data.key=refClapra.push().key();

			var refClapraNovo= new Firebase(Constant.Url + '/clapraemp/' + $scope.fazenda.key  +'/' + data.key);
			refClapraNovo.set(data);

			var refFilial = new Firebase(Constant.Url + '/filial/'+$scope.fazenda.key + '/clapraemp/'+data.key);
			refFilial.set(true);

			$scope.clear();			
			$scope.data.ordem=qtde;

			Notify.successBottom('Classe de Pragas inserida com sucesso!');
		};

		$scope.editarClapra = function(data){
			if(validForm(data)) return false;
			if($scope.fazenda==null) return false;				
			delete data.$$hashKey;		
			var refClapra= new Firebase(Constant.Url + '/clapraemp/' + $scope.fazenda.key  +'/' + data.key);
			refClapra.set(data);

			$scope.clear();

			Notify.successBottom('Classe de Pragas atualizada com sucesso!');
		};

		$scope.cancelar = function(){
			$scope.clear();

			$scope.data.ordem=$scope.todasClapras.length+1;

			$scope.edit = false;
			$scope.save=true;
		};

		$scope.chamaEditar = function(obj){
			
			$scope.data = clone(obj);		
			$scope.edit = true;
			$scope.save = false;


		};
		$scope.excluir = function(){
			$('#modalDelete').modal('show');
		};

		$scope.excluirClapra = function(objeto){
			$('#modalDelete').modal('hide');
			if(objeto!=null)
			{					
				if($scope.fazenda==null) return false;		

				var refEquipeNovo = new Firebase(Constant.Url + '/clapraemp/'+ $scope.fazenda.key +'/'+objeto.key);
				refEquipeNovo.remove();

				var refFilial = new Firebase(Constant.Url + '/filial/'+ $scope.fazenda.key + '/clapraemp/'+objeto.key);
				refFilial.remove();	

				Notify.successBottom('Classe de Pragas removida com sucesso!');
				
				$scope.cancelar();

				var posicao = null;
				$scope.todasClapras.forEach(function(obj) {
					if (obj.key === objeto.key) {
						posicao = 	$scope.todasClapras.indexOf(obj);
					}

				});
				if (posicao != null)
					delete $scope.todasClapras[posicao];


				$scope.data.ordem=$scope.todasClapras.length;

			}
			return true;

		};


		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################


		function setMessageError(message){
			Notify.errorBottom(message);
		};

		function validForm(data){

			if(data.nome==null || data.nome == ''){
				setMessageError('O campo nome é obrigatório!');
				return true;
			}
			if(data.tipo==null || data.tipo == ''){
				setMessageError('O campo tipo é obrigatório!');
				return true;
			}
			if(data.ordem==null || (data.ordem == '' && data.ordem!=0)){
				setMessageError('O campo ordem é obrigatório!');
				return true;
			}
			if(data.ativo === ''){
				setMessageError('O campo ativo é inválido!');
				return true;
			}
			
			return false;
		};
		
		function clone(obj) {
			if (null == obj || "object" != typeof obj) return obj;
			var copy = obj.constructor();
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
			}
			return copy;
		}

		$scope.clear = function(){
			$scope.data.key='';
			$scope.data.codigo='';
			$scope.data.tipo='';
			$scope.data.nome='';
			$scope.data.ativo=true;
			$scope.data.ordem='';
			$scope.edit=false;
			$scope.save = true;
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

		function zeroFill(number, width) {
			width -= number.toString().length;
			if (width > 0) {
				return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
			}
			return number + "";
		}

	}

}());