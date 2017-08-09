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
			variedades:[],
			usuarios:[],
			pragasEncontradasGeral:[],
			pragasExibir:[]

		});

/*
		shapefile.open("https://cdn.rawgit.com/mbostock/shapefile/master/test/points.shp")
		.then(source => source.read()
			.then(function log(result) {
				if (result.done) return;
				console.log(result.value);
				return source.read().then(log);
			}))
		.catch(error => console.error(error.stack));
		*/
		$scope.myNumber = 5;
		$scope.table_pronta=false;

		$scope.mCountTamanhos = 0;
		$scope.mCont = 0;
		$scope.teste2="<table class='table'>	<thead>	<tr><th ng-repeat='v in vistorias'>{{v.quadra.nome}}</th> </tr>	</thead> <tr><th ng-repeat='v in vistorias'>{{v.cultura.nome}}</th> </tr> 	<tr> 	<th ng-repeat='v in vistorias'>{{v.dataExtenso}}</th>			</tr> </table>";

		atualizaListaFiliais();
		atualizaCulturas();
		atualizaUsuarios();
		atualizaTodasPragas();
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
					if($scope.fazendas.length==0)
					{
						$('#myPleaseWait').modal('hide');
					}
			});// final do load
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
					//$scope.gridOptions.data = $scope.ordsers;
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
		$scope.exibirSomenteEncontradas = function(){
			if($scope.exibirSomenteEn)
			{
				$scope.pragasExibir=$scope.pragasEncontradasGeral;
			}
			else
			{
				$scope.pragasExibir=$scope.todasPragas;
			}
		}

		//############################################################################################################################
		//############################################################################################################################
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
					).select(
					{"key":"quadraxcul.$value","alias":"quadraxcultura"},
					{"key":"quadra.$value","alias":"quadra"}
					).ref();

					refNovo.on('child_added', function(snap) {
						$('#myPleaseWait').modal('hide');
						//console.log('Adicionou filial', snap.name(), snap.val());

						var obj= snap.val();
						obj.cultura=$scope.getCulturaNome(obj.quadraxcultura.key_cultura)
						$scope.quadras.push(obj);
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
						if(mListVariedades.length>0)
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
												obj['datOrdserIntervalo']=  dataExecucao.getDate() - (new Date(dataMilis)).getDate();
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
					else //############################################################################################
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
												obj['datOrdserIntervalo']=  dataExecucao.getDate() - (new Date(dataMilis)).getDate();
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

			var date1 = new Date(a);
			var date2 = new Date(b);
			var timeDiff = Math.abs(date2.getTime() - date1.getTime());
			var  resultado= Math.ceil(timeDiff / (1000 * 3600 * 24));
			if(resultado<0 || isNaN(resultado))
			{
				return 0;
			}
			else
			{
				return resultado 
			}
/*
			var resultado=Math.round((new Date(a)-new Date(b))/(1000*60*60*24));
			if(resultado<0 || isNaN(resultado))
				return 0;
			else
				resultado;
			*/
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