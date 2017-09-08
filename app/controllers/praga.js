(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('pragaCtrl', pragaCtrl);

	pragaCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray', '$firebaseObject', 'Notify', '$interval'];

	function pragaCtrl($scope, Constant, Session, $firebaseArray, $firebaseObject, Notify, $interval) {

		angular.extend($scope, {
			edit: false,			
			
			data: {
				ativo:true,
				tamanhos:false,
				texto: ' '
			}
		});

		$scope.todasPragas= [];
		$scope.todasClapras= [];
		$scope.qtde_clapras=0;
		$scope.tamanhos=[];
		recuperaCulturaQtde();
		//recuperaClapra();

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "key", displayName: "Código", width: 80 },
			{ field: "descricao", displayName: "Descrição", width: 240 },
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
				$scope.editar(row.entity);
			});
		};


		$scope.gridOptionsTamanhos = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "key", displayName: "Key", width: 80 },
			{ field: "nome", displayName: "Nome", width: 240 }
			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				}
			}
			
		};

		$scope.gridOptionsTamanhos.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.ChamarEditarVariedade(row.entity);
			});
		};
		//############################################################################################################################
		//############################################################################################################################
		// Praga
		//############################################################################################################################

		function buscaPragas()
		{
			var baseRef1 = new Firebase(Constant.Url+'/praga');

			baseRef1.on('child_added', function(snapshot1) {

				var objNovo = snapshot1.val();
				$scope.todasPragas.push(objNovo);
				$scope.gridOptions.data=$scope.todasPragas;	
				if (!$scope.$$phase) {
					$scope.$apply();
					$scope.gridOptions.data=$scope.todasPragas;	
				}


			});

			baseRef1.on('child_changed', function(snap) {
				var objNovo= snap.val();
				var x=0;
				var posicao=null;
				$scope.todasPragas.forEach(function(obj){
					if(obj.key === objNovo.key)
					{ 
						posicao=x;
					}
					x++;

				});
				if(posicao!=null)
					$scope.todasPragas[posicao]=objNovo;

				if(!$scope.$$phase) {
					$scope.$apply();
				}
			});

		}

		//-------------------------------------------------------------------
		function recuperaCulturaQtde() {

			var baseRef = new Firebase(Constant.Url+'/clapra');
			baseRef.on('value', function(snapshot2) {
				$scope.qtde_clapras= snapshot2.numChildren();
				if(	$scope.qtde_clapras==0)
				{
					buscaPragas();
				}
				else
				{
					recuperaClapra();
				}
			});
		}
		
		function recuperaClapra() {

			var baseRef2 = new Firebase(Constant.Url+'/clapra');

			baseRef2.on('child_added', function(snapshot3) {

				var objNovo3 = snapshot3.val();
				$scope.todasClapras.push(objNovo3);		

				if(	$scope.qtde_clapras==$scope.todasClapras.length)
				{
					buscaPragas();
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}

				

			}, function(error) {
				console.error(error);
			});
		}

		$scope.salvarPraga = function(data){
			if(validForm(data)) return false;

			var refNovo = new Firebase(Constant.Url + '/praga/' + data.key );
			//refNovo.set(data);
			buscaPragas();
			data.key=parseInt(data.key)+1;
			$scope.clear();

		};

		$scope.editarPraga = function(data){
			if(validForm(data)) return false;

			delete data.$$hashKey;
			var refNovo = new Firebase(Constant.Url + '/praga/' + data.key );
			refNovo.set(data);

			Notify.successBottom('Praga salva com sucesso!');

			
			$scope.clear();
		};

		$scope.cancelar = function(){
			var fazendaTmp=$scope.data.fazenda;
			$scope.clear();
			$scope.setaFazenda(fazendaTmp);	
			$scope.chengeFazenda($scope.data.fazenda);	
			$scope.edit = false;
		};

		$scope.editar = function(praga){
			
			$scope.data = praga;
			$scope.tamanhos=castObjToArray(praga.tamanho);
			$scope.gridOptionsTamanhos=$scope.tamanhos;
			if(!$scope.$$phase) {
				$scope.gridOptionsTamanhos=$scope.tamanhos;
				$scope.$apply();
			}

			$scope.edit = true;
		};

		$scope.excluir = function(objeto){
			var fazendaTmp=$scope.data.fazenda;
			if(objeto.qtd!=null)
			{
				if(objeto.qtd>0)
				{
					setMessageError('Já foi associado em quadra. Impossível continuar.');
					return true;
				}
			}
			
			var refPragaNovo = new Firebase(Constant.Url + '/praga/'+objeto.key_filial+'/'+objeto.key_cultura+'/'+objeto.key);
			refPragaNovo.remove();
			
			Notify.successBottom('Praga removida com sucesso!');
			$scope.chengeFazenda(fazendaTmp);
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
			if(data.key == null){
				setMessageError('O campo key é inválido!');
				return true;
			}
			if(data.nome_cientifico == null){
				setMessageError('O campo nome_cientifico é inválido!');
				return true;
			}
			if(data.descricao === ''){
				setMessageError('O campo descrição é inválido!');
				return true;
			}
			if(data.ativo === ''){
				setMessageError('O campo ativo é inválido!');
				return true;
			}

			return false;
		};

		//-------------------------------------------------------------------
		function clone(obj) {
			if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
				return obj;

			if (obj instanceof Date)
				var temp = new obj.constructor(); //or new Date(obj);
			else
				var temp = obj.constructor();

			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					obj['isActiveClone'] = null;
					temp[key] = clone(obj[key]);
					delete obj['isActiveClone'];
				}
			}

			return temp;
		}
		//-------------------------------------------------------------------

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

		$scope.clear = function(){
			//var fazendaTmp=$scope.data.fazenda;
			angular.extend($scope.data, {			
				ativo: true,
				tamanhos:false,
				nome_cientifico: '',
				descricao: '',
				img: ''
			});
			//$scope.data.fazenda=fazendaTmp;
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			//$scope.chengeFazenda($scope.fazenda);
			//$scope.data.fazenda=fazendaTmp;
		};
		

		//$scope.clear();

	}

}());