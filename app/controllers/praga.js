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
				texto: ' ',
				valor:[],
				tamanho:[]
			},
			frmTamanho: {
				key:'',
				nome:'',
				ativo:true,
				ordem:1
			},
			frmValor: {
				key:'',
				nome:'',
				ativo:true,
				ordem:1
			}			
		});




		$scope.tipos = [{nome:'Praga', key:'PRA'},
		{nome:'Doença', key:'DOE'}];
		$scope.todasPragas= [];
		$scope.todasClapras= [];

		$scope.qtde_clapras=0;

		$scope.tamanhos=[];
		$scope.valor=[];
		recuperaCulturaQtde();

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "key", displayName: "Código", width: 80 },
			{ field: "descricao", displayName: "Descrição", width: 240 },
			{ field: "ativo", displayName: "Ativo", width: 70,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" },
			{ field: "postam", displayName: "Tamanhos", width: 100,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValueTamanhos(row)}}</div>" },
			{ field: "valpre", displayName: "Valores", width: 100,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValueValores(row)}}</div>" }


			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				},
				mapValueTamanhos: function(row) {
					return row.entity.postam ? 'Sim' : 'Não';
				},
				mapValueValor: function(row) {
					return row.entity.valpre ? 'Sim' : 'Não';
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


		$scope.gridOptionsTamanhos = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "ordem", displayName: "Ordem", width: 100 , sort:{ direction: 'asc', priority: 0 }},
			{ field: "nome", displayName: "Nome", sort:{ direction: 'asc', priority: 1 }, width: 240 },	
			{ field: "ativo", displayName: "Ativo", width: 150,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" }
			
			
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
				$scope.ChamarEditarTamanho(row.entity);
			});
		};


		$scope.gridOptionsValor = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "ordem", displayName: "Ordem", width: 100 , sort:{ direction: 'asc', priority: 0 }},
			{ field: "nome", displayName: "Nome", sort:{ direction: 'asc', priority: 1 }, width: 240 },	
			{ field: "valor", displayName: "Valor" },	
			{ field: "ativo", displayName: "Ativo", width: 150,   cellTemplate: "<div class='cell_personalizada'>{{grid.appScope.mapValue(row)}}</div>" }
			
			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				}
			}
			
		};

		$scope.gridOptionsValor.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.ChamarEditarValor(row.entity);
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
						posicao = $scope.todasPragas.indexOf(obj);
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
			refNovo.set(data);
			buscaPragas();
			data.key=parseInt(data.key)+1;
			$scope.clear();

		};

		$scope.clonar = function(){		
			$scope.todasPragas.forEach(function(obj){
				var objClonado= obj;
				delete 	objClonado.$$hashKey;
				var refNovo = new Firebase(Constant.Url + '/praemp/-KtH3-hl4fZVNnCHZnFn/' + obj.key+'/tamanho/a' );
				//refNovo.remove();
			});
			Notify.successBottom('Praga clonada com sucesso!');
		};

		$scope.editarPraga = function(data){
			if(validForm(data)) return false;

			//$scope.tamanhos=castObjToArray(praga.tamanho);

			var tamanhos={};
			$scope.tamanhos.forEach(function(obj){
				tamanhos[obj.key]={};
				tamanhos[obj.key]=obj;	
				delete 	tamanhos[obj.key].$$hashKey;
			});

			delete data.$$hashKey;
			delete data.tamanho;

			data.tamanho=tamanhos;

			var refNovo = new Firebase(Constant.Url + '/praga/' + data.key );
			refNovo.set(data);

			Notify.successBottom('Praga salva com sucesso!');

			
			$scope.clear();
		};

		$scope.cancelar = function(){
			$scope.clear();
			$scope.edit = false;
		};

		$scope.setarConserto = function(){	
			$scope.todasPragas.forEach(function(obj){

				if(obj.tamanho!=null)
				{
					$scope.tamanhos=(castObjToArray(obj.tamanho));
					if($scope.tamanhos[0].key=="a")
					{
						//var refNovo = new Firebase(Constant.Url + '/praga/' + obj.key+'/postam' );
						//refNovo.set(false);
						//console.log('possui tamanho A, key: ' + obj.key);
					}
					else
					{
						var x=1;
						$scope.tamanhos.forEach(function(obj2){
							console.log('PRAGA: ' + obj.key + ' TAMANHO' + obj2.key + ' ordem: ' + x );
							obj2['ordem']=x;
							obj2['ativo']=true;

							var refNovo = new Firebase(Constant.Url + '/praga/' + obj.key+'/tamanho/'+obj2.key );
							refNovo.set(obj2);
							x++;
						});
						//
						//refNovo.set(true);
						//console.log('possui tamanhos, key: ' + obj.key);
					}
				}
				else
				{
					console.log('nao possui nada de tamanho, key: ' + obj.key);
				}


				if(obj.tipo==null)
				{
				//	var refNovo = new Firebase(Constant.Url + '/praga/' + obj.key+'/tipo' );
				//	refNovo.set("PRA");
				//	console.log('tipo nulo: ' + obj.key);
			}

				//refNovo.set(false);

				//var refNovo = new Firebase(Constant.Url + '/praga/' + obj.key+'/postam' );
				//refNovo.set(data);


			});

		}

		$scope.chamaEditar = function(praga){	
			$scope.data = praga;
			if(praga.tamanho!=null)
			{
				$scope.tamanhos=(castObjToArray(praga.tamanho));
			}
			else
			{
				$scope.data.tamanhos=[];
				$scope.tamanhos=[];
			}
			if(praga.valor!=null)
			{
				$scope.valor=(castObjToArray(praga.valor));
			}
			else
			{
				$scope.data.valor=[];
				$scope.valor=[];
			}

			$scope.clearFormTamanho();
			$scope.clearFormValor();

			$scope.gridOptionsTamanhos.data=$scope.tamanhos;
			$scope.gridOptionsValor.data=$scope.valor;

			if(!$scope.$$phase) {
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
		//TAMANHO
		//############################################################################################################################


		$scope.ChamarEditarTamanho = function(tamanho)
		{
			$scope.frmTamanho = clone(tamanho);
			$scope.edit_tamanho=true;

		}

		$scope.atualizarTamanho = function()
		{
			if($scope.data==null || $scope.data.key==null) return;

			if(validFormTamanho($scope.frmTamanho)) return false;

			var tamObj = clone($scope.frmTamanho);
			delete tamObj.$$hashKey;
			var refTamanho = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/tamanho/'+tamObj.key);
			refTamanho.set(tamObj);

			$scope.data.tamanho[tamObj.key]=tamObj;
			var posicao;
			var x=0;
			$scope.tamanhos.forEach(function(obj) {
				if (obj.key!=null && obj.key == tamObj.key) {
					posicao = $scope.tamanhos.indexOf(obj);
				}
				x++;
			});
			if (posicao != null) {
				$scope.tamanhos[posicao] = tamObj;				
			}

			Notify.successBottom('Tamanho atualizado com sucesso!');

			$scope.clearFormTamanho();
			$scope.edit_tamanho= false;
		}

		$scope.salvarTamanho = function()
		{
			if($scope.data==null || $scope.data.key==null) return;

			if(validFormTamanho($scope.frmTamanho)) return false;

			var tamObj = clone($scope.frmTamanho);
			delete tamObj.$$hashKey;
			var refTamanho = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/tamanho/');
			tamObj.key = refTamanho.push().key();

			var refTamanhoNovo = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/tamanho/'+tamObj.key);
			refTamanhoNovo.set(tamObj);


			var refPraga = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/postam');
			refPraga.set(true);
			$scope.data.postam=true;
			

			$scope.data.tamanho[tamObj.key]=tamObj;
			
			$scope.tamanhos.push(tamObj);			
			
			Notify.successBottom('Tamanho inserido com sucesso!');

			$scope.clearFormTamanho();
			$scope.edit_tamanho= false;
		}

		$scope.cancelarTamanho = function()
		{		
			$scope.clearFormTamanho();
			$scope.edit_tamanho = false;
		}

		$scope.questionaExcluirTamanho = function()
		{
			if ($scope.frmTamanho.key != null) {
				$('#modalDeleteTamanho').modal('show');
			} 
		}

		$scope.excluirTamanho = function()
		{
			if($scope.data==null || $scope.data.key==null) return;

			var tamObj = clone($scope.frmTamanho);
			delete tamObj.$$hashKey;
			var refTamanho = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/tamanho/'+tamObj.key);
			refTamanho.remove();

			delete $scope.data.tamanho[tamObj.key]
			var posicao;
			var x=0;
			$scope.tamanhos.forEach(function(obj) {
				if (obj.key!=null && obj.key == tamObj.key) {
					posicao = $scope.tamanhos.indexOf(obj);
				}
				x++;
			});
			if (posicao != null) {
				delete $scope.tamanhos[posicao];		
			}


			if($scope.tamanhos.length==0)
			{
				var refPraga = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/postam');
				refPraga.set(false);
				$scope.data.postam=false;
			}

			$('#modalDeleteTamanho').modal('hide');

			Notify.successBottom('Tamanho removido com sucesso!');

			$scope.clearFormTamanho();
			$scope.edit_tamanho= false;

		}

//############################################################################################################################
		//############################################################################################################################
		//TAMANHO
		//############################################################################################################################


		$scope.ChamarEditarValor = function(valor)
		{
			$scope.frmValor = clone(valor);
			$scope.edit_valor=true;

		}

		$scope.atualizarValor = function()
		{
			if($scope.data==null || $scope.data.key==null) return;

			if(validFormValor($scope.frmValor)) return false;

			var tamObj = clone($scope.frmValor);
			delete tamObj.$$hashKey;
			var refValor = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/valor/'+tamObj.key);
			refValor.set(tamObj);

			$scope.data.valor[tamObj.key]=tamObj;
			var posicao;
			var x=0;
			$scope.valor.forEach(function(obj) {
				if (obj.key!=null && obj.key == tamObj.key) {
					posicao = $scope.valor.indexOf(obj);
				}
				x++;
			});
			if (posicao != null) {
				$scope.valor[posicao] = tamObj;				
			}

			Notify.successBottom('Valores atualizado com sucesso!');

			$scope.clearFormValor();
			$scope.edit_valor = false;
		}

		$scope.salvarValor = function()
		{
			if($scope.data==null || $scope.data.key==null) return;

			if(validFormValor($scope.frmValor)) return false;

			var tamObj = clone($scope.frmValor);
			delete tamObj.$$hashKey;
			var refValor = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/valor/');
			tamObj.key = refValor.push().key();

			var refValorNovo = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/valor/'+tamObj.key);
			refValorNovo.set(tamObj);


			var refPraga = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/valpre');
			refPraga.set(true);
			$scope.data.valpre=true;
			

			$scope.data.valor[tamObj.key]=tamObj;
			
			$scope.valor.push(tamObj);			
			
			Notify.successBottom('Valores inserido com sucesso!');

			$scope.clearFormValor();
			$scope.edit_valor = false;
		}

		$scope.cancelarValor = function()
		{		
			$scope.clearFormValor();
			$scope.edit_valor = false;
		}

		$scope.questionaExcluirValor = function()
		{
			if ($scope.frmValor.key != null) {
				$('#modalDeleteValor').modal('show');
			} 
		}

		$scope.excluirValor = function()
		{
			if($scope.data==null || $scope.data.key==null) return;

			var tamObj = clone($scope.frmValor);
			delete tamObj.$$hashKey;
			var refValor = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/valor/'+tamObj.key);
			refValor.remove();

			delete $scope.data.valor[tamObj.key]
			var posicao;
			var x=0;
			$scope.valor.forEach(function(obj) {
				if (obj.key!=null && obj.key == tamObj.key) {
					posicao = $scope.valor.indexOf(obj);
				}
				x++;
			});
			if (posicao != null) {
				delete $scope.valor[posicao];		
			}


			if($scope.valor.length==0)
			{
				var refPraga = new Firebase(Constant.Url + '/praga/'+$scope.data.key+'/valpre');
				refPraga.set(false);
				$scope.data.valpre=false;
			}

			$('#modalDeleteValor').modal('hide');

			Notify.successBottom('Valores removido com sucesso!');

			$scope.clearFormValor();
			$scope.edit_valor = false;

		}

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
			if(data.tipo==null || data.tipo == ''){
				setMessageError('O campo tipo é obrigatório!');
				return true;
			}
			if(data.key_clapra==null || data.key_clapra==''){
				setMessageError('O campo Classe é obrigatório!');
				return true;
			}
			return false;
		};


		function validFormTamanho(data){
			if(data.nome == null || data.nome==''){
				setMessageError('O campo nome é obrigatório!');
				return true;
			}
			if(data.ordem == null || (data.ordem=='' && data.ordem!=0)){
				setMessageError('O campo ordem é obrigatório!');
				return true;
			}
			
			return false;
		};


		function validFormValor(data){
			if(data.nome == null || data.nome==''){
				setMessageError('O campo nome é obrigatório!');
				return true;
			}
			if(data.ordem == null || (data.ordem=='' && data.ordem!=0)){
				setMessageError('O campo ordem é obrigatório!');
				return true;
			}
			if(data.valor == null || (data.valor=='' && data.valor!=0)){
				setMessageError('O campo valor é obrigatório!');
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

		$scope.clearFormTamanho= function(){
			$scope.frmTamanho==null;
			$scope.frmTamanho.nome='';
			$scope.frmTamanho.key='';
			$scope.frmTamanho.ativo=true;
			if($scope.tamanhos!=null)
			{
				$scope.frmTamanho.ordem = $scope.tamanhos.length +1 ;
			}
			else
			{
				$scope.frmTamanho.ordem = 1 ;
			}
			return true;
		};

		$scope.clearFormValor= function(){
			$scope.frmValor==null;
			$scope.frmValor.nome='';
			$scope.frmValor.key='';
			$scope.frmValor.ativo=true;
			if($scope.valor!=null)
			{
				$scope.frmValor.ordem = $scope.valor.length +1 ;
			}
			else
			{
				$scope.frmValor.ordem = 1 ;
			}
			return true;
		};

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