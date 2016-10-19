(function(){

	'use strict';

	angular.module('Pragueiro.controllers').registerCtrl('safraCtrl', safraCtrl);

	safraCtrl.$inject = ['$scope', 'Constant', 'Session', '$firebaseArray', '$firebaseObject', 'Notify'];

	function safraCtrl($scope, Constant, Session, $firebaseArray, $firebaseObject, Notify) {

		angular.extend($scope, {
			objSafra: {},
			formPlanejamento: {
				ativo:true,
				key:'',
				key_cultura:'',
				data_plantio: undefined,
				variedades:[]
			},
			objHistorico: {},
			edit: false,
			editQuadra: false,
			editCultura: true,
			fazendas: [],
			safras: [],
			historico: [],
			culturas: [],
			key_var:[],
			variedades: [],
			variedadesAdd: [],
			todasQuadras: [],
			quadrasPlanejamento: [],
			data: {
			},
			formSafra: {
				descricao: '',
				ativo: 'true',
				key: '',
				key_filial:'',
				data_plantio : ''
			}
		});
		$scope.formSafra.data_plantio = new Date();
		var ref = new Firebase(Constant.Url + '/filial'),
		refCultura = new Firebase(Constant.Url + '/cultura'),
		refQuadra = new Firebase(Constant.Url + '/quadra'),
		_salvarQuadra = false,
		refSafra = null,
		refQuadrasCulturas = null,
		refHistoricoQuadrasCulturas = null;

		atualizaListaFiliais();


		$scope.culturas = $firebaseArray(refCultura);
		var todasQuadras = $firebaseArray(refQuadra);
		

		function atualizaVariedade(key_filial)
		{
			var refVariedades = new Firebase(Constant.Url + '/variedade/'+ key_filial);
			refVariedades.ref().on('child_added', function(snap) {
				$scope.variedades.push(snap.val());
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
					{"key":"$key.$key","alias":"key"},
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
		

		$scope.chengeFazenda = function(fazenda){
			if(fazenda === null) return false;
			refSafra = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra');
			atualizaVariedade(fazenda.key);
			$scope.safras = $firebaseArray(refSafra);
			$scope.todasQuadras=[];
			$scope.todasQuadras.push({nome:'', key:null});
			var filialxquadras = $firebaseArray(new Firebase(Constant.Url + '/filial/'+fazenda.key+'/quadra'));
			filialxquadras.$loaded(function() {
				filialxquadras.forEach(function(filxqua){
					todasQuadras.forEach(function(item){
						if(item.$id === filxqua.$id)
						{ 							
							$scope.todasQuadras.push(item);
						}
					});
				});
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


		//############################################################################################################################
		//############################################################################################################################
		// SAFRA
		//############################################################################################################################

		$scope.salvarSafra = function(fazenda, formSafra){
			
			if(validFormSafra(formSafra)) return true;
			$scope.safras.$add(formSafra).then(function(ref) {
				formSafra.key = ref.key();
				
				var fazendaTmp=fazenda;
				var refNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/'+formSafra.key);
				refNovo.set(formSafra);
				Notify.successBottom('Safra salva com sucesso!');
				$scope.clearFormSafra();
				$scope.setaFazenda(fazendaTmp);		
			});
		};

		$scope.atualizarSafra = function(formSafra){
			if(validFormSafra(formSafra)) return true;
			$scope.safras.$save(formSafra);
			Notify.successBottom('Safra atualizada com sucesso!');
			$scope.clearFormSafra();
		};

		$scope.ChamarEditarSafra = function(data){
			$scope.formSafra = data;
			$scope.edit = true;
		};

		$scope.excluirSafra = function(data){
			var fazendaTmp=$scope.data.fazenda;
			$scope.safras.$remove(data);
			Notify.successBottom('Safra removida com sucesso!');
			$scope.setaFazenda(fazendaTmp);
		};

		//############################################################################################################################
		//############################################################################################################################
		// FAZENDA X SAFRA X QUADRA X CULTURA
		//############################################################################################################################

		$scope.showQuadras = function(fazenda, safra){
			if(safra === null) return false;
			$scope.objSafra=safra;
			if($scope.culturas.length === 0) return false;
			if($scope.todasQuadras.length > 0) 
			{
				$scope.clearFormSafraQuadrasCulturas(fazenda, safra);
			}	
			refHistoricoQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.$id +'/historicorelacionamento');
			$scope.historico = $firebaseArray(refHistoricoQuadrasCulturas);
			$('#modalQuadras').modal('show');
		};


		$scope.salvarPlanejamento = function(fazenda, safra, formPlanejamento){
			if(validFormQuadraXCultura(formPlanejamento)) return true;

			if(isNaN(formPlanejamento.data_plantio) || formPlanejamento.data_plantio==null) 
			{
				delete formPlanejamento.data_plantio;
			}
			else
			{		
				formPlanejamento.data_plantio=new Date(formPlanejamento.data_plantio).getTime();
			}

			var refNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/'+safra.key+'/quadra/'+formPlanejamento.key);
			delete formPlanejamento.cultura;
			delete formPlanejamento.quadra;

			refNovo.set(formPlanejamento);

			Notify.successBottom('Relacionamento salvo com sucesso!');
			_salvarQuadra = true;
			$scope.formPlanejamento.key=null;
			$scope.formPlanejamento.key_cultura=null;
			$scope.setaFazenda($scope.data.fazenda);	
		};

		$scope.ChamarEditarPlanejamento = function(quadracultura)
		{
			$scope.editCultura=true;
			var data=clone(quadracultura);
			if(data.variedades!=null)
			{
				$scope.editCultura=false;
				var listVariedades=[];
				for(var objVar in data.variedades)
				{
					for (var i = 0; i < $scope.variedades.length; i++)
					{
						for(var obj in $scope.variedades[i])
						{							
							if($scope.variedades[i][obj].key==objVar)
							{
								listVariedades.push($scope.variedades[i][obj]);
								break;
							}							
						}
					}
				}
				data['variedades']=listVariedades;
			}

			$scope.formPlanejamento = data;
			$scope.formPlanejamento.data_plantio = new Date(data.data_plantio);
			$scope.editQuadra = true;
			$scope.chengeCultura($scope.formPlanejamento.key_cultura);

			return true;
		};

		$scope.atualizarPlanejamento = function(fazenda, safra, formPlanejamento){
			if(validFormQuadraXCultura(formPlanejamento)) return true;

			if(isNaN(formPlanejamento.data_plantio) || formPlanejamento.data_plantio==null) 
			{
				delete formPlanejamento.data_plantio;
			}
			else
			{		
				formPlanejamento.data_plantio=new Date(formPlanejamento.data_plantio).getTime();
			}
			
			console.log(Constant.Url + '/filial/' + fazenda.key + '/safra/'+safra.key+'/quadra/'+formPlanejamento.key);
			var refNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/'+safra.key+'/quadra/'+formPlanejamento.key);

			delete formPlanejamento.key_variedade;
			delete formPlanejamento.cultura;
			delete formPlanejamento.quadra;
			delete formPlanejamento.$$hashKey;
			delete formPlanejamento.$id;
			delete formPlanejamento.$priority;
			delete formPlanejamento.variedades;

			refNovo.update(formPlanejamento);
			//$scope.quadrasPlanejamento.$save(formPlanejamento);
			$scope.addHistorico(formPlanejamento.key, formPlanejamento.key_cultura, 'Atualizou');
			Notify.successBottom('Relacionamento atualziado com sucesso!');
			$scope.clearFormSafraQuadrasCulturas(fazenda, safra);
			$scope.clearFormPlanejamento();
			$scope.setaFazenda(fazenda);		
		};

		$scope.excluirPlanejamento = function(data){
			var fazendaTmp=$scope.data.fazenda;
			$scope.quadrasPlanejamento.$remove(data);
			$scope.addHistorico(data.key, data.key_cultura, 'Removeu');
			Notify.successBottom('Relacionamento removido com sucesso!');
			$scope.setaFazenda(fazendaTmp);
		};

		$scope.clearFormSafraQuadrasCulturas = function(fazenda, safra){

			refQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.key + '/quadra');
			$scope.quadrasPlanejamento = $firebaseArray(refQuadrasCulturas);
			$scope.editQuadra = false;
			return true;
		};

		$scope.chengeCultura = function(key_cultura){
			if(key_cultura === null) return false;
			$scope.variedadesAdd=[];
			for (var i = 0; i < $scope.variedades.length; i++)
			{						
				for(var obj in $scope.variedades[i])
				{	
					if($scope.variedades[i][obj].key_cultura==key_cultura)
					{
						$scope.variedadesAdd.push($scope.variedades[i][obj]);					
					}
				}
			}
		};

		//############################################################################################################################
		//############################################################################################################################
		//VARIEDADE
		//############################################################################################################################

		$scope.chengeVariedade = function(cultura){
			//if(cultura === null) return false;
			$scope.variedadesAdd=[];
			for (var i = 0; i < $scope.variedades.length; i++)
			{						
				for(var obj in $scope.variedades[i])
				{	
					if($scope.variedades[i][obj].key_cultura==cultura)
					{
						$scope.variedadesAdd.push($scope.variedades[i][obj]);					
					}
				}
			}
		};

		$scope.excluirVariedade = function(fazenda, safra, formPlanejamento, variedade){
			var fazendaTmp=fazenda;
			var refVariedadeNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.key + '/quadra/'+formPlanejamento.key+'/variedades/'+variedade.key);
			refVariedadeNovo.remove();
			console.log(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.key + '/quadra/'+formPlanejamento.key+'/variedades/'+variedade.key);
			Notify.successBottom('Variedade removida com sucesso!');
			for (var i = 0; i < $scope.variedadesAdd.length; i++)
			{			
				if($scope.variedadesAdd[i].key==variedade.key)
				{
					$scope.formPlanejamento.variedades.splice(i);
					break
				}
			}
			$scope.setaFazenda(fazendaTmp);
		};

		$scope.salvarVariedade = function(fazenda, safra, formPlanejamento){
			var fazendaTmp=fazenda;
			var refVariedadeNovo = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.key + '/quadra/'+formPlanejamento.key+'/variedades/'+formPlanejamento.key_variedade);
			refVariedadeNovo.set(true);
			console.log(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.key + '/quadra/'+formPlanejamento.key+'/variedades/'+formPlanejamento.key_variedade);
			for (var i = 0; i < $scope.variedadesAdd.length; i++)
			{			
				if($scope.variedadesAdd[i].key==formPlanejamento.key_variedade)
				{
					if(formPlanejamento.variedades!=null)
					{
						formPlanejamento.variedades.push($scope.variedadesAdd[i]);
					}
					else
					{
						formPlanejamento['variedades']=[]
						formPlanejamento.variedades.push($scope.variedadesAdd[i]);
					}
					break;
				}
			}
			
			Notify.successBottom('Variedade adicionada com sucesso!');
			$scope.setaFazenda(fazendaTmp);
		};

		//############################################################################################################################
		//############################################################################################################################
		//HISTÓRICO
		//############################################################################################################################

		$scope.addHistorico = function(quadraId, culturaId, tipo){
			$scope.historico.$add({
				quadra: quadraId,
				cultura: culturaId,
				tipo: tipo,
				dataAlteracao: new Date().getTime()
			});
		};

		$scope.getHistoricoQuadrasCulturas = function(fazenda, safra){
			$scope.objHistorico = safra;
			refHistoricoQuadrasCulturas = new Firebase(Constant.Url + '/filial/' + fazenda.key + '/safra/' + safra.$id +'/historicorelacionamento');
			$scope.historico = $firebaseArray(refHistoricoQuadrasCulturas);
			$('#modalHistoricoQuadras').modal('show');
		};

		//############################################################################################################################
		//############################################################################################################################
		//RECUPERA NOME QUADRA/CULTURA
		//############################################################################################################################
		$scope.getCulturaNome = function(culturaId){
			var retorno = '';
			$scope.culturas.forEach(function(item){
				if(item.$id === culturaId) retorno = item.nome;
			});
			return retorno;
		};

		$scope.getQuadraNome = function(quadraId){
			var retorno = '';
			$scope.todasQuadras.forEach(function(item){
				if(item.$id === quadraId) retorno = item.nome;
			});
			return retorno;
		};

		//############################################################################################################################
		//############################################################################################################################
		//UTEIS
		//############################################################################################################################

		function validFormSafra(data){
			if($scope.data.fazenda == null){
				Notify.errorBottom('O campo fazenda é inválido!');
				return true;
			}
			if(data.descricao === ''){
				Notify.errorBottom('O campo descriçāo é inválido!');
				return true;
			}
			if(data.ativo === ''){
				Notify.errorBottom('O campo ativo é inválido!');
				return true;
			}
			
			return false;
		};

		function validFormQuadraXCultura(data){
			
			if(data.key == null){
				Notify.errorBottom('O campo quadra é inválido!');
				return true;
			}
			else
			{
				if(data.key == ''){
					Notify.errorBottom('O campo quadra é inválido!');
					return true;
				}
			}
			if(data.key_cultura == null){
				Notify.errorBottom('O campo cultura é inválido!');
				return true;
			}
			else
			{
				if(data.key_cultura == ''){
					Notify.errorBottom('O campo cultura é inválido!');
					return true;
				}
			}
			return false;
		};

		$scope.clearFormSafraFormSafra = function(){
			angular.extend($scope.formSafra, {
				descricao: '',
				ativo: 'true'
			});			
			return true;
		};

		$scope.clearFormPlanejamento= function(){
			angular.extend($scope.formPlanejamento, {
				ativo:true,
				key:'',
				key_cultura:'',
				data_plantio: undefined,
				variedades:[]
			});			
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

		$scope.$watch('quadra', function(newValue, oldValue){
			if(_salvarQuadra){
				$scope.addHistorico(newValue[newValue.length - 1].key, newValue[newValue.length - 1].key_cultura, 'Adicionou');
				_salvarQuadra = false;
			}
		});

		$scope.formSafraat = 'yyyy/MM/dd';
		$scope.date = new Date();
	}

}());