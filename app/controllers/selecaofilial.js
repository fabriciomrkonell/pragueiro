(function(){

	'use strict'; 

	angular.module('Pragueiro.controllers').registerCtrl('selecaofilialCtrl', selecaofilialCtrl);

	selecaofilialCtrl.$inject = 
	['$scope', '$firebase', '$firebaseObject', '$firebaseArray', 'Constant', 'Session', 'Notify', 'Controleacesso'];

	function selecaofilialCtrl($scope,  $firebase, $firebaseObject, $firebaseArray, Constant, Session, Notify, Controleacesso) {

		angular.extend($scope, {
			edit: false,
			save:true,
			fazendas: [],
			data: {}
		});



		$scope.clear = function(){
			$scope.data = {};
			angular.extend($scope.data, {
				codigo: '',
				nome: '',
				razaosocial: '',
				telefone: '',
				website: '',
				cidade: '',
				email: '',
				tipintapl: '',
				key: '',
				distancia_pontos:10,
				usuarios:[],
				todosUsuarios:[],
				todosFiliais:[],
				filialxusuarios:[], novoarray:[]
			});
		};

		var key_usuario;	

		$scope.tipintapls = ['Data aplicação', 'Data atual'];

		var ref = new Firebase(Constant.Url + '/filial');
		$scope.todosFiliais=$firebaseArray(ref);

		$scope.todosControleacessos =[];
		$scope.aceemps=[];
		$scope.qtde_controleacesso=0;
		$scope.qtde_controleacesso_porusuario=0;
		$scope.qtde_filial=0;

		recuperaControleacessoQtde();


		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "nome", displayName: "Nome", width: 300 },
			{ field: "razaosocial", displayName: "Raz. Social", width: 150 }
			]
		};

		$scope.toggleMultiSelect = function() {
			$scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
		};


		$scope.gridOptions.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.selecionouFazenda(row.entity);
			});
		};


		function recuperaFilialQtde() {

			var refUser = new Firebase(Constant.Url + '/usuarioxauth/'+Session.getUser().uid);		
			var obj = $firebaseObject(refUser);
			
			obj.$loaded().then(function() {
				key_usuario= obj.$value;

				var baseRef = new Firebase(Constant.Url + '/usuario/'+key_usuario+"/filial/");
				baseRef.on('value', function(snapshot) {
					$scope.qtde_filial= snapshot.numChildren();
					if(	$scope.qtde_filial>0)
					{
						$('#myPleaseWait').modal('show');
					}
					atualizaListaFiliais();
				});
			});
		}

		function atualizaListaFiliais()
		{


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
					console.log('Adicionou filial', snap.name(), snap.val());
					var obj= snap.val();

					obj.filial['aceemps']=[];

					recuperaControleacessoPorUsuarioQtde(obj.filial);

					$scope.fazendas.push(obj.filial);
					$scope.gridOptions.data = $scope.fazendas;

					if (!$scope.$$phase) {
						$scope.$apply();
					}

					if($scope.fazendas.length>$scope.qtde_filial && $scope.fazendas.length==1)
					{
						$('#myPleaseWait').modal('hide');
						$scope.selecionouFazenda(obj.filial);
					}
				});
			}

		//----
		function recuperaControleacessoQtde() {
			//$('#myPleaseWait').modal('show');


			var baseRef = new Firebase(Constant.Url+'/controleacesso');
			baseRef.on('value', function(snapshot) {
				$scope.qtde_controleacesso= snapshot.numChildren();
				recuperaControleacesso();
			});
		}

		function recuperaControleacesso() {

			var baseRef = new Firebase(Constant.Url+'/controleacesso');

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.todosControleacessos.push(objNovo);

				if (!$scope.$$phase) {
					$scope.$apply();
				}
				if($scope.todosControleacessos.length==$scope.qtde_controleacesso)
				{
					console.log('recuperaControleacesso terminou')
					recuperaFilialQtde();
				}					

			}, function(error) {
				console.error(error);
			});
		}

		function recuperaControleacessoPorUsuarioQtde(fazenda) {

			var baseRef = new Firebase(Constant.Url+'/aceemp/' + fazenda.key+'/'+ key_usuario);
			baseRef.on('value', function(snapshot) {
				fazenda.qtde_controleacesso_porusuario= snapshot.numChildren();
				if(fazenda.qtde_controleacesso_porusuario>0)
				{
					fazenda.aceempsObj={};
					recuperaControleacessoPorUsuario(fazenda);
				}
				else
				{
					fazenda['terminou']=true;
					var terminouTodos=true;
					$scope.fazendas.forEach(function(obj){
						if(obj.terminou==null || obj.terminou==false)
						{
							terminouTodos=false;
						}
					});
					if(terminouTodos)
					{
						$('#myPleaseWait').modal('hide');
					}
				}
			});
		}

		function recuperaControleacessoPorUsuario(fazenda) {
			if(fazenda==null) return false;
			if(key_usuario==null) return false;

			var i=0
			$scope.todosControleacessos.forEach(function(controle){
				$scope.todosControleacessos[i].visualizacao= false;
				$scope.todosControleacessos[i].inclusao=false;
				$scope.todosControleacessos[i].edicao= false;
				$scope.todosControleacessos[i].exclusao= false;
				i++;
			});

			var baseRef = new Firebase(Constant.Url+'/aceemp/' + fazenda.key+'/'+ key_usuario);

			baseRef.on('child_added', function(snapshot) {

				var objNovo = snapshot.val();
				fazenda.aceemps.push(clone(objNovo));

				fazenda.aceempsObj[objNovo.link] = objNovo;

				var posicao;
				$scope.todosControleacessos.forEach(function(controle){
					if(controle.key==objNovo.key)
					{
						posicao= $scope.todosControleacessos.indexOf(controle);
					}
				});
				if(posicao!=null)
				{
					$scope.todosControleacessos[posicao].visualizacao= objNovo.visualizacao;
					$scope.todosControleacessos[posicao].inclusao= objNovo.inclusao;
					$scope.todosControleacessos[posicao].edicao= objNovo.edicao;
					$scope.todosControleacessos[posicao].exclusao= objNovo.exclusao;
				}
				//$scope.gridOptionsControleacesso.data=$scope.todosControleacessos;
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				if(fazenda.aceemps.length==fazenda.qtde_controleacesso_porusuario)
				{
					fazenda['terminou']=true;

					var terminouTodos=true;
					$scope.fazendas.forEach(function(obj){
						if(obj.terminou==null || obj.terminou==false)
						{
							terminouTodos=false;
						}
					});
					if(terminouTodos)
					{
						$('#myPleaseWait').modal('hide');
					}
				}	

			});

			baseRef.on('child_changed', function(snapshot) {

				var objNovo = snapshot.val();
				$scope.aceemps.push(objNovo);

				var posicao;
				$scope.todosControleacessos.forEach(function(controle){
					if(controle.key==objNovo.key)
					{
						posicao= $scope.todosControleacessos.indexOf(controle);
					}
				});
				if(posicao!=null)
				{
					$scope.todosControleacessos[posicao].visualizacao= objNovo.visualizacao;
					$scope.todosControleacessos[posicao].inclusao= objNovo.inclusao;
					$scope.todosControleacessos[posicao].edicao= objNovo.edicao;
					$scope.todosControleacessos[posicao].exclusao= objNovo.exclusao;
				}


			});
		}

		$scope.selecionouFazenda = function(data){
			Constant.todosFiliais = $scope.fazendas;
			Constant.filialCorrente = data;
			Constant.todosControleacessos= $scope.todosControleacessos;

			var i=0;
			$scope.todosControleacessos.forEach(function(controle){
				$scope.todosControleacessos[i]['visualizacao']= true;
				$scope.todosControleacessos[i]['inclusao']=true;
				$scope.todosControleacessos[i]['edicao']= true;
				$scope.todosControleacessos[i]['exclusao']= true;
				i++;
			});

			if(data.aceemps.length==0)
			{
				data.aceempsObj={};
				$scope.todosControleacessos.forEach(function(controle){				
					data.aceempsObj[controle.link] = controle;
				});
			}			
			
			window.localStorage.setItem('menu', Controleacesso.refazMenu_Acesso($scope.todosControleacessos));
			window.localStorage.setItem('todasFiliais', JSON.stringify( $scope.fazendas));
			window.localStorage.setItem('filialCorrente', JSON.stringify(data));
			window.localStorage.setItem('key_usuario', key_usuario);

			var i=0;
			$scope.fazendas.forEach(function(obj) {
				if (obj.key == data.key) {
					window.localStorage.setItem('posicaoFilial', i);
				}
				i++;
			});

			if (!$scope.$$phase) {
				$scope.$apply();
			}

			window.location.href = '#home';
		};

		$scope.cancelar = function(){
			$scope.clear();
			$scope.edit = false;
			$scope.save = true;
			return true;
		};

		function clone(obj) {
			if (null == obj || "object" != typeof obj) return obj;
			var copy = obj.constructor();
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
			}
			return copy;
		}

		function checkLocalHistoryCompatibilidade(){
			var test = 'test';
			try {
				localStorage.setItem(test, test);
				localStorage.removeItem(test);
				return true;
			} catch(e) {
				return false;
			}
		}


		$scope.clear();

	}

}());