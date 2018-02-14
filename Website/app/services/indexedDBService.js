(function () {
	"use strict";


	function IndexedDBService($q) {

		var service = {};



		var _error = {
			setErrorHandlers: function (request, errorHandler) {
				if (typeof request !== 'undefined') {
					if ('onerror' in request) request.onError = errorHandler;
					if ('onblocked' in request) request.onblocked = errorHandler;
					if ('onabort' in request) request.onabort = errorHandler;
				}
			}
		}

		service.indexedDBPresent = false;

		service.getDBInstance = function (dbName, version, schema) {
			var deferred = $q.defer();

			var _db = {
				instance: null,

				open: function (databaseName, version, schema) {
					var deferred = $q.defer();
					if (window.indexedDB) {
						var request = window.indexedDB.open(databaseName, version);

						_error.setErrorHandlers(request, deferred.reject);
						request.onupgradeneeded = function (e) {

							console.log("localDB Upgrading.....");
							var db = e.target.result;
							//Clear all data stores and recreate on id.
							//Collect the store names in a separate array because the forEach method will not work on them.
							console.log("db = %O", db);
							var count = db.objectStoreNames.length;
							var names = [];
							for (var x = 0; x < count; x++) {
								names.push(db.objectStoreNames[x]);
							}

							//Delete all stores
							names.forEach(function (n) {
								console.log("Deleting object store " + n);
								db.deleteObjectStore(n);
							});


							schema.forEach(function (ds) {
								console.log("schema = %O", ds);
								console.log("Creating objectStore " + ds.dataStoreName);
								var objectStore = db.createObjectStore(ds.dataStoreName, { keyPath: ds.keyName });
								if (ds.indices) {
									ds.indices.forEach(function (index) {
										objectStore.createIndex(index.name, index.fieldName, { unique: false });
									});
								}
							});

						};

						request.onsuccess = function (e) {
							service.indexedDBPresent = true;
							_db.instance = e.target.result;
							_error.setErrorHandlers(this.instance, deferred.reject);
							deferred.resolve();
						};

					} else {
						deferred.resolve();
					}

					return deferred.promise;
				},

				requireOpenDB: function (objectStoreName, deferred) {
					if (_db.instance === null) {
						deferred.reject("You cannot use an object store when the database has not been opened. Store Name = " + objectStoreName);
					};
				},

				getObjectStore: function (objectStoreName, mode) {
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;

					}
					mode = mode || 'readonly';
					var txn = this.instance.transaction(objectStoreName, mode);
					var store = txn.objectStore(objectStoreName);
					return store;
				},

				requireObjectStoreName: function (objectStoreName, deferred) {
					if (typeof objectStoreName === 'undefined' ||
						!objectStoreName ||
						objectStoreName.length === 0) {
						deferred.reject("An objectStoreName is required.");
					}
				},

				getCount: function (objectStoreName) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;

					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);


					var store = this.getObjectStore(objectStoreName);
					var request = store.count();
					var count;

					request.onsuccess = function (e) {
						count = e.target.result;
						deferred.resolve(count);
					}

					return deferred.promise;
				},

				getAll: function (objectStoreName) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;

					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					var store = this.getObjectStore(objectStoreName);
					console.log("getAll Function: store = %O", store);
					if (store.getAll) {
						var request = store.getAll();
						var allData;

						request.onsuccess = function (e) {
							allData = e.target.result;
							deferred.resolve(allData);
						}

					} else {
						deferred.resolve(null);
					}


					return deferred.promise;

				},




				upsert: function (objectStoreName, data) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;
					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					//Copy will remove all function definition properties on the data.
					data = angular.copy(data);

					var store = this.getObjectStore(objectStoreName, 'readwrite');

					var request = store.put(data);

					request.onsuccess = function () {
						deferred.resolve(data);
					};

					return deferred.promise;

				},

				'delete': function (objectStoreName, key) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;
					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					var store = _db.getObjectStore(objectStoreName, 'readwrite');
					var request = store.delete(key);

					return deferred.promise;

				},

				getById: function (objectStoreName, key) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						console.log("Indexed DB Not present in browser!");
						deferred.resolve(null);
						return deferred.promise;
					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					var store = this.getObjectStore(objectStoreName);
					var request = store.get(key);

					request.onsuccess = function (e) {
						deferred.resolve(e.target.result);
					}
					return deferred.promise;
				},


				getByIndex: function (objectStoreName, indexName, key) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;
					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					var store = this.getObjectStore(objectStoreName);
					var index = store.index(indexName);


					var range = IDBKeyRange.only(key);
					var outputData = [];

					index.openCursor(range).onsuccess = function (e) {
						var cursor = e.target.result;
						if (cursor) {
							outputData.push(cursor.value);
							cursor.continue();
						} else {
							deferred.resolve(outputData);
						}
					}

					return deferred.promise;
				},

				clear: function (objectStoreName) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;
					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					var store = this.getObjectStore(objectStoreName, 'readWrite');

					var request = store.clear();

					request.onsuccess = deferred.resolve;

					return deferred.promise;

				}


			};

			//console.log("Opening Database");
			_db.open(dbName, version, schema).then(function () {
					//console.log("Database resolved");
					deferred.resolve(_db);
				},
				function () {
					console.log("Failed");
				});

			return deferred.promise;


		}


		return service;

	}


	angular
		.module("app")
		.factory('indexedDBService', ['$q', IndexedDBService]);



}());	//IndexedDBService
