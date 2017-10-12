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

			$('#myPleaseWait').modal('hide');
			$scope.menu='<nav class="navbar navbar-default navbar-fixed-top">';
			$scope.menu+='	<div class="container-fluid">';
			$scope.menu+='		<div class="navbar-header">';
			$scope.menu+='			<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">';
			$scope.menu+='				<span class="sr-only">Toggle navigation</span>';
			$scope.menu+='				<span class="icon-bar"></span>';
			$scope.menu+='				<span class="icon-bar"></span>';
			$scope.menu+='				<span class="icon-bar"></span>';
			$scope.menu+='			</button>';
			$scope.menu+='			<a class="navbar-brand"><img src="dist/img/actionbar_title.png" class="logo-actionbar_title"</a>';
			$scope.menu+='		</div>';
			$scope.menu+='		<div id="navbar" class="navbar-collapse collapse">';
			$scope.menu+='			<ul class="nav navbar-nav">';
			$scope.menu+='				<li><a href="#/home">Início</a></li>';

			var oldGrupo;


			var acessos = [];
			var i=0;
			if(data.aceemps.length==0)
			{
				$scope.todosControleacessos.forEach(function(controle){
					$scope.todosControleacessos[i]['visualizacao']= true;
					$scope.todosControleacessos[i]['inclusao']=true;
					$scope.todosControleacessos[i]['edicao']= true;
					$scope.todosControleacessos[i]['exclusao']= true;
					i++;
				});

				acessos=$scope.todosControleacessos;
			}
			else
			{
				acessos=data.aceemps;
			}
			i=0;
			$scope.todosControleacessos.forEach(function(controle){
				$scope.todosControleacessos[i]['visualizacao']= true;
				$scope.todosControleacessos[i]['inclusao']=true;
				$scope.todosControleacessos[i]['edicao']= true;
				$scope.todosControleacessos[i]['exclusao']= true;
				i++;
			});


			//window.localStorage.setItem('menu', Controleacesso.refazMenu_Acesso(acessos));
			window.localStorage.setItem('menu', Controleacesso.refazMenu_Acesso($scope.todosControleacessos));


/*
			i=0;
			acessos.forEach(function(obj){
				i++;
				if(obj.ativo==null || obj.ativo==false || obj.visualizacao==null || obj.visualizacao==false)
				{
					if(acessos.length==i)
					{
						$scope.menu +='	</ul>';
						$scope.menu +='</li>';
					}
					return;
				}
				if(obj.grupo)
				{
					if(oldGrupo!=null)
					{
						$scope.menu +='</ul>';
						$scope.menu +='</li>';
					}

					oldGrupo = obj;

					$scope.menu +='<li class="dropdown">';
					$scope.menu +='		<a href="#'+ obj.link + '" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">' + obj.nome + ' <span class="caret"></span></a>';
					$scope.menu +='		<ul class="dropdown-menu">';
				}
				else
				{
					$scope.menu +='			<li><a href="#/'+obj.link +'">'+ obj.nome +'</a></li>';
					if(acessos.length==i)
					{
						$scope.menu +='	</ul>';
						$scope.menu +='</li>';
					}
				}

			});

			$scope.menu+=	'</ul>';



			$scope.menu+=	'<ul class="nav navbar-nav navbar-right">';
			$scope.menu+=	'	<li class="dropdown">';
			$scope.menu+=	'		<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Configurações <span class="caret"></span></a>';
			$scope.menu+=	'		<ul class="dropdown-menu">';
			$scope.menu+=	'			<li><a href="#/perfil">Meu perfil</a></li>';
			$scope.menu+=	'			<li><a href="#/sair">Sair</a></li>';
			$scope.menu+=	'			<!--<li><a href="#/erros">Erros</a></li>-->';
			$scope.menu+=	'		</ul>';
			$scope.menu+=	'	</li>';
			$scope.menu+=	'</ul>';

			$scope.menu+=	'<ul class="nav navbar-nav navbar-right">';
			$scope.menu+=	'	<li>';
			$scope.menu+=	'		<div class="navFazenda" > Fazenda <select class="navFazenda select" ng-options="fazenda.nome for fazenda in fazendas" ng-model="fazenda"  ng-change="chengeFazenda(fazenda)">	</select> </div>';
			$scope.menu+=	'	</li>';
			$scope.menu+=	'</ul>';


			$scope.menu+=	'</div></div></nav>';


			Constant.menu= $scope.menu;
			*/

			Constant.todasFiliais = $scope.fazendas;
			Constant.filialCorrente = data;
			Constant.todosControleacessos= $scope.todosControleacessos;

			window.localStorage.setItem('todasFiliais', JSON.stringify( $scope.fazendas));
			window.localStorage.setItem('filialCorrente', JSON.stringify(data));
			//window.localStorage.setItem('menu', $scope.menu);
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