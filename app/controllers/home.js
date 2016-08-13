(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('homeCtrl', homeCtrl);

	homeCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray', '$firebaseObject', 'Notify', '$routeParams'];

	function homeCtrl($scope, Constant, Session, $firebaseArray, $firebaseObject, Notify, $routeParams) {


		angular.extend($scope, {
			teste2 : '',
			edit: false,
			quadras: [],
			culturas:[],
			vistorias:[],
			usuarios:[],
			pragas:[]
		});

		$scope.myNumber = 5;
		$scope.table_pronta=false;

		$scope.mCountTamanhos = 0;
		$scope.mCont = 0;
		$scope.teste2="<table class='table'>	<thead>	<tr><th ng-repeat='v in vistorias'>{{v.quadra.nome}}</th> </tr>	</thead> <tr><th ng-repeat='v in vistorias'>{{v.cultura.nome}}</th> </tr> 	<tr> 	<th ng-repeat='v in vistorias'>{{v.dataExtenso}}</th>			</tr> </table>";

		atualizaListaFiliais();
		atualizaCulturas();
		atualizaUsuarios();
		atualizaPragas2();
		//atualizaListaQuadras();
		var chart1 = {};
		chart1.type = "ColumnChart";
		chart1.data = [
		['Component', 'cost'],
		['Software and hardware', 50000],
		['Hardware', 80000]
		];
		chart1.data.push(['Services',20000]);
		chart1.options = {chartArea:{height:'200',width:'100%'},
		legend:{ position: 'none'},
		'width':400,
		'height':225,
		vAxis: {
			gridlines: {
				color: 'transparent'
			}
		}
	};
	chart1.formatters = {
		number : [{
			columnNum: 1,
			pattern: "$ #,##0.00"
		}]
	};

	$scope.chart = chart1;

	$scope.aa=1*$scope.chart.data[1][1];
	$scope.bb=1*$scope.chart.data[2][1];
	$scope.cc=1*$scope.chart.data[3][1];

	$scope.getNumber2 = function(id_vistoria, id_praga) {
		$scope.vistorias[id_vistoria].pragas_com_valor[id_praga].valor;
		return 0;	
	}


	$scope.teste = function(){
		console.log('Adicionou filial', $scope);
	};

	function atualizaCulturas()
	{
		var refCultura = new Firebase(Constant.Url + '/cultura');
		refCultura.ref().on('child_added', function(snap) {
			$scope.culturas.push(snap.val());
		});
	}

	function atualizaUsuarios()
	{
		var refUsuarios= new Firebase(Constant.Url + '/usuario');
		refUsuarios.ref().on('child_added', function(snap) {
			$scope.usuarios.push(snap.val());
		});
	}

	function atualizaPragas()
	{
		var refPraga= new Firebase(Constant.Url + '/praga');
		refPraga.ref().on('child_added', function(snap) {

			var praga=snap.val();
			var count_tamanho=0;
			var tamanhos=[];
			var primeiro_tamanho;
			for(var obj in praga.tamanho ){
				if(count_tamanho==0)
				{
					primeiro_tamanho=praga.tamanho[obj];
				}
				else
				{
					tamanhos.push(praga.tamanho[obj]);
				}
				count_tamanho++;

			}
			if(tamanhos.length==0)
			{
				praga['colspan']=2;			
				praga['class']='text-right';			
			}
			else
			{
				praga['colspan']=1;
				praga['class']='text-center';	
			}
			praga['primeiro_tamanho']=primeiro_tamanho;
			praga['tamanhos']=tamanhos;
			$scope.pragas.push(praga);
		});
	}

	function atualizaPragas2()
	{
		$scope.pragas2=[];
		var refPraga= new Firebase(Constant.Url + '/praga');
		refPraga.ref().on('child_added', function(snap) {

			var praga=snap.val();
			var count_tamanho=0;
			var tamanhos=[];
			var primeiro_tamanho;
			for(var obj in praga.tamanho ){
				var tam=praga.tamanho[obj];
				tam['id']=$scope.mCountTamanhos;
				tamanhos.push(tam);

				count_tamanho++;
				$scope.mCountTamanhos++;
			}
			if(tamanhos.length==1)
			{
				praga['colspan']=2;			
				praga['class']='text-right';			
			}
			else
			{
				praga['colspan']=1;
				praga['class']='text-center';	
			}
			praga['primeiro_tamanho']=primeiro_tamanho;
			praga['tamanhos']=tamanhos;
			$scope.pragas2.push(praga);
		});
	}

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
					{"key":"$key.$value","alias":"usuario"},
					{"key":"filial.$value","alias":"filial"}
					).ref();

					refNovo.on('child_added', function(snap) {

						$('#myPleaseWait').modal('hide');
						//console.log('Adicionou filial', snap.name(), snap.val());
						var obj= snap.val();
						$scope.fazendas.push(obj.filial);

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

			});// final do load
		}
		

		$scope.chengeSafra = function(){
			atualizaListaQuadras();
		};

		$scope.setaFazenda = function(fazenda){
			if(fazenda === null) return false;

			$scope.fazendas.forEach(function(item){
				if(item.key === fazenda.key) 	
				{
					$scope.data.fazenda = item;		
				}
			});
			
		};

		//############################################################################################################################
		//############################################################################################################################
		//############################################################################################################################

		function atualizaListaQuadras()
		{
			$('#myPleaseWait').modal('show');
			var refUser = new Firebase(Constant.Url + '/usuarioxauth/'+Session.getUser().uid);		
			var obj = $firebaseObject(refUser);
			var key_usuario;
			obj.$loaded().then(function() {
				key_usuario= obj.$value;
				
				$scope.quadras=[];
				var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
				var refNovo = new Firebase.util.NormalizedCollection(
					[baseRef.child("/filial/"+$scope.fazenda.key+"/safra/"+$scope.safra.key+"/quadra"), "quadraxcul"],
					baseRef.child("/quadra")
					).select(
					{"key":"quadraxcul.$value","alias":"quadraxcultura"},
					{"key":"quadra.$value","alias":"quadra"}
					).ref();

					refNovo.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');
						//console.log('Adicionou filial', snap.name(), snap.val());
						if($scope.quadras.length==0)
						{
							atualizaVistorias();
						}
						var obj= snap.val();
						obj.cultura=$scope.getCulturaNome(obj.quadraxcultura.key_cultura)
						$scope.quadras.push(obj);

					});

					refNovo.on('child_changed', function(snap) {
						//console.log('Houve uma atualização', snap.name(), snap.val());
						var objNovo= snap.val();

						var x=0;
						var posicao=null;
						$scope.quadras.forEach(function(obj){
							if(obj.key === objNovo.quadra.key)
							{ 
								posicao=x;
							}
							x++;

						});
						if(posicao!=null)
							$scope.quadras[posicao]=objNovo.quadra;

					});

					refNovo.on('child_removed', function(snap) {
						//console.log('Houve uma remoção', snap.name(), snap.val());
						atualizaListaFiliais();
					});

			});// final do load
		}

		function atualizaVistorias()
		{
			//var refVistorias = new Firebase(Constant.Url+ '/vistoria/-KI8UKttKU2i_nwcF-nw/');
			//var refVis=refVistorias.ref();
			var count_geral_id=0;
			$scope.vistorias=[];
			$scope.pragas_com_valor=[];
			var baseRef = new Firebase("https://pragueiroproducao.firebaseio.com");
			var refVis = new Firebase.util.NormalizedCollection(
				[baseRef.child("/vistoria/"+$scope.fazenda.key+"/"+$scope.safra.key), "$key"],
				baseRef.child("/quadra")
				).select(
				{"key":"$key.$value","alias":"vistoria"},
				{"key":"quadra.$value","alias":"quadra"}
				).ref();
				refVis.ref().on('child_added', function(snap) {
						//console.log('Adicionou filial', snap.name(), snap.val());
						
						var obj2= snap.val();
						if($scope.fazenda.mosdes==true || obj2.quadra.ativo==true)
						{
							var obj=clone(obj2);
							var count_usuarios=0;
							for(var propertyName in obj.vistoria) {
								count_usuarios++;
							//console.log('Adicionou filial', obj.vistoria[propertyName]);

							var count_dias=0;
							var vistoria_dias=[];
							//-----------DIA---------------------------------------------------------
							for(var propertyName_Dia in obj.vistoria[propertyName]) {
								count_dias++;

								var vistoria_dia_praga=[];
								var count_ponto=0;
								var key_estagio;
								//-----------PONTO---------------------------------------------------------
								for(var propertyName_ponto in obj.vistoria[propertyName][propertyName_Dia]) {
									count_ponto++;

									var count_praga=0;


									for(var propertyName_vis in obj.vistoria[propertyName][propertyName_Dia][propertyName_ponto]) {
										count_praga++;

										vistoria_dia_praga.push(obj.vistoria[propertyName][propertyName_Dia][propertyName_ponto][propertyName_vis]);
									}


									obj.qtde_praga=count_praga;
								}
								obj.qtde_ponto=count_ponto;
									//FIM-----------PONTO---------------------------------------------------------
									vistoria_dia_praga.sort(compare);
									var key_praga_old="";
									var key_tamanho_old="";
									var lista_agrupada=[];
									var dataExtenso="";
									var metodo="";									
									var dataMilis=0;
									var qtde_planta=0;
									//-----------PERCORRE DIA---------------------------------------------------------
									for(var vis_det in vistoria_dia_praga ){
										dataExtenso=vistoria_dia_praga[vis_det].dataString;
										dataMilis=vistoria_dia_praga[vis_det].data;
										metodo=vistoria_dia_praga[vis_det].tipo == 'PLA' ? 'Planta' : '%';
										qtde_planta=vistoria_dia_praga[vis_det].quapla ;
										key_estagio=vistoria_dia_praga[vis_det].key_estagio;
										if(key_praga_old==vistoria_dia_praga[vis_det].key_praga)
										{
											if(key_tamanho_old==vistoria_dia_praga[vis_det].key_tamanho)
											{
												lista_agrupada[lista_agrupada.length-1].valor=lista_agrupada[lista_agrupada.length-1].valor+vistoria_dia_praga[vis_det].valor;
												lista_agrupada[lista_agrupada.length-1]['qtde_ponto']=count_ponto;
											}
											else
											{
												vistoria_dia_praga[vis_det]['qtde_ponto']=count_ponto;
												lista_agrupada.push(vistoria_dia_praga[vis_det]);
											}

										}
										else
										{
											vistoria_dia_praga[vis_det]['qtde_ponto']=count_ponto;
											lista_agrupada.push(vistoria_dia_praga[vis_det]);
										}
										key_praga_old=vistoria_dia_praga[vis_det].key_praga;
										key_tamanho_old=vistoria_dia_praga[vis_det].key_tamanho;

									}
									//FIM PERCORRE DIA---------------------------------------------------------
									var objetoFinalDia = {ista:lista_agrupada};
									obj['dataExtenso']=dataExtenso;
									obj['dataMilis']=dataMilis;
									obj['metodo']=metodo;
									obj['metodo']=metodo;
									obj['qtde_planta']=qtde_planta;
									obj['lista_pragas_encontradas']=lista_agrupada;




									$scope.usuarios.forEach(function(objInterno){
										if(objInterno.key === propertyName)
										{ 
											obj['usuario']=objInterno;
										}
									});

									$scope.quadras.forEach(function(objInterno){
										if(objInterno.quadraxcultura.key === obj.quadra.key)
										{ 
											obj['quadraxcultura']=objInterno.quadraxcultura;
											$scope.culturas.forEach(function(objInterno2){
												if(objInterno2.key+'' === objInterno.quadraxcultura.key_cultura)
												{ 
													obj['cultura']=objInterno2;

													for(var objInterno_est in objInterno2.estagios ){
														if(objInterno_est==key_estagio)
															obj['estagio']=objInterno2.estagios[objInterno_est];
													}
												}
											});
										}
									});


									obj.qtde_dia=count_dias;
									var pragas_com_valor=[];
									$scope.pragas2.forEach(function(objPraga){
										var pragaAtualizada=clone(objPraga);
										var count_tamanho=0;
										for(var objInterno_tamanho in pragaAtualizada.tamanho ){
											count_tamanho++;
											var encontrou=false;
											lista_agrupada.forEach(function(objInterno_lista){
												if(objInterno_lista.key_praga==pragaAtualizada.key && (objInterno_lista.key_tamanho=='' ? 'a' : objInterno_lista.key_tamanho)==pragaAtualizada.tamanho[objInterno_tamanho].key)
												{
													encontrou=true;
													var valor_final;
													if(objInterno_lista.tipo=='PLA')
													{
														valor_final=(objInterno_lista.valor*100) / (objInterno_lista.quapla * objInterno_lista.qtde_ponto);
													}
													else
													{
														valor_final=objInterno_lista.valor/ objInterno_lista.qtde_ponto;
													}
													var newObjeto={valor:valor_final.toFixed(3), tamanho:pragaAtualizada.tamanho[objInterno_tamanho], praga: pragaAtualizada}
													pragas_com_valor.push(newObjeto);
												}
											});
											if(!encontrou)
											{
												var newObjeto={valor:0, tamanho:pragaAtualizada.tamanho[objInterno_tamanho], praga: pragaAtualizada}
												pragas_com_valor.push(newObjeto);
											}
										};
									//pragaAtualizada['qtde_tamanhos']=count_tamanho;
									//pragas_com_valor.push(pragaAtualizada);
								});
									$scope.myNumber=pragas_com_valor.length;
									obj['pragas_com_valor']=pragas_com_valor;
									obj['id']= new Date().getTime();
									obj['id']= new Date().getTime();
									
									$scope.vistorias.push(clone(obj));

								}
							}


							
							//FIM-----------DIA---------------------------------------------------------
							$scope.vistorias.sort(compareData);
							$scope.table_pronta=true;
							if(!$scope.$$phase) {
								$scope.$apply();
							}
						}
					});

refVis.on('child_changed', function(snap) {
	console.log('Houve uma atualização', snap.name(), snap.val());
	var objNovo= snap.val();

	var x=0;
	var posicao=null;
	$scope.vistorias.forEach(function(obj){
		if(obj.$id === objNovo.$id)
		{ 
			posicao=x;
		}
		x++;

	});
	if(posicao!=null)
		$scope.vistorias[posicao]=objNovo;

});

refVis.on('child_removed', function(snap) {
						//console.log('Houve uma remoção', snap.name(), snap.val());
						//atualizaListaFiliais();
					});
}

function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}

function compare(a,b) {
	if (a.nome_praga < b.nome_praga)
		return -1;
	if (a.nome_praga > b.nome_praga)
		return 1;

	if (a.key_tamanho < b.key_tamanho)
		return -1;
	if (a.key_tamanho > b.key_tamanho)
		return 1;
	return 0;
}

function compareData(a,b) {
	if (a.dataMilis > b.dataMilis)
		return -1;
	if (a.dataMilis < b.dataMilis)
		return 1;

	return 0;
}

$(document).on('click', '.panel-heading span.clickable', function(e){
	var $this = $(this);
	if(!$this.hasClass('panel-collapsed')) {
		$this.parents('.panel').find('.panel-body').slideUp();
		$this.addClass('panel-collapsed');
		$this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
	} else {
		$this.parents('.panel').find('.panel-body').slideDown();
		$this.removeClass('panel-collapsed');
		$this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
	}
})

		//############################################################################################################################
		//############################################################################################################################
		//RECUPERA NOME QUADRA/CULTURA
		//############################################################################################################################
		$scope.getCulturaNome = function(culturaId){
			var retorno = '';
			$scope.culturas.forEach(function(item){
				if(item.key === culturaId) retorno = item.nome;
			});
			return retorno;
		};

		$scope.diferencaData = function(a,b)
		{
			var resultado=Math.round((new Date(a)-new Date(b))/(1000*60*60*24));
			if(resultado<0 || isNaN(resultado))
				return 0;
			else
				resultado;
		}

		$scope.getQuadraNome = function(quadraId){
			var retorno = '';
			$scope.quadras.forEach(function(item){
				if(item.$id === quadraId) retorno = item.nome;
			});
			return retorno;
		};
	}



}());