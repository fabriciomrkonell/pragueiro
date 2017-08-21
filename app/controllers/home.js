//############################################################################################################################
//NECESSARIOS PRO MAPA FUNCIONAR, AQUI É BRUTO, SEM ANGULAR
var map = null;
var map_infestacao=null;
var heatmap=null;
var listHeat=[];

function initMap() {

	map_infestacao = new google.maps.Map(document.getElementById('map_infestacao'), {
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		mapTypeControl: false,
		zoomControl: true,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		rotateControl: false
	});

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		mapTypeControl: false,
		zoomControl: true,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		rotateControl: false
	});


};

//############################################################################################################################


(function(){

	'use strict'; 

	angular.module('Pragueiro.controllers').registerCtrl('homeCtrl', homeCtrl);

	homeCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray', '$firebaseObject', 'Notify', '$routeParams', '$geofire', 'NgMap', '$location', '$anchorScroll'];

	function homeCtrl($scope, Constant, Session, $firebaseArray, $firebaseObject, Notify, $routeParams,  $geofire, NgMap, $location, $anchorScroll) {


		angular.extend($scope, {
			quadras: [],
			culturas:[],
			vistorias:[],
			variedades:[],
			usuarios:[],
			pragasEncontradasGeral:[],
			pragasExibir:[],
			mensagem_aviso : '',
			exibirNomeQuadra : true,
			selecionarTodasQuadras : true

		});
		$scope.formMapa = {
			quadras: []
		};
		$scope.formMapa.intesidade = 20;


		if(checkLocalHistoryCompatibilidade())
		{
			if(window.localStorage.getItem('exibirSomentePragasEncontradas')=='S')
			{
				$scope.exibirSomenteEn=true;
			}
			else
			{
				$scope.exibirSomenteEn=false;
			}
			//---------------------
			if(window.localStorage.getItem('exibirNomeQuadra')=='S')
			{
				$scope.exibirNomeQuadra=true;
			}
			else
			{
				$scope.exibirNomeQuadra=false;
			}
			//---------------------
			if(window.localStorage.getItem('intensidadeHeatMap')!=null)
			{
				$scope.formMapa.intesidade=Number(window.localStorage.getItem('intensidadeHeatMap'));
			}
		}


		$scope.myNumber = 5;
		$scope.table_pronta=false;
		$scope.todascoordenadasCentroidMapaInfestacao=[];





		$scope.mCountTamanhos = 0;
		$scope.mCont = 0;

		atualizaListaFiliais();
		atualizaCulturas();
		atualizaUsuarios();
		atualizaTodasPragas();

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

	initMap(new google.maps.LatLng(-20, -55), 4 );


		//############################################################################################################################
		//############################################################################################################################
		// BASICOS, NECESSARIOS PARA OS OUTROS
		//############################################################################################################################


		function atualizaCulturas()
		{
			var refCultura = new Firebase(Constant.Url + '/cultura');
			refCultura.ref().on('child_added', function(snap) {
				$scope.culturas.push(snap.val());
			});
		}

		function atualizaVariedade(key_filial)
		{
			var refVariedades = new Firebase(Constant.Url + '/variedade/'+ key_filial);
			refVariedades.ref().on('child_added', function(snap) {
				$scope.variedades.push(snap.val());
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

		function atualizaTodasPragas()
		{
			$scope.todasPragas=[];
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
				$scope.todasPragas.push(praga);
				$scope.pragasExibir = $scope.todasPragas;
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

					var i=0;

					refNovo.on('child_added', function(snap) {

						$('#myPleaseWait').modal('hide');
						var obj= snap.val();
						$scope.fazendas.push(obj.filial);

						if(i==0)
						{
							$scope.chengeFazenda($scope.fazendas[0]);
							$scope.fazenda=$scope.fazendas[0];
						}

						if(!$scope.$$phase) {
							$scope.$apply();
						}
					});

					refNovo.on('child_changed', function(snap) {
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
						atualizaListaFiliais();
					});
					if($scope.fazendas.length==0)
					{
						$('#myPleaseWait').modal('hide');
					}
				});
		}		

		$scope.chengeSafra = function(){
			atualizaListaQuadras();
		};

		$scope.chengeFazenda = function(fazenda){
			$scope.ordsers=[];

			var refOrdser = new Firebase(Constant.Url + '/ordser/' + fazenda.key);

			refOrdser.on('child_added', function(snap) {
				$('#myPleaseWait').modal('hide');
				var objNovo = snap.val();
				var x = 0;
				var posicao = null;
				$scope.ordsers.forEach(function(obj) {
					if (obj.key === objNovo.key) {
						posicao = x;
					}
					x++;

				});
				if (posicao == null && objNovo.aplagr) {
					$scope.ordsers.push(objNovo);
				}
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});
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

		$scope.addPragasEncontradas = function(praga){
			var encontrou=false;
			$scope.pragasEncontradasGeral.forEach(function(item){
				if(item.key === praga.key) 	
				{
					encontrou=true;	
				}
			});
			if(!encontrou)
			{
				$scope.pragasEncontradasGeral.push(praga);
			}	
		};



		//############################################################################################################################
		//############################################################################################################################
		//LISTA VISTORIAS, SERVE PRO RESUMO E MAPA E OUTROS
		//############################################################################################################################

		function atualizaVistorias()
		{
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
				//----	
				refVis.ref().on('child_added', function(snap) 
				{
					var obj2= snap.val();
					var mListVariedades=[];
					for(var itemQuadraXsafra in $scope.quadras )
					{
						if($scope.quadras[itemQuadraXsafra].quadraxcultura.key==obj2.quadra.key)
						{
							obj2.quadra.ativo=$scope.quadras[itemQuadraXsafra].quadraxcultura.ativo;
							obj2.quadra['key_cultura']=$scope.quadras[itemQuadraXsafra].quadraxcultura.key_cultura;
							if($scope.quadras[itemQuadraXsafra].quadraxcultura.hasOwnProperty("separar_variedade")){

								if($scope.quadras[itemQuadraXsafra].quadraxcultura.separar_variedade==true)
								{
									for(var var_quadraxsafra in $scope.quadras[itemQuadraXsafra].quadraxcultura.variedades ){
										console.log("teste");
										mListVariedades.push(var_quadraxsafra);
									}
								}
							}
							break;
						}
					}

					if($scope.fazenda.mosdes==true || obj2.quadra.ativo==true)
					{
						//----
						if(mListVariedades.length>0)//SEPARA POR VARIEDADE, FAZ DESSE JEITO
						{
							for(var keyVar in mListVariedades) 
							{

								var obj=clone(obj2);
								for(var obj_variedades_cultura in $scope.variedades) 
								{
									var obj_varCul=$scope.variedades[obj_variedades_cultura];
									for(var obj_variedades in obj_varCul) 
									{
										{
											if(obj_varCul[obj_variedades].key == mListVariedades[keyVar])
											{ 
												obj.quadra.nome=obj.quadra.nome + ' - ' + obj_varCul[obj_variedades].nome;
												obj['variedade']=obj_varCul[obj_variedades];
												break;
											}
										};
									}
									break;
								}

								var count_usuarios=0;

						//--------USUARIO-----------------------------------
						var objeto_vistoria=obj.vistoria[mListVariedades[keyVar]];
						for(var propertyName in objeto_vistoria) 
						{
							count_usuarios++;

							var count_dias=0;
							var vistoria_dias=[];
							//-----------DIA---------------------------------------------------------
							for(var propertyName_Dia in objeto_vistoria[propertyName]) 
							{
								count_dias++;

								var vistoria_dia_praga=[];
								var count_ponto=0;
								var key_estagio;
								//-----------PONTO---------------------------------------------------------
								for(var propertyName_ponto in objeto_vistoria[propertyName][propertyName_Dia]) 
								{
									count_ponto++;

									var count_praga=0;

									for(var propertyName_vis in objeto_vistoria[propertyName][propertyName_Dia][propertyName_ponto]) 
									{
										count_praga++;

										vistoria_dia_praga.push(objeto_vistoria[propertyName][propertyName_Dia][propertyName_ponto][propertyName_vis]);
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
									for(var vis_det in vistoria_dia_praga )
									{
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
									//var objetoFinalDia = {ista:lista_agrupada};
									obj['dataExtenso']=dataExtenso;
									obj['dataMilis']=dataMilis;
									obj['metodo']=metodo;
									obj['metodo']=metodo;
									obj['qtde_planta']=qtde_planta;
									obj['lista_pragas_encontradas']=lista_agrupada;

									$scope.usuarios.forEach(function(objInterno)
									{
										if(objInterno.key === propertyName)
										{ 
											obj['usuario']=objInterno;
										}
									});

									$scope.quadras.forEach(function(objInterno)
									{
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
									$scope.todasPragas.forEach(function(objPraga)
									{
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
													if(valor_final>0)
													{
														$scope.addPragasEncontradas(pragaAtualizada);
													}
												}
											});
											if(!encontrou)
											{
												var newObjeto={valor:0, tamanho:pragaAtualizada.tamanho[objInterno_tamanho], praga: pragaAtualizada}
												pragas_com_valor.push(newObjeto);
											}
										};
									});
									$scope.myNumber=pragas_com_valor.length;
									obj['pragas_com_valor']=pragas_com_valor;
									obj['id']= new Date().getTime();
									obj['id']= new Date().getTime();

									$scope.ordsers.forEach(function(ordser) {
										for (var propertyName in ordser.execucoes) {
											var objExe=ordser.execucoes[propertyName];
											if(objExe.key_quadra==obj.quadra.key)
											{
												var dataExecucao=new Date(objExe.data);

												obj['datOrdser']= new Date(objExe.data);
												obj['datOrdserExtenso']= formatDate(dataExecucao);
												if($scope.fazenda.tipintapl!=null)//Se esta definido no cadastro da filial que tem um tipo
												{
													if($scope.fazenda.tipintapl=='Data atual')
													{
														obj['datOrdserIntervalo']=  $scope.diferencaData(dataExecucao, new Date());													
													}
													else
													{
														obj['datOrdserIntervalo']=  $scope.diferencaData(dataExecucao, new Date(dataMilis));
													}
												}
												else
												{
													obj['datOrdserIntervalo']=  $scope.diferencaData(dataExecucao, new Date(dataMilis));
												}
											}
										}
									});

									$scope.vistorias.push(clone(obj));

								}
							//FIM-----------DIA---------------------------------------------------------
							$scope.vistorias.sort(compareData);
							$scope.table_pronta=true;
							if(!$scope.$$phase) 
							{
								$scope.$apply();
							}
						}
						//-----FIM USUARIO-----------------------------------
					}
				}
					else //###########//NAOOOO SEPARA POR VARIEDADE
					{
						var obj=clone(obj2);
						var count_usuarios=0;

						//--------USUARIO-----------------------------------
						for(var propertyName in obj.vistoria) 
						{
							count_usuarios++;

							var count_dias=0;
							var vistoria_dias=[];
							//-----------DIA---------------------------------------------------------
							for(var propertyName_Dia in obj.vistoria[propertyName]) 
							{
								count_dias++;

								var vistoria_dia_praga=[];
								var count_ponto=0;
								var key_estagio;
								//-----------PONTO---------------------------------------------------------
								for(var propertyName_ponto in obj.vistoria[propertyName][propertyName_Dia]) 
								{
									count_ponto++;

									var count_praga=0;

									for(var propertyName_vis in obj.vistoria[propertyName][propertyName_Dia][propertyName_ponto]) 
									{
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
									var listPontos=[];
									var contadorVisdia=0;
									for(var vis_det in vistoria_dia_praga )
									{
										if(contadorVisdia==0)
										{
											var objPonto={};
											objPonto['ponto']=vistoria_dia_praga[vis_det].ponto;
											objPonto['latitude']=vistoria_dia_praga[vis_det].latitude;
											objPonto['longitude']=vistoria_dia_praga[vis_det].longitude;
											listPontos.push(objPonto);
										}
										else
										{
											var mTem = false;

											for(var x in listPontos )
											{
												if (listPontos[x].ponto == vistoria_dia_praga[vis_det].ponto) {
													mTem = true;
													break;
												}
											}
											if (!mTem) {
												var objPonto={};
												objPonto['ponto']=vistoria_dia_praga[vis_det].ponto;
												objPonto['latitude']=vistoria_dia_praga[vis_det].latitude;
												objPonto['longitude']=vistoria_dia_praga[vis_det].longitude;
												listPontos.push(objPonto);												
											}
										}
										contadorVisdia++;
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

									obj['dataExtenso']=dataExtenso;
									obj['dataMilis']=dataMilis;
									obj['metodo']=metodo;
									obj['metodo']=metodo;
									obj['qtde_planta']=qtde_planta;
									obj['lista_pragas_encontradas']=lista_agrupada;
									obj['listPontos']=listPontos;

									$scope.usuarios.forEach(function(objInterno)
									{
										if(objInterno.key === propertyName)
										{ 
											obj['usuario']=objInterno;
										}
									});

									$scope.quadras.forEach(function(objInterno)
									{
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
									$scope.todasPragas.forEach(function(objPraga)
									{
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
													if(valor_final>0)
													{
														$scope.addPragasEncontradas(pragaAtualizada);
													}
												}
											});
											if(!encontrou)
											{
												var newObjeto={valor:0, tamanho:pragaAtualizada.tamanho[objInterno_tamanho], praga: pragaAtualizada}
												pragas_com_valor.push(newObjeto);
											}
										};
									});
									$scope.myNumber=pragas_com_valor.length;
									obj['pragas_com_valor']=pragas_com_valor;
									obj['id']= new Date().getTime();
									obj['id']= new Date().getTime();
									
									$scope.ordsers.forEach(function(ordser) {
										for (var propertyName in ordser.execucoes) {
											var objExe=ordser.execucoes[propertyName];
											if(objExe.key_quadra==obj.quadra.key)
											{
												var dataExecucao=new Date(objExe.data);

												obj['datOrdser']= new Date(objExe.data);
												obj['datOrdserExtenso']= formatDate(dataExecucao);

												if($scope.fazenda.tipintapl!=null)//Se esta definido no cadastro da filial que tem um tipo
												{
													if($scope.fazenda.tipintapl=='Data atual')
													{
														obj['datOrdserIntervalo']=  $scope.diferencaData(dataExecucao, new Date());													
													}
													else
													{
														obj['datOrdserIntervalo']=  $scope.diferencaData(dataExecucao, new Date(dataMilis));
													}
												}
												else
												{
													obj['datOrdserIntervalo']=  $scope.diferencaData(dataExecucao, new Date(dataMilis));
												}
											}
										}
									});

									$scope.vistorias.push(clone(obj));


								}
							//FIM-----------DIA---------------------------------------------------------
							$scope.vistorias.sort(compareData);
							$scope.table_pronta=true;
							if(!$scope.$$phase) {
								$scope.$apply();
							}
						}
						//-----FIM USUARIO-----------------------------------
					}



				}
				if($scope.exibirSomenteEn)
				{
					$scope.pragasExibir=$scope.pragasEncontradasGeral;
				}
				else
				{
					$scope.pragasExibir=$scope.todasPragas;
				}



			});
			//----
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
		}

		//############################################################################################################################
		//############################################################################################################################
		//LISTA QUADRAS
		//############################################################################################################################

		function atualizaListaQuadras()
		{
			atualizaVariedade($scope.fazenda.key);
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
					//,baseRef.child("/coordenada")
					).select(
					{"key":"quadraxcul.$value","alias":"quadraxcultura"},
					{"key":"quadra.$value","alias":"quadra"}
					//,{"key":"coordenada.$value","alias":"listCoordenadas"}
					).ref();

					refNovo.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');
						//console.log('Adicionou filial', snap.name(), snap.val());

						var obj= snap.val();
						obj.cultura=$scope.getCulturaNome(obj.quadraxcultura.key_cultura)
						$scope.quadras.push(obj);
						$scope.formMapa.quadras.push(obj.quadra);
						//atualizaCoordenadasQuadra(obj.quadra.key)
						if($scope.quadras.length==1)
						{
							atualizaVistorias();
						}

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
					
			});// final do load1
		}

		//############################################################################################################################
		//############################################################################################################################
		//MAPAS
		//############################################################################################################################
		

		var contador_anterior=0;
		var contador_correto=0;

		$scope.pragaAnterior=function()
		{
			contador_anterior=0;
			$scope.pragasExibir.forEach(function(obj)
			{
				if(obj.key==$scope.formMapa.praga)
				{
					contador_correto=contador_anterior;
				}
				contador_anterior++;
			});
			if($scope.pragasExibir[contador_correto-1]!=null)
			{
				$scope.formMapa.praga=$scope.pragasExibir[contador_correto-1].key;
			}
			if($scope.formMapa.praga!=null)
			{
				$scope.gerarMapa();
			}
		}

		var proximo=false;

		$scope.pragaProxima=function()
		{
			$scope.pragasExibir.forEach(function(obj)
			{
				if(proximo)
				{
					$scope.formMapa.praga=obj.key;
					proximo=false;
					return true;
				}
				if(obj.key==$scope.formMapa.praga)
				{
					proximo=true;
				}
			});
			if($scope.formMapa.praga!=null)
			{
				$scope.gerarMapa();
			}
		}	

		$scope.resizeMapaInfestacao=function()
		{
			google.maps.event.trigger(map_infestacao, "resize");
			initMapInfestacao(new google.maps.LatLng(-20, -55), 4 );
		}

		$scope.gerarMapa=function()
		{
			

			if($scope.safra==null)
			{
				$scope.mensagem_aviso = "É preciso selecionar uma safra.";
				$('#modalMensagem').modal('show');
				return true;
			}
			if($scope.formMapa.praga==null)
			{
				$scope.mensagem_aviso = "É preciso selecionar uma praga.";
				$('#modalMensagem').modal('show');
				return true;
			}


			if(heatmap!=null)
			{
				heatmap.setMap(null);
			}

			google.maps.event.trigger(map_infestacao, "resize");

			initMapInfestacao();

			//---------------
			if($scope.formMapa.intesidade==null)
			{
				$scope.formMapa.intesidade=20;
			}
			else
			{
				if($scope.formMapa.intesidade<10)
				{
					$scope.formMapa.intesidade=10
				}
				if($scope.formMapa.intesidade>50)
				{
					$scope.formMapa.intesidade=50;
				}
			}

			if(checkLocalHistoryCompatibilidade())
			{
				window.localStorage.setItem('intensidadeHeatMap', $scope.formMapa.intesidade);
			}
			//---------------
			$scope.todascoordenadasCentroidMapaInfestacao=[];
			var temQuadra=false;
			$scope.quadras.forEach(function(obj)
			{
				$scope.formMapa.quadras.forEach(function(objSelecionado){
					if(objSelecionado.key==obj.quadra.key)
					{
						temQuadra=true;
						var refCoordenadas = new Firebase(Constant.Url + '/coordenada/'+ obj.quadra.key);
						refCoordenadas.on('value', function(snapshot) {
							if(snapshot.numChildren()>0 )
							{
								atualizaCoordenadasQuadraMapaInfestacao(obj.quadra.key, obj.quadra.nome, snapshot.numChildren());
							}
						});
					}
				});			
			});		
			if(!temQuadra)
			{
				$scope.mensagem_aviso = "É preciso selecionar pelo menos 1 quadra/região.";
				$('#modalMensagem').modal('show');
				return true;
			}
			else
			{
				//$scope.gotoAnchor('map_infestacao');
			}


			listHeat = [];
			$scope.vistorias.forEach(function(vistoria)
			{
				$scope.formMapa.quadras.forEach(function(objSelecionado){
					if(objSelecionado.key==vistoria.quadra.key)
					{
						if(vistoria.quadra.separar_variedade)
						{

						}
						else
						{
							for(var propertyName in vistoria.vistoria) 
							{
							//-----------DIA---------------------------------------------------------
							for(var propertyName_Dia in vistoria.vistoria[propertyName]) 
							{
								//-----------PONTO---------------------------------------------------------
								for(var propertyName_ponto in vistoria.vistoria[propertyName][propertyName_Dia]) 
								{
									for(var propertyName_levantamento in vistoria.vistoria[propertyName][propertyName_Dia][propertyName_ponto]) 
									{
										var vis_fina = vistoria.vistoria[propertyName][propertyName_Dia][propertyName_ponto][propertyName_levantamento];
										
										if($scope.formMapa.praga==vis_fina.key_praga)
										{
											if(vis_fina.latitude!=null && vis_fina.longitude!=null)
											{
												var passo=0;
												for (passo = 0; passo < vis_fina.valor; passo++) 
												{
													listHeat.push(new google.maps.LatLng(vis_fina.latitude, vis_fina.longitude)) ;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			});

			});

			heatmap = new google.maps.visualization.HeatmapLayer({
				data: listHeat,
				map: map_infestacao,
				radius: $scope.formMapa.intesidade
			});
		}

		function atualizaCoordenadasQuadra(vistoria, qdteRegistro)
		{
			var todascoordenadasQuadraEspecifica=[];
			var todascoordenadasCentroidQuadraEspecifica=[];

			var refCoordenadas = new Firebase(Constant.Url + '/coordenada/'+ vistoria.quadra.key);

			var i=0;
			refCoordenadas.on('child_added', function(snap) {
				i++;


				var coordenadas= snap.val();

				var novo=[];
				novo['latitude']=coordenadas.latitude;
				novo['longitude']=coordenadas.longitude;
				todascoordenadasQuadraEspecifica.push(new google.maps.LatLng(coordenadas.latitude, coordenadas.longitude));


				var novoCentroid=[];
				novoCentroid['x']=coordenadas.latitude;
				novoCentroid['y']=coordenadas.longitude;
				todascoordenadasCentroidQuadraEspecifica.push(novoCentroid);

				if(qdteRegistro==i)
				{
					$('#myPleaseWait').modal('hide');
					setaCoordenadasPontos(vistoria, todascoordenadasCentroidQuadraEspecifica, todascoordenadasQuadraEspecifica);

				}

			});

			var i=0;	
		}

		function atualizaCoordenadasQuadraMapaInfestacao(key_quadra, nome_quadra, qdteRegistro)
		{
			var todascoordenadasQuadraEspecifica=[];
			var todascoordenadasCentroidQuadraEspecifica=[];

			var refCoordenadas = new Firebase(Constant.Url + '/coordenada/'+ key_quadra);

			var i=0;
			refCoordenadas.on('child_added', function(snap) {
				i++;

				var coordenadas= snap.val();

				var novo=[];
				novo['latitude']=coordenadas.latitude;
				novo['longitude']=coordenadas.longitude;
				todascoordenadasQuadraEspecifica.push(new google.maps.LatLng(coordenadas.latitude, coordenadas.longitude));

				var novoCentroid=[];
				novoCentroid['x']=coordenadas.latitude;
				novoCentroid['y']=coordenadas.longitude;
				$scope.todascoordenadasCentroidMapaInfestacao.push(novoCentroid);
				todascoordenadasCentroidQuadraEspecifica.push(novoCentroid);

				if(qdteRegistro==i)
				{
					$('#myPleaseWait').modal('hide');
					console.log('terminou coordenadas, quadra '+ key_quadra);

					var infowindow = new google.maps.InfoWindow({
						content: nome_quadra
					});

					var region = new Region(todascoordenadasCentroidQuadraEspecifica);	

					if($scope.exibirNomeQuadra)
					{
						var marker = new google.maps.Marker({
							position: new google.maps.LatLng(region.centroid().x, region.centroid().y),
							map: map_infestacao,
							label: '',
							title: nome_quadra
						});
						marker.addListener('click', function() {
							infowindow.open(map_infestacao, marker);
						});
					}
					setaCoordenadasMapaInfestacao($scope.todascoordenadasCentroidMapaInfestacao, todascoordenadasQuadraEspecifica);

				}

			});

			var i=0;	
		}

		$scope.abrirMapa = function(vistoria) {
			$('#myPleaseWait').modal('show');

			var refCoordenadas = new Firebase(Constant.Url + '/coordenada/'+ vistoria.quadra.key);
			refCoordenadas.on('value', function(snapshot) {
				if(snapshot.numChildren()>0)
				{
					atualizaCoordenadasQuadra(vistoria,  snapshot.numChildren());
				}
				else
				{
					setaCoordenadasPontos(vistoria, null, null);
				}

			});
		}

		function setaCoordenadasMapaInfestacao(todascoordenadasCentroid, todascoordenadasQuadraEspecifica)
		{
			console.log('setaCoordenadasMapaInfestacao');

			if(todascoordenadasCentroid != null && todascoordenadasCentroid.length>0 && todascoordenadasQuadraEspecifica.length>0)
			{
				console.log('setaCoordenadasMapaInfestacao tem');

				setaCentroMapaInfestacao();

				var bermudaTriangle = new google.maps.Polygon({
					paths: todascoordenadasQuadraEspecifica,
					strokeColor: '#212121',
					strokeOpacity: 0.8,
					strokeWeight: 3,
					fillColor: '#50b300',
					fillOpacity: 0.01
				});
				bermudaTriangle.setMap(map_infestacao);
			}
			else
			{
				var todascoordenadasCentroidQuadraEspecifica=[];

				var region = new Region(todascoordenadasCentroidQuadraEspecifica);			
				$scope.centerMapa=new google.maps.LatLng(region.centroid().x, region.centroid().y);
			}

			if(!$scope.$$phase) 
			{
				$scope.$apply();
			}

			$('#myPleaseWait').modal('hide');
		}

		function setaCentroMapaInfestacao()
		{
			var region = new Region($scope.todascoordenadasCentroidMapaInfestacao);	
			map_infestacao.setCenter(new google.maps.LatLng(region.centroid().x, region.centroid().y))	;
			map_infestacao.setZoom(12);	
		}

		function setaCoordenadasPontos(vistoria, todascoordenadasCentroid, todascoordenadasQuadraEspecifica)
		{
			console.log('setaCoordenadas');

			if(todascoordenadasCentroid != null && todascoordenadasCentroid.length>0 && todascoordenadasQuadraEspecifica.length>0)
			{
				console.log('setaCoordenadas tem');
				var region = new Region(todascoordenadasCentroid);			
				$scope.centerMapa=new google.maps.LatLng(region.centroid().x, region.centroid().y);
				initMap(new google.maps.LatLng(region.centroid().x, region.centroid().y), 14);
				$('#modalMapa').modal('show');


				var bermudaTriangle = new google.maps.Polygon({
					paths: todascoordenadasQuadraEspecifica,
					strokeColor: '#212121',
					strokeOpacity: 0.8,
					strokeWeight: 3,
					fillColor: '#50b300',
					fillOpacity: 0.90
				});
				bermudaTriangle.setMap(map);
			}
			else
			{
				var todascoordenadasCentroidQuadraEspecifica=[];
				for(var x in vistoria.listPontos )
				{
					var novoCentroid=[];
					novoCentroid['x']=vistoria.listPontos[x].latitude;
					novoCentroid['y']=vistoria.listPontos[x].longitude;
					todascoordenadasCentroidQuadraEspecifica.push(novoCentroid);				
				}

				var region = new Region(todascoordenadasCentroidQuadraEspecifica);			
				$scope.centerMapa=new google.maps.LatLng(region.centroid().x, region.centroid().y);
				initMap(new google.maps.LatLng(region.centroid().x, region.centroid().y), 14);		
				$('#modalMapa').modal('show');
			}

			for(var x in vistoria.listPontos )
			{
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(vistoria.listPontos[x].latitude, vistoria.listPontos[x].longitude),
					map: map,
					label: ''+vistoria.listPontos[x].ponto
				});
			}

			if(!$scope.$$phase) 
			{
				$scope.$apply();
			}

			$('#myPleaseWait').modal('hide');
		}

		$scope.efetuaSelecionarTodasQuadras = function()
		{
			$scope.selecionarTodasQuadras=true;
			$scope.quadras.forEach(function(obj){
				$scope.formMapa.quadras.push(obj.quadra);
			});		
		}

		$scope.DesEfetuaSelecionarTodasQuadras= function()
		{
			$scope.selecionarTodasQuadras=false;
			$scope.formMapa.quadras=[];
		}

		$scope.clickQuadras = function()
		{
			$scope.selecionarTodasQuadras=false;;
		}

		$scope.setaExibirSomenteEncontradas = function()
		{
			if($scope.exibirSomenteEn)
			{
				if(checkLocalHistoryCompatibilidade())
				{
					window.localStorage.setItem('exibirSomentePragasEncontradas', 'S');
				}
				$scope.pragasExibir=$scope.pragasEncontradasGeral;
			}
			else
			{
				if(checkLocalHistoryCompatibilidade())
				{
					window.localStorage.setItem('exibirSomentePragasEncontradas', 'N');
				}
				$scope.pragasExibir=$scope.todasPragas;
			}
		}


		$scope.setaExibirNomeQuadras = function()
		{
			if($scope.exibirNomeQuadra)
			{
				if(checkLocalHistoryCompatibilidade())
				{
					window.localStorage.setItem('exibirNomeQuadra', 'S');
				}
			}
			else
			{
				if(checkLocalHistoryCompatibilidade())
				{
					window.localStorage.setItem('exibirNomeQuadra', 'N');
				}
			}
			$scope.gerarMapa();
		}
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

		$scope.getQuadraNome = function(quadraId){
			var retorno = '';
			$scope.quadras.forEach(function(item){
				if(item.$id === quadraId) retorno = item.nome;
			});
			return retorno;
		};


		//############################################################################################################################
		//############################################################################################################################
		//UTILIZADES
		//############################################################################################################################
		$scope.gotoAnchor = function(x) {
			var newHash = x;
			if ($location.hash() !== newHash) {
          // set the $location.hash to `newHash` and
          // $anchorScroll will automatically scroll to it
          $location.hash(x);
      } else {
          // call $anchorScroll() explicitly,
          // since $location.hash hasn't changed
          $anchorScroll();
      }
  };


  function formatDate(date) {
  	var d = new Date(date),
  	month = '' + (d.getMonth() + 1),
  	day = '' + d.getDate(),
  	year = d.getFullYear();

  	if (month.length < 2) month = '0' + month;
  	if (day.length < 2) day = '0' + day;

  	return [day, month, year].join('/');
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

  $scope.diferencaData = function(a,b)
  {

  	var date1 = new Date(a);
  	var date2 = new Date(b);
  	var timeDiff = Math.abs(date2.getTime() - date1.getTime());
  	var  resultado= Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
  	if(resultado<0 || isNaN(resultado))
  	{
  		return 0;
  	}
  	else
  	{
  		return resultado -1
  	}
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



		//UTILIZADES MAPA
		//############################################################################################################################
		
		$('#modalMapa').on('shown.bs.modal', function () {
			google.maps.event.trigger(map, "resize");
			map.setCenter($scope.centerMapa);
		});

		function initMap(center, zoom){

			var mapOptions = {
				zoom: zoom,
				center: center,
				mapTypeId: google.maps.MapTypeId.HYBRID
			}

			var mapOptions2 = {
				zoom: zoom,
				center: center,
				mapTypeId: 'terrain'
			}

			map = new google.maps.Map(document.getElementById('map'), mapOptions);

			map_infestacao = new google.maps.Map(document.getElementById('map_infestacao'), mapOptions2);
		};

		function initMapInfestacao(center, zoom){

			var mapOptions = {
				center: center,
				mapTypeId: 'terrain'
			}


			map_infestacao = new google.maps.Map(document.getElementById('map_infestacao'), mapOptions);
		};



		function Point(x, y) {
			this.x = x;
			this.y = y;
		}

		function Region(points) {
			this.points = points || [];
			this.length = points.length;
		}

		Region.prototype.area = function () {
			var area = 0,
			i,
			j,
			point1,
			point2;

			for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
				point1 = this.points[i];
				point2 = this.points[j];
				area += point1.x * point2.y;
				area -= point1.y * point2.x;
			}
			area /= 2;

			return area;
		};

		Region.prototype.centroid = function () {
			var x = 0,
			y = 0,
			i,
			j,
			f,
			point1,
			point2;

			for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
				point1 = this.points[i];
				point2 = this.points[j];
				f = point1.x * point2.y - point2.x * point1.y;
				x += (point1.x + point2.x) * f;
				y += (point1.y + point2.y) * f;
			}

			f = this.area() * 6;

			return new Point(x / f, y / f);
		};

		initMap(new google.maps.LatLng(-20, -55), 4 );


	}



}());