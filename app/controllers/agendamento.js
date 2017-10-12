(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('agendamentoCtrl', agendamentoCtrl);

	agendamentoCtrl.$inject = ['$scope', '$compile', '$sce','$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify', '$timeout', 'uiCalendarConfig'];

	function agendamentoCtrl($scope, $compile, $sce, $firebaseArray, $firebaseObject, Session, Constant, Notify,  $compile, $timeout, uiCalendarConfig) {

		angular.extend($scope, {
			edit: false,
			save: true,
			desabilitaFazenda: false,
			fazendas: [],
			equipes: [],
			equipeFilial: [],
			data: {
				ativo:true				
			}
		});


		$scope.menu  = $sce.trustAsHtml(window.localStorage.getItem('menu'));
		$scope.fazendas  = JSON.parse(window.localStorage.getItem('todasFiliais'));
		$scope.todasFazendasAceemps = JSON.parse(window.localStorage.getItem('todasFazendasAceemps'));
		$scope.posicaoFilial = window.localStorage.getItem('posicaoFilial');
		$scope.fazenda  = $scope.fazendas[$scope.posicaoFilial];
		var key_usuario  = window.localStorage.getItem('key_usuario');

		$scope.todasOrdser = [];
		$scope.todasQuadras = [];
		$scope.todosUsuarios=[];
		$scope.todosAgendamento=[];
		$scope.todasVariedades = [];

		$scope.qtde_quadras=0;
		$scope.qtde_ordser=0;
		$scope.qtde_usuario=0;

		atualizaListaFiliais();



		//############################################################################################################################
		//############################################################################################################################
		// CALENDARIO
		//############################################################################################################################
		
		$scope.changeTo = 'Portugues';
		/* event source that pulls from google.com */

		/* event source that contains custom events on the scope */
		
		$scope.events = [];

		/* alert on eventClick */
		$scope.alertOnEventClick = function( date, jsEvent, view){
			var i=0;
			$scope.todosAgendamento.forEach(function(obj) {
				if (i+1 == date._id) {
					$scope.data_agendamento=obj;
				}
				i++;
			});

			$scope.mostrarDetalhe($scope.data_agendamento);

		};
		/* alert on Drop */
		$scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
			//$scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
		};
		/* alert on Resize */
		$scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
			//$scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
		};
		/* add and removes an event source of choice */
		$scope.addRemoveEventSource = function(sources,source) {
			var canAdd = 0;
			angular.forEach(sources,function(value, key){
				if(sources[key] === source){
					sources.splice(key,1);
					canAdd = 1;
				}
			});
			if(canAdd === 0){
				sources.push(source);
			}
		};
		
		/* add custom event*/
		$scope.addEvent = function() {
			$scope.events.push({
				title: 'Open Sesame',
				start: new Date(y, m, 28),
				end: new Date(y, m, 29),
				className: ['openSesame']
			});
		};
		/* remove event */
		$scope.remove = function(index) {
			$scope.events.splice(index,1);
		};
		/* Change View */
		$scope.changeView = function(view,calendar) {
			uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
		};
		/* Change View */
		$scope.renderCalender = function(calendar) {
			/*
			$timeout(function(){
				if(uiCalendarConfig.calendars[calendar]){
					uiCalendarConfig.calendars[calendar].fullCalendar('render');
				}
			});
			*/
		};
		/* Render Tooltip */
		$scope.eventRender = function( event, element, view ) { 
			element.attr({'tooltip': event.title,
				'tooltip-append-to-body': true});
			//$compile(element)($scope);
		};
		/* config object */
		$scope.uiConfig = {
			height: 450,
			editable: true,
			header:{
				left: 'title',
				center: '',
				right: 'today prev,next'
			},
			eventClick: $scope.alertOnEventClick,
			eventDrop: $scope.alertOnDrop,
			eventResize: $scope.alertOnResize,
			eventRender: $scope.eventRender

		};

		$scope.changeLang = function() {
			if($scope.changeTo === 'Hungarian'){
				$scope.uiConfig.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
				$scope.uiConfig.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
				$scope.changeTo= 'English';
			}
			else
			{
				if($scope.changeTo === 'Portugues'){
					$scope.uiConfig.monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
					$scope.uiConfig.dayNames = ["Domingo", "Segunda", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
					$scope.uiConfig.dayNamesShort = ["Dom", "Qua", "Ter", "Qua", "Qui", "Sex", "Sab"];
					$scope.changeTo= 'Portugues';
				}
				else {
					$scope.uiConfig.dayNames = ["Domingo", "Segunda", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
					$scope.uiConfig.dayNamesShort = ["Dom", "Qua", "Ter", "Qua", "Qui", "Sex", "Sab"];
					$scope.changeTo = 'Hungarian';
				}
			}
		};
		/* event sources array*/
		$scope.eventSources = [$scope.events];
        //$scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];


        $scope.renderCalender('myCalendar');

        $scope.changeTo = 'Portugues';
        $scope.changeLang();
		//############################################################################################################################
		//############################################################################################################################
		// GRID
		//############################################################################################################################
		
		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "data", displayName: "Data", type: 'date',
			cellFilter: 'date:"dd/MM/yyyy"', width: 120, sort:{ direction: 'asc', priority: 0 }},
			{ field: "quadra.nome", displayName: "Quadra", width: 120 },
			{ field: "tipo", displayName: "Tipo", width: 140 },
			{ field: "ordser.codigo", displayName: "Ordem Serviço", width: 140 },
			{ field: "usuario.nome", displayName: "Usuário", width: 120 }
			],
			appScopeProvider: {
				mapValue: function(row) {
					return row.entity.ativo ? 'Sim' : 'Não';
				}
			}
			
		};
		//---
		$scope.toggleMultiSelect = function() {
			$scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
		};
		//---
		$scope.gridOptions.onRegisterApi = function(gridApi){
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
				$scope.data_agendamento=row.entity;
				$scope.detalhe=true;
				console.log($scope.uiConfig);
				var calendar = document.getElementById('#myCalendar');
				calendar.fullCalendar('gotoDate', new Date());

				$scope.uiConfig.fullCalendar('gotoDate', 2019, 11);

			});
		}

		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA/FILIAL
		//############################################################################################################################
		//---
		function atualizaListaFiliais()
		{
			console.log('atualizaListaFiliais()');
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

							var fazenda = $scope.fazendas[0];	
							$scope.data.fazenda = 	fazenda;
							if(fazenda.usuario!=null)
							{

								$scope.qtde_usuarios  =+ Object.keys(fazenda.usuario).length;
							}
							else
							{
								$scope.qtde_usuarios  =+ 0;
							}

							if(fazenda.quadra!=null)
							{
								$scope.qtde_quadras =+ Object.keys(fazenda.quadra).length;
							}
							else
							{
								$scope.qtde_quadras =+ 0;
							}						
							recuperaQtdeOrdser($scope.fazendas[0]);
							recuperaUsuarios($scope.fazendas[0]);
							recuperaQuadra($scope.fazendas[0]);
						}
						if(!$scope.$$phase) {
							$scope.$apply();
						}
						i++;
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
		//---
		function recuperaQtdeOrdser(fazenda) {
			console.log('recuperaQtdeOrdser()');
			var baseRef = new Firebase(Constant.Url+'/ordser/' + fazenda.key);
			baseRef.on('value', function(snapshot2) {
				console.log('retornou()');
				$scope.qtde_ordser= snapshot2.numChildren();
				if(	$scope.qtde_ordser==0)
				{
					//atualizaListaFiliais();
				}
				else
				{				
					recuperaOrdser(fazenda);
				}
			});
		}
		//---------------------
		function recuperaOrdser(fazenda) 
		{
			console.log('recuperaOrdser()');
			var baseRef2 = new Firebase(Constant.Url+'/ordser/'+fazenda.key);

			baseRef2.on('child_added', function(snapshot3) {

				var objNovo3 = snapshot3.val();
				$scope.todasOrdser.push(objNovo3);		

				if(verificaFinalizacaoCarregamento())
				{
					$scope.chengeFazenda($scope.fazendas[0]);
					$('#myPleaseWait').modal('hide');
					//$scope.chengeSafra($scope.data.safra);
					
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}			

			});
		}	
		//---
		function recuperaQuadra(fazenda) {
			console.log('recuperaQuadra()');
			if (fazenda === null) {
				$scope.todasQuadras = null;
			} else {

				$scope.todasQuadras = [];
				$scope.todasQuadras=[];

				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/" + fazenda.key + "/quadra"), [baseRef.child("/quadra"), "$key"]
					).select({
						"key": "quadra.$value",
						"alias": "filial"
					}, {
						"key": "$key.$value",
						"alias": "Quadras"
					}).ref();

					refNovoQuadra.on('child_added', function(snap) {
						var objNovo = snap.val();
						$scope.todasQuadras.push(objNovo['Quadras']);
						if (!$scope.$$phase) {
							$scope.$apply();
						}
						
						if(verificaFinalizacaoCarregamento())
						{
							$('#myPleaseWait').modal('hide');
							$scope.chengeFazenda($scope.fazendas[0]);
						}
						
					});


				}
			}
		//---
		function recuperaUsuarios(fazenda)
		{
			console.log('recuperaUsuarios()');
			if(fazenda === null || fazenda==null) 
			{
				$scope.todosUsuarios =[];
			}
			else
			{			

				$scope.todosUsuarios=[];

				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/"+fazenda.key+"/usuario"),
					[baseRef.child("/usuario"), "$key"]
					).select(
					{"key":"usuario.$value","alias":"filial"},
					{"key":"$key.$value","alias":"usuarios"}
					).ref();



					refNovoQuadra.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();

						$scope.todosUsuarios.push(objNovo['usuarios']);

						if (!$scope.$$phase) {
							$scope.$apply();
						}
						if(verificaFinalizacaoCarregamento())
						{
							$('#myPleaseWait').modal('hide');
							$scope.chengeFazenda($scope.fazendas[0]);
						}

					});
				}
			};
		//---
		$scope.chengeFazenda = function(fazenda)
		{
			console.log('chengeFazenda()');
			if(fazenda === null) 
			{
				return;
			}
			else
			{	

			//--------------------------------------
			//Controle Acesso	
			fazenda.aceempsObj = $scope.todasFazendasAceemps[fazenda.key].aceempsObj;
			$scope.objetoTelaAcesso=fazenda.aceempsObj.agendamento;

			if($scope.objetoTelaAcesso==null || $scope.objetoTelaAcesso.visualizacao==null || $scope.objetoTelaAcesso.visualizacao==false)
			{
				window.location.href = '#home';
			}
			//--------------------------------------

			$scope.safra = {};
			$scope.safras = [];
			for (var propertyName in fazenda.safra) {
				$scope.safras.push(fazenda.safra[propertyName]);
			}

			$scope.data.safra=$scope.safras[0];
			$scope.chengeSafra($scope.data.safra);
		}
	};
		//---
		$scope.chengeSafra = function(safra)
		{
			console.log('chengeSafra()');
			if(safra==null) { return false};

			if (safra.key === null) {
				$scope.todosPlanejamento = null;
			} else {

				finalizaOrdser();
				recuperaAgendamentos($scope.data.fazenda, safra);

				$scope.todosPlanejamento = [];
				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refTipatiNovo = new Firebase.util.NormalizedCollection(
					[baseRef.child("/filial/" + $scope.data.fazenda.key + "/safra/" + safra.key + "/quadra"), "$key"],
					baseRef.child("/quadra")
					).select({
						"key": "$key.$value",
						"alias": "planejamento"
					}, {
						"key": "quadra.$value",
						"alias": "quadra"
					}).ref();

					refTipatiNovo.on('child_added', function(snap) {
						var objNovo = snap.val();

						if(objNovo.planejamento.variedades!=null)
						{
							var list_var=[];
							if(!Array.isArray(objNovo.planejamento.variedades))
							{
								for(var objVar in objNovo.planejamento.variedades)
								{
									for(var variedade of $scope.todasVariedades) {
										if (objVar === variedade.key) {
											var obj=clone(variedade);
											if(objNovo.planejamento.variedades[objVar].area!=null)
											{
												obj['area']=objNovo.planejamento.variedades[objVar].area;
											}
											list_var.push(obj);
											break;
										}
									};
								}
								objNovo['variedades']=list_var;
							}
							else
							{
								var list_var=[];
								objNovo.planejamento.variedades.forEach(function(var_pla) 
								{
									for(var variedade of $scope.todasVariedades) {
										if (var_pla.key === variedade.key) {
											var obj=variedade;
											if(var_pla.area!=null)
											{
												obj['area']=var_pla.area;
												$scope.soma_area = $scope.soma_area + var_pla.area;
											}
											list_var.push(obj);
											break;
										}
									};

								});
								objNovo['variedades']=list_var;
							}
						}


						$scope.todosPlanejamento.push(objNovo);
						if (!$scope.$$phase) {
							$scope.$apply();
						}

						
						
					});
				}
			}
		//---------------------
		function recuperaAgendamentos(fazenda, safra) 
		{
			console.log('recuperaAgendamentos()');
			var baseRef2 = new Firebase(Constant.Url+'/agendamento/'+fazenda.key + '/' + safra.key);

			var x=0;
			baseRef2.on('child_added', function(snapshot3) {

				var objNovoAgendamento = snapshot3.val();

				$scope.todosUsuarios.forEach(function(obj) {
					if (obj.key === objNovoAgendamento.key_usuario) {
						objNovoAgendamento['usuario']=obj;
					}

				});

				$scope.todasQuadras.forEach(function(obj) {
					if (obj.key === objNovoAgendamento.key_quadra) {
						objNovoAgendamento['quadra']=obj;
					}
				});

				$scope.todasOrdser.forEach(function(obj) {
					if (obj.key === objNovoAgendamento.key_ordser) {
						objNovoAgendamento['ordser']=obj;
					}
				});

				objNovoAgendamento['tipo']= 'Levantamento';
				objNovoAgendamento['temUsuario']=true;

				objNovoAgendamento.data = new Date(objNovoAgendamento.data);

				$scope.todosAgendamento.push(objNovoAgendamento);		


				$scope.gridOptions.data=$scope.todosAgendamento;

				var data_crua= objNovoAgendamento.data.toDateString();

				var color='#ffad33';
				if (objNovoAgendamento.situacao!='Finalizado' && new Date(data_crua) < new Date(new Date().toDateString())){
					color='#ff9999';
				}
				if (objNovoAgendamento.situacao=='Finalizado'){
					color='#39ac39';
				}

				$scope.events.push({backgroundColor: color, stick: true, title: 'Levant. \n' + objNovoAgendamento['quadra'].nome, start: new Date(objNovoAgendamento.data.getFullYear(), objNovoAgendamento.data.getMonth(), objNovoAgendamento.data.getDate())}
					);

				$scope.eventSources = [$scope.events];
				
				if(!$scope.$$phase) {
					$scope.$apply();
				}
				x++;

			});

			baseRef2.on('child_removed', function(snap) {
				var objNovo = snap.val();
				var posicao = null;
				$scope.todosAgendamento.forEach(function(obj) {
					if (obj.key === objNovo.key) {
						posicao = $scope.todosAgendamento.indexOf(obj);
					}
				});
				if (posicao != null) {
					delete $scope.todosAgendamento[posicao];

					$scope.events.splice(posicao, 1);
					

					//$('#myCalendar').fullCalendar( 'refetchEvents' );

					var calendar = $('myCalendar');
					calendar.fullCalendar('removeEvents', function(e) { 
						return e._id === 13;
					});

					//angular.element('#myCalendar').fullCalendar('refetchEvents');
				}

			});
		}
		//----
		function finalizaOrdser()
		{
			console.log('finalizaOrdser()');
			$scope.todasOrdser.forEach(function(objNovo3) {
				var retorno='';
				for (var propertyName in objNovo3.quadras) {
					$scope.todasQuadras.forEach(function(obj2) {
						if (objNovo3.quadras[propertyName].key_quadra === obj2.key) {
							retorno+=obj2.nome + ', ';
						}
					});
				}
				retorno=retorno.substring(0, retorno.length-2);
				var quadra = {};
				quadra['nome']=retorno;

				var objNovoAgendamento ={};

				objNovoAgendamento['ordser']=objNovo3;
				objNovoAgendamento['situacao']=objNovo3.situacao;
				objNovoAgendamento['tipo']= 'Ordem Serviço';
				objNovoAgendamento['quadra']= quadra;

				objNovoAgendamento.data = new Date(objNovo3.datpre);

				$scope.todosAgendamento.push(objNovoAgendamento);	

				$scope.gridOptions.data=$scope.todosAgendamento;

				var data_crua= objNovoAgendamento.data.toDateString();

				var color='#ffad33';
				if (objNovoAgendamento.situacao!='Finalizado' && new Date(data_crua) < new Date(new Date().toDateString())){
					color='#ff9999';
				}
				if (objNovoAgendamento.situacao=='Finalizado'){
					color='#39ac39';
				}

				$scope.events.push({backgroundColor: color,  stick: true, title: 'Ordem. \n' + objNovoAgendamento['ordser'].codigo, start: new Date(objNovoAgendamento.data.getFullYear(), objNovoAgendamento.data.getMonth(), objNovoAgendamento.data.getDate())}
					);

				$scope.eventSources = [$scope.events];
			});
		}
		//############################################################################################################################
		//############################################################################################################################
		
		function verificaFinalizacaoCarregamento()
		{
			console.log('verificaFinalizacaoCarregamento()');
			//console.log(' --------------------- ');

			//console.log('todasQuadras: ' + $scope.todasQuadras.length + ' - qde: ' + $scope.qtde_quadras);
			//console.log('todasOrdser: ' + $scope.todasOrdser.length + ' - qde: ' + $scope.qtde_ordser);		
			//console.log('todoUsuarios: ' + $scope.todosUsuarios.length + ' - qde: ' + $scope.qtde_usuario);

			//console.log(' --------------------- ');

			if($scope.todasQuadras.length >=$scope.qtde_quadras
				&& $scope.todasOrdser.length>=$scope.qtde_ordser
				&& $scope.todosUsuarios.length >= $scope.qtde_usuario
				)
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		//############################################################################################################################
		//############################################################################################################################
		//AGENDAMENTO
		//############################################################################################################################
		$scope.mostrarDetalhe = function(agendamento)
		{
			$('#modalDetalhe').modal('show');
			
			$scope.todosUsuarios.forEach(function(obj) {
				if (obj.key === $scope.data_agendamento.key_usuario) {
					$scope.data_agendamento['usuario']=obj;
				}

			});

			$('#myCalendar').fullCalendar('gotoDate', agendamento.data);

			$scope.save=false;
			$scope.edit=true;
		}

		$scope.novo = function()
		{
			$('#modalDetalhe').modal('show');
			$scope.edit=false;
			$scope.save=true;


			$scope.data_agendamento = {};
			$scope.data_agendamento['tipo'] = "Levantamento";
			$scope.data_agendamento.temUsuario=true;
		}

		$scope.salvarAgendamento = function(data_agendamento)
		{
			if( $scope.data.fazenda==null) return false;
			if(validFormAgendamento(data_agendamento)) return false;

			var quadra = data_agendamento.quadra;
			var usuario = data_agendamento.usuario;

			

			var refAgendamento = new Firebase(Constant.Url + '/agendamento/' + $scope.data.fazenda.key +'/' +$scope.data.safra.key);
			var objAgendamento={};
			objAgendamento['key']=refAgendamento.push().key();

			objAgendamento['key_safra']=$scope.data.safra.key;
			objAgendamento['key_filial']=$scope.data.fazenda.key;
			objAgendamento['key_quadra']=quadra.quadra.key;
			if(usuario!=null)
			{
				objAgendamento['key_usuario']=usuario.key;
			}
			
			objAgendamento['situacao']='Agendado';
			objAgendamento.data= new Date(data_agendamento.data).getTime(); 
			objAgendamento.data_string=new Date(data_agendamento.data).getDate()+'/'+new Date(data_agendamento.data).getMonth()+'/'+new Date(data_agendamento.data).getFullYear();

			var refAgendamentoNovo = new Firebase(Constant.Url + '/agendamento/' + $scope.data.fazenda.key+'/' + $scope.data.safra.key +"/"+objAgendamento['key']);

			refAgendamentoNovo.set(objAgendamento);			

			objAgendamento['quadra']=quadra.quadra;
			objAgendamento['usuario']=usuario;
			objAgendamento['tipo']='Levantamento';
			//$scope.todosAgendamento.push(objAgendamento);

			var color='#ffad33';			

			objAgendamento.data= new Date(objAgendamento.data);
			//$scope.events.push({backgroundColor: color, stick: true, title: 'Levant. \n' + objAgendamento.quadra.nome, start: new Date(objAgendamento.data.getFullYear(), objAgendamento.data.getMonth(), objAgendamento.data.getDate())}
			//	);

			$scope.eventSources = [$scope.events];

			$('#modalDetalhe').modal('hide');
		}
		
		$scope.editarAgendamento = function(data_agendamento)
		{
			if( $scope.data.fazenda==null) return false;
			if(validFormAgendamento(data_agendamento)) return false;

			var quadra = data_agendamento.quadra;
			var usuario = data_agendamento.usuario;
			var ordser = data_agendamento.ordser;

			//var refAgendamento = new Firebase(Constant.Url + '/agendamento/' + $scope.data.fazenda.key +'/' +$scope.data.safra.key);
			var objAgendamento={};
			objAgendamento['key']=data_agendamento.key;

			objAgendamento['key_safra']=$scope.data.safra.key;
			objAgendamento['key_filial']=$scope.data.fazenda.key;
			objAgendamento['key_quadra']=quadra.key;
			if(usuario!=null)
			{
				objAgendamento['key_usuario']=usuario.key;
			}
			if(ordser!=null)
			{
				objAgendamento['key_ordser']=ordser.key;
			}
			
			objAgendamento['situacao']='Agendado';
			objAgendamento.data= new Date(data_agendamento.data).getTime(); 
			objAgendamento.data_string=new Date(data_agendamento.data).getDate()+'/'+new Date(data_agendamento.data).getMonth()+'/'+new Date(data_agendamento.data).getFullYear();

			var refAgendamentoNovo = new Firebase(Constant.Url + '/agendamento/' + $scope.data.fazenda.key+'/' + $scope.data.safra.key +"/"+objAgendamento['key']);

			refAgendamentoNovo.set(objAgendamento);			

			objAgendamento['quadra']=quadra.quadra;
			objAgendamento['usuario']=usuario;
			objAgendamento['ordser']=ordser;
			objAgendamento['tipo']='Levantamento';
			//$scope.todosAgendamento.push(objAgendamento);

			var color='#ffad33';			

			objAgendamento.data= new Date(objAgendamento.data);
			//$scope.events.push({backgroundColor: color, stick: true, title: 'Levant. \n' + objAgendamento.quadra.nome, start: new Date(objAgendamento.data.getFullYear(), objAgendamento.data.getMonth(), objAgendamento.data.getDate())}
			//	);

			$scope.eventSources = [$scope.events];

			$('#modalDetalhe').modal('hide');
		}
		$scope.excluir = function(data_agendamento)
		{
			$('#modalDetalhe').modal('hide');
			$('#modalDelete').modal('show');
		}
		$scope.excluirAgendamento = function()
		{
			$('#modalDelete').modal('hide');
			if( $scope.data.fazenda==null) return false;
			if($scope.data_agendamento==null) return false;

			var refAgendamentoNovo = new Firebase(Constant.Url + '/agendamento/' + $scope.data.fazenda.key+'/' + $scope.data.safra.key +"/"+$scope.data_agendamento.key);

			refAgendamentoNovo.remove();			

			$('#modalDetalhe').modal('hide');
		}

		$scope.cancelar = function()
		{
			$('#modalDetalhe').modal('hide');
			$scope.edit=false;
			$scope.save=true;
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
					$scope.data.fazenda = item;		
				}
			});
			
		};

		function setMessageError(message){
			Notify.errorBottom(message);
		};

		//-------------------------------------------------------------------
		function validFormAgendamento(data) {

			if (data == null) {
				setMessageError('É preciso preencher os campos!');
				return true;
			}
			if (data.data == null) {
				setMessageError('O campo Data é obrigatório!');
				return true;
			}
			if (data.data === '') {
				setMessageError('O campo Data é obrigatório!');
				return true;
			}
			var data_crua= new Date(data.data).toDateString();
			if (new Date(data_crua) < new Date(new Date().toDateString())){
				setMessageError('O campo Data não pode ser menor que a data atual!');
				return true;
			}
			if (data.quadra == null) {
				setMessageError('O campo Quadra é obrigatório!');
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
				key:''
			});
			//$scope.data.fazenda=fazendaTmp;
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
			$scope.save = true;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
		};
		

		

	}

}());