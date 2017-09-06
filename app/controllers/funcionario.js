(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('funcionarioCtrl', funcionarioCtrl);

	funcionarioCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function funcionarioCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			funcionarios: [],
			funcionarioFilial: [],
			data: {
				ativo:true				
			}
		});


		var ref = new Firebase(Constant.Url + '/funcionario');
		$scope.todasFuncionarios = $firebaseArray(ref);
		//var refFazendas = new Firebase(Constant.Url + '/filial');
		atualizaListaFiliais();

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "codigo", displayName: "Código", width: 80 },
			{ field: "nome", displayName: "Nome", width: 200 },
			{ field: "funcao", displayName: "Função/Cargo", width: 200 },
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

		$scope.chengeFazenda = function(fazenda){
			if(fazenda === null) 
			{
				$scope.funcionarios =null;
			}
			else
			{			
				//$('#myPleaseWait').modal('show');	

				$scope.funcionarios=[];
				$scope.gridOptions.data = $scope.funcionarios;

				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/"+fazenda.key+"/funcionario"),
					[baseRef.child("/funcionario"), "$key"]
					).select(
					{"key":"funcionario.$value","alias":"filial"},
					{"key":"$key.$value","alias":"funcionarios"}
					).ref();

/*
					refNovoQuadra.on('value', function(snapshot) {
						
						if(snapshot.numChildren()==0)
						{
							$('#myPleaseWait').modal('hide');
						}

					});
					*/
					refNovoQuadra.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();
						$scope.funcionarios.push(objNovo['funcionarios']);
						if(!$scope.$$phase) {
							$scope.$apply();
						}
						$scope.gridOptions.data = $scope.funcionarios;
					});

					refNovoQuadra.on('child_changed', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();
						var x=0;
						var posicao=null;
						$scope.funcionarios.forEach(function(obj){
							if(obj.key === objNovo['funcionarios'].key)
							{ 
								posicao=x;
							}
							x++;

						});
						if(posicao!=null)
							$scope.funcionarios[posicao]=objNovo['funcionarios'];

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



$scope.getDadosFuncionario = function(obj, nomeColuna){
	var retorno = '';
	if(nomeColuna=='nome')
	{
		$scope.todasFuncionarios.forEach(function(item){
			if(item.$id === obj.$id) retorno = item['nome'];
		});
	}
	if(nomeColuna=='codigo')
	{
		$scope.todasFuncionarios.forEach(function(item){
			if(item.$id === obj.$id) retorno = item['codigo'];
		});
	}
	if(nomeColuna=='ativo')
	{
		$scope.todasFuncionarios.forEach(function(item){
			if(item.$id === obj.$id) retorno = item['ativo'];
		});
	}
	if(nomeColuna=='coordenadas')
	{
		$scope.todasFuncionarios.forEach(function(item){
			if(item.$id === obj.$id) retorno = item['coordenadas'];
		});
	}
	return retorno;
};

$scope.salvarFuncionario = function(data){
	if(validForm(data)) return false;

	var fazendaTmp=data.fazenda;
	delete data.fazenda;
	delete data.$$hashKey;	
	data['filial']=[];
	data['filial'][fazendaTmp.key]=true;
	var refFuncionario = new Firebase(Constant.Url + '/funcionario/');
	var key=refFuncionario.push().key();
	var refFuncionarioNovo = new Firebase(Constant.Url + '/funcionario/'+key);
	data.key=key;
	refFuncionarioNovo.set(data);
	var refFuncionarioNovo = new Firebase(Constant.Url + '/filial/'+fazendaTmp.key + '/funcionario/'+key);
	refFuncionarioNovo.set(true);
	$scope.chengeFazenda(fazendaTmp);
	$scope.clear();						
	$scope.setaFazenda(fazendaTmp);	

	Notify.successBottom('Funcionário(a) inserida com sucesso!');

};

$scope.editarFuncionario = function(data){
	if(validForm(data)) return false;
	var fazendaTmp=data.fazenda;
	delete data.fazenda;
	delete data.$$hashKey;		
	var refFuncionario = new Firebase(Constant.Url + '/funcionario/'+data.key);
	refFuncionario.set(data);
	data.fazenda=fazendaTmp;
	$scope.clear();

	Notify.successBottom('Funcionário(a) atualizada com sucesso!');
};

$scope.cancelar = function(){
	var fazendaTmp=$scope.data.fazenda;
	$scope.clear();
	$scope.setaFazenda(fazendaTmp);	
	$scope.chengeFazenda($scope.data.fazenda);	
	$scope.edit = false;
	$scope.save= true;
};

$scope.editar = function(obj){
	$scope.desabilitaFazenda=true;
	var fazendaTmp=$scope.data.fazenda;
	$scope.data = obj;
	$scope.data.fazenda=fazendaTmp;
	$scope.edit = true;
	$scope.save= false;

	$scope.desabilitaFazenda=true;		

};

$scope.excluir = function(objeto){
	$('#modalDelete').modal('show');
}

$scope.excluirFuncionario = function(objeto){
	$('#modalDelete').modal('hide');
	var fazendaTmp=$scope.data.fazenda;
	if(objeto.qtd!=null)
	{
		if(objeto.qtd>0)
		{
			setMessageError('Já foi associado em funcionário. Impossível continuar.');
			return true;
		}
	}			

	var refFuncionarioNovo = new Firebase(Constant.Url + '/funcionario/' + objeto.key);
	refFuncionarioNovo.remove();
	var refFuncionarioNovo = new Firebase(Constant.Url + '/filial/'+ $scope.data.fazenda.key + '/funcionario/' + objeto.key);
	refFuncionarioNovo.remove();						
	Notify.successBottom('Funcionário(a) removida com sucesso!');
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
		ativo: true,
		nome: '',
		qtd:0,
		codigo: '',
		valhor: '',
		key:''
	});
	//$scope.data.fazenda=fazendaTmp;
	$scope.desabilitaFazenda=false;
	$scope.edit=false;
	$scope.save= true;
	if(!$scope.$$phase) {
		$scope.$apply();
	}
	//$scope.chengeFazenda($scope.fazenda);
	//$scope.data.fazenda=fazendaTmp;
};


//$scope.clear();

}

}());