(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('agendamentoCtrl', agendamentoCtrl);

	agendamentoCtrl.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'Session', 'Constant', 'Notify'];

	function agendamentoCtrl($scope, $firebaseArray, $firebaseObject, Session, Constant, Notify,  $compile, $timeout, uiCalendarConfig) {

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


		var ref = new Firebase(Constant.Url + '/equipe');
		$scope.todasEquipes = $firebaseArray(ref);
		//var refFazendas = new Firebase(Constant.Url + '/filial');
		atualizaListaFiliais();



//------------------------------------
var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();

$scope.changeTo = 'Portugues';
/* event source that pulls from google.com */

/* event source that contains custom events on the scope */
$scope.events = [
{title: 'Dia 5', start: new Date(2017, 8, 5)},
{title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
{id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
{id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
{title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
{title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
];


$scope.calEventsExt = {
	color: '#f00',
	textColor: 'yellow',
	events: [ 
	{type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
	{type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
	{type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29)}
	]
};
/* alert on eventClick */
$scope.alertOnEventClick = function( date, jsEvent, view){
	$scope.alertMessage = (date.title + ' was clicked ');
};
/* alert on Drop */
$scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
	$scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
};
/* alert on Resize */
$scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
	$scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
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
	if(uiCalendarConfig.calendars[calendar]){
		uiCalendarConfig.calendars[calendar].fullCalendar('render');
	}
};
/* Render Tooltip */
$scope.eventRender = function( event, element, view ) { 
	element.attr({'tooltip': event.title,
		'tooltip-append-to-body': true});
        	//$compile(element)($scope);
        };
        /* config object */
        $scope.uiConfig = {
        	calendar:{
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
        	}
        };

        $scope.changeLang = function() {
        	if($scope.changeTo === 'Hungarian'){
        		$scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
        		$scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
        		$scope.changeTo= 'English';
        	}
        	else
        	{
        		if($scope.changeTo === 'Portugues'){
        			$scope.uiConfig.calendar.monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        			$scope.uiConfig.calendar.dayNames = ["Domingo", "Segunda", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        			$scope.uiConfig.calendar.dayNamesShort = ["Dom", "Qua", "Ter", "Qua", "Qui", "Sex", "Sab"];
        			$scope.changeTo= 'Portugues';
        		}
        		else {
        			$scope.uiConfig.calendar.dayNames = ["Domingo", "Segunda", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        			$scope.uiConfig.calendar.dayNamesShort = ["Dom", "Qua", "Ter", "Qua", "Qui", "Sex", "Sab"];
        			$scope.changeTo = 'Hungarian';
        		}
        	}
        };
        /* event sources array*/
        $scope.eventSources = [$scope.events];
        $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];

        $scope.changeTo = 'Portugues';
        $scope.changeLang();
		//----------------------------------------

		$scope.gridOptions = { 
			enableRowSelection: true, 
			enableRowHeaderSelection: false,

			enableColumnResizing: true,

			multiSelect : false,
			modifierKeysToMultiSelect : false,

			columnDefs : [
			{ field: "codigo", displayName: "Código", width: 80 },
			{ field: "nome", displayName: "Nome", width: 240 },
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

		$scope.chengeFazenda = function(fazenda)
		{
			if(fazenda === null) 
			{
				$scope.equipes =null;
			}
			else
			{			
				//$('#myPleaseWait').modal('show');	

				$scope.equipes=[];
				$scope.gridOptions.data=$scope.equipes;

				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovoQuadra = new Firebase.util.NormalizedCollection(
					baseRef.child("/filial/"+fazenda.key+"/equipe"),
					[baseRef.child("/equipe"), "$key"]
					).select(
					{"key":"equipe.$value","alias":"filial"},
					{"key":"$key.$value","alias":"equipes"}
					).ref();

					
					
					refNovoQuadra.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();

						var x=0;
						var posicao=null;
						$scope.equipes.forEach(function(obj){
							if(obj!=null && objNovo['equipes']!=null)
							{
								if(obj.key === objNovo['equipes'].key)
								{ 
									posicao=x;
								}
							}
							x++;

						});

						if(posicao==null)
							$scope.equipes.push(objNovo['equipes']);

						if(!$scope.$$phase) {
							$scope.$apply();
						}
						$scope.gridOptions.data=$scope.equipes;
					});

					

					refNovoQuadra.on('child_changed', function(snap) {
						$('#myPleaseWait').modal('hide');
						var objNovo= snap.val();
						var x=0;
						var posicao=null;
						$scope.equipes.forEach(function(obj){
							if(obj!=null && objNovo['equipes']!=null)
							{
								if(obj.key === objNovo['equipes'].key)
								{ 
									posicao=x;
								}
							}
							x++;

						});
						if(posicao!=null)
							$scope.equipes[posicao]=objNovo['equipes'];

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

		

		$scope.getDadosEquipe = function(obj, nomeColuna){
			var retorno = '';
			if(nomeColuna=='nome')
			{
				$scope.todasEquipes.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['nome'];
				});
			}
			if(nomeColuna=='codigo')
			{
				$scope.todasEquipes.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['codigo'];
				});
			}
			if(nomeColuna=='ativo')
			{
				$scope.todasEquipes.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['ativo'];
				});
			}
			if(nomeColuna=='coordenadas')
			{
				$scope.todasEquipes.forEach(function(item){
					if(item.$id === obj.$id) retorno = item['coordenadas'];
				});
			}
			return retorno;
		};

		$scope.salvarEquipe = function(data){
			if(validForm(data)) return false;

			var fazendaTmp=data.fazenda;
			delete data.fazenda;
			delete data.$$hashKey;	
			data['filial']=[];
			data['filial'][fazendaTmp.key]=true;
			var refEquipe = new Firebase(Constant.Url + '/equipe/');
			var key=refEquipe.push().key();
			var refEquipeNovo = new Firebase(Constant.Url + '/equipe/'+key);
			data.key=key;
			refEquipeNovo.set(data);
			var refEquipeNovo = new Firebase(Constant.Url + '/filial/'+fazendaTmp.key + '/equipe/'+key);
			refEquipeNovo.set(true);
			$scope.chengeFazenda(fazendaTmp);
			$scope.clear();			
			Notify.successBottom('Equipe inserida com sucesso!');
			$scope.setaFazenda(fazendaTmp);	

		};

		$scope.editarEquipe = function(data){
			if(validForm(data)) return false;
			var fazendaTmp=data.fazenda;
			delete data.fazenda;
			delete data.$$hashKey;		
			var refEquipe = new Firebase(Constant.Url + '/equipe/'+data.key);
			refEquipe.set(data);
			data.fazenda=fazendaTmp;				
			data.fazenda=fazendaTmp;
			$scope.clear();

			Notify.successBottom('Equipe atualizada com sucesso!');
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

			$scope.desabilitaFazenda=true;		

		};
		$scope.excluir = function(){
			$('#modalDelete').modal('show');
		};

		$scope.excluirEquipe = function(objeto){
			$('#modalDelete').modal('hide');
			if(objeto!=null && $scope.data.fazenda!=null)
			{
				var fazendaTmp=$scope.data.fazenda;
				if(objeto.qtd!=null)
				{
					if(objeto.qtd>0)
					{
						setMessageError('Já foi associado em equipe. Impossível continuar.');
						return true;
					}
				}			

				var refEquipeNovo = new Firebase(Constant.Url + '/equipe/'+objeto.key);
				refEquipeNovo.remove();
				var refEquipeNovo = new Firebase(Constant.Url + '/filial/'+ $scope.data.fazenda.key + '/equipe/'+objeto.key);
				refEquipeNovo.remove();						
				Notify.successBottom('Equipe removida com sucesso!');
				$scope.chengeFazenda(fazendaTmp);
				$scope.cancelar();

			}
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
				key:''
			});
			//$scope.data.fazenda=fazendaTmp;
			$scope.desabilitaFazenda=false;
			$scope.edit=false;
			$scope.save = true;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			//$scope.chengeFazenda($scope.fazenda);
			//$scope.data.fazenda=fazendaTmp;
		};
		

		//$scope.clear();

	}

}());