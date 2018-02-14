(function () {
	"use strict";


	function OdataService($odataresource, $http, $q, $resource) {

		var service = {};
		var serverPath = odataServerUrl + "/";



		service.serverPath = serverPath;

		service.GetFileImageLibraryCollectionForListOfImageKeys = function (imageKeys) {
			var fileImageLibraryData = [];
			var fileImageLibraryServerBaseAddress = "https://odataprod.utmb.edu/FileImageLibrary/";
			var url = fileImageLibraryServerBaseAddress + "ByImageKeyList?$format=application/json;odata.metadata=none";
			return $http.post(url, imageKeys)
				.then(function (response) {
					var dataStruct = response.data.value;
					fileImageLibraryData = dataStruct;
					//Setup the source url for the thumbnail if this is an image paste.
					console.log("fileImageLibraryData = %O", fileImageLibraryData);
					return fileImageLibraryData;
				});
		}




		service.GetFileImageLibraryEntriesByImageKeyList = function (stringList) {
			var fileImageLibraryServerBaseAddress = "https://odataprod.utmb.edu/FileImageLibrary/";
			var url = fileImageLibraryServerBaseAddress + "ByImageKeyList?$format=application/json;odata.metadata=none";
			return $http.post(url, stringList)
				.then(function (response) {
					var dataStruct = response.data.value;
					return dataStruct;
				});
		}


		//======================================================================================================
		//Function to return an $resource object already primed to talk to the source and collection.
		//Used by all the other functions that the service exposes.
		//======================================================================================================
		function GetResource(odataSource, collection, customId) {
			//In order to be able to update any entity, the $odataresource object must know the key field. Here it is Id"
			//This is supplied to the $odataresource as the second parameter.
			if (odataServerUrl.indexOf("48773") > 0) {
				return $odataresource(serverPath + "/" + collection, {}, {}, {
					odatakey: customId === null ? 'Id' : customId,
					isodatav4: true
				});

			} else {
				return $odataresource(serverPath + odataSource + "/" + collection, {}, {}, {
					odatakey: customId === null ? 'Id' : customId,
					isodatav4: true
				});

			}
		}

		service.GetResource = function (odataSource, collection) {
			return GetResource(odataSource, collection);
		};


		service.GetAngularStandardResource = function (url) {
			return $odataresource(url);
		}

		service.GetIOPSWebAPIResource = function (route) {
			return $resource(serverPath + "iOPS/api/" + route);
		}


		//=========================================================================================================
		//Function to return a collection from any odataSource.
		//You can optionally attach a filter field name and value, or you can simply not include those parameters.
		//=========================================================================================================
		service.GetCollection = function (odataSource, collectionName, filterFieldName, filterValue) {

			//Defined above. It just fashions the url to include the collection name and returns an odata un-queried resource.
			var resource = GetResource(odataSource, collectionName).odata();


			//If the developer tacked on a filter field name and value, then filter the results
			if (filterFieldName && filterValue) {
				return resource.filter(filterFieldName, filterValue).query().$promise;
			}
			//Otherwise, just return the whole collection
			return resource.query().$promise;
		}

		//=========================================================================================================
		//Function to return a single entity from any odataSource by id.
		//=========================================================================================================
		service.GetEntityById = function (odataSource, collectionName, id) {
			//console.log("OdataService - GetEntityById()  odataSource=" + odataSource + "  collectionName=" + collectionName);
			return GetResource(odataSource, collectionName).odata().get(parseInt(id)).$promise;
		}


		//=========================================================================================================
		//Function to insert an entity into any odata source collection.
		//=========================================================================================================
		service.InsertEntity = function (odataSource, collectionName, newEntity) {

			newEntity.Id = 0;
			return GetResource(odataSource, collectionName).save(newEntity).$promise;
		}

		//=========================================================================================================
		//Function to update an entity into any odata source collection.
		//=========================================================================================================
		service.UpdateEntity = function (odataSource, collectionName, modEntity) {
			return GetResource(odataSource, collectionName).save(modEntity).$promise;
		}

		//=========================================================================================================
		//Function to delete an entity from any odata source collection.
		//=========================================================================================================
		service.DeleteEntity = function (odataSource, collectionName, entityToDelete) {
			entityToDelete.Id = -entityToDelete.Id;
			return GetResource(odataSource, collectionName).save(entityToDelete).$promise;
		}





		return service;
	}


	angular
		.module("app")
		.factory('odataService', ['$odataresource', '$http', '$q', '$resource', OdataService]);



}());	//OdataService
