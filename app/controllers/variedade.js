(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('variedadeCtrl', variedadeCtrl);

	variedadeCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function variedadeCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

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
		atualizaCulturas();
		atualizaListaFiliais();


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
						$('#myPleaseWait').modal('hide');

						//console.log('Adicionou filial', snap.name(), snap.val());
						var obj= snap.val();
						$scope.fazendas.push(obj.filial);
						if(i==0)
						{
							$scope.chengeFazenda($scope.fazendas[0]);
							$scope.data.fazenda=$scope.fazendas[0];
						}
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
					if($scope.fazendas.length==0)
					{
						$('#myPleaseWait').modal('hide');
					}
			});// final do load
		}		

		$scope.chengeFazenda = function(fazenda)
		{

			if(fazenda === null) 
			{
				$scope.variedades =null;
			}
			else
			{
				//$('#myPleaseWait').modal('show');
				$scope.variedades=[];
				$scope.gridOptions.data = $scope.variedades;
				$scope.clear();

				var refUsuarios= new Firebase(Constant.Url + '/variedade/'+fazenda.key);
/*
				refUsuarios.on('value', function(snapshot) {
					if(snapshot.numChildren()==0)
					{
						$('#myPleaseWait').modal('hide');
					}
				});
				*/
				refUsuarios.ref().on('child_added', function(snap) {
					$('#myPleaseWait').modal('hide');
					var variedades_brutas=snap.val();
					for(var obj in variedades_brutas ){
						var objVar=variedades_brutas[obj];
						for(var objCul in $scope.culturas )
						{
							if($scope.culturas[objCul].key==objVar.key_cultura)
							{
								objVar['cultura']=$scope.culturas[objCul];
								$scope.variedades.push(variedades_brutas[obj]);
								$scope.gridOptions.data = $scope.variedades;
								break;
							}
						}		
					};
				}); 
			}
		};



		function atualizaCulturas()
		{
			var refCultura = new Firebase(Constant.Url + '/cultura');
			refCultura.ref().on('child_added', function(snap) {
				$scope.culturas.push(snap.val());
			});
		}

		//############################################################################################################################
		//############################################################################################################################
		// QUADRA
		//############################################################################################################################

		

		$scope.getDadosVariedade = function(obj, nomeColuna){
			var retorno = '';
			if(nomeColuna=='nome')
			{
				$scope.todasVariedades.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['nome'];
				});
			}
			if(nomeColuna=='codigo')
			{
				$scope.todasVariedades.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['codigo'];
				});
			}
			if(nomeColuna=='ativo')
			{
				$scope.todasVariedades.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['ativo'];
				});
			}
			if(nomeColuna=='coordenadas')
			{
				$scope.todasVariedades.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['coordenadas'];
				});
			}
			return retorno;
		};

		$scope.salvarVariedade = function(data){
			if(validForm(data)) return false;

			var fazendaTmp=data.fazenda;

			data['key_filial']=data.fazenda.key;
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

			delete data.fazenda;
			delete data.cultura;
			delete data.$$hashKey;	

			var refVariedade = new Firebase(Constant.Url + '/variedade/'+fazendaTmp.key+'/'+ data.key_cultura);
			var key=refVariedade.push().key();
			var refVariedadeNovo = new Firebase(Constant.Url + '/variedade/'+fazendaTmp.key+'/'+ data.key_cultura+'/'+key);
			data.key=key;
			refVariedadeNovo.set(data);
			$scope.chengeFazenda(fazendaTmp);
			$scope.clear();			
			Notify.successBottom('Variedade inserida com sucesso!');
			$scope.setaFazenda(fazendaTmp);	
		};

		$scope.editarVariedade = function(data){
			if(validForm(data)) return false;
			var fazendaTmp=data.fazenda;
			delete data.fazenda;
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
			var refVariedade = new Firebase(Constant.Url + '/variedade/'+fazendaTmp.key+'/'+data.key_cultura+'/'+data.key);
			refVariedade.set(data);
			data.fazenda=fazendaTmp;		
			Notify.successBottom('Variedade atualizada com sucesso!');
			$scope.chengeFazenda(fazendaTmp);
			$scope.clear();
			$scope.setaFazenda(fazendaTmp);	
		};

		$scope.cancelar = function(){
			var fazendaTmp=$scope.data.fazenda;
			$scope.clear();
			$scope.setaFazenda(fazendaTmp);	
			$scope.chengeFazenda($scope.data.fazenda);	
			$scope.edit = false;
			$scope.save=true;
		};

		$scope.editar = function(obj){

			$scope.desabilitaFazenda=true;
			var fazendaTmp=$scope.data.fazenda;
			$scope.data = obj;
			$scope.data.fazenda=fazendaTmp;
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
			var fazendaTmp=$scope.data.fazenda;
			if(objeto.qtd!=null)
			{
				if(objeto.qtd>0)
				{
					setMessageError('Já foi associado em quadra. Impossível continuar.');
					return true;
				}
			}
			
			var refVariedadeNovo = new Firebase(Constant.Url + '/variedade/'+objeto.key_filial+'/'+objeto.key_cultura+'/'+objeto.key);
			refVariedadeNovo.remove();
			
			Notify.successBottom('Variedade removida com sucesso!');
			$scope.chengeFazenda(fazendaTmp);
			$scope.cancelar();
			return true;
			
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

			if(data.fazenda==null || data.fazenda.key == null){
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
			//var fazendaTmp=$scope.data.fazenda;
			angular.extend($scope.data, {
				key_cultura: '',
				ativo: true,
				key_tecnologia: '',
				nome_tecnologia: '',
				nome: '',
				qtd:0,
				dias:'',
				key:''
			});
			//$scope.data.fazenda=fazendaTmp;
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
			$scope.save=true;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			//$scope.chengeFazenda($scope.fazenda);
			//$scope.data.fazenda=fazendaTmp;
		};
		

		//$scope.clear();

	}

}());