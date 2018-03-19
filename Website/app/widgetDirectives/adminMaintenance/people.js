(function () {

	var app = angular.module('app');

	app.directive('people',
		[
			"$rootScope", "dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$location", "$q",

			function ($rootScope, dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $location, $q) {

				var controller = function ($scope) {
					var vm = this;


					//Entity Specific Code

					vm.entityName = "Company";
					vm.entityCollectionName = "Companies";
					vm.focusFieldName = 'Name';
					console.log(vm.entityCollectionName + " Controller invoked");


					function getNewEntity() {
						return {
							Name: '',
							Description: ''
						}
					}

					function mapEditModelToEntity() {
						if (vm.editModel.Id > 0) {
							vm.entity.Id = vm.editModel.Id;
						}
						vm.entity.Name = vm.editModel.Name;
						vm.entity.ShortName = vm.editModel.ShortName;
						vm.entity.Description = vm.editModel.Description;
						vm.entity.Address = vm.editModel.Address;
					}

					/////////////////////////////////////////////
					//Generic Code Below
					////////////////////////////////////////////


					console.log(vm.entityCollectionName + " 1");

					hotkeys.bindTo($scope)
						.add({
							combo: 'ctrl+s',
							description: 'Save and Close any form data input form',
							allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
							callback: function () {
								event.preventDefault();
								vm.saveEntity();
							}
						})
						.add({
							combo: 'esc',
							description: 'Cancel and close any input form',
							allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
							callback: function () {
								vm.entity = null;
								vm.showEditPane = false;
							}
						});

					function setFocusToTheSpecifiedField() {
						$timeout(function () {
							$("#" + vm.widget.Id + '-' + vm.entityName + '-' + vm.focusFieldName).focus();
						}, 50);
					}

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						headingPlusButton: true,
						headingPlusButtonTitle: 'Add New ' + vm.entityName,
						addEntityFunction: function () {
							vm.add();
						},
						headingSearchField: true
					}


					//$interval(function() {
					//	console.log("search text = %O", vm.widget.searchText);
					//}, 1000);
					dataService.GetJBTData().then(function (data) {
						vm.JBTData = data;
					});


					vm.delete = function (entity) {


						var cacheCompany = vm.JBTData.Companies.first(function (c) { return c.Id == entity.Id });
						console.log("cacheCompany = %O", cacheCompany);

						if (
								vm.JBTData.Assets.any(function (a) { return a.CompanyId == entity.Id }) ||
								vm.JBTData.Systems.any(function (s) { return s.CompanyId == entity.Id }) ||
								cacheCompany.Sites.length > 0

							) {

							var alertifyMessage = "<strong>Company cannot be deleted!</strong><br><br>";

							if (vm.JBTData.Assets.any(function (a) { return a.CompanyId == entity.Id })) {
								alertifyMessage += "It still has Assets associated with it!<br>";
							}

							if (vm.JBTData.Systems.any(function (s) { return s.CompanyId == entity.Id })) {
								alertifyMessage += "It still has Systems associated with it!<br>";
							}

							if (cacheCompany.Sites.length > 0) {
								alertifyMessage += "It still has Sites associated with it!";
							}

							alertify.set({
								labels: {
									ok: "Ok",
									cancel: "Cancel, I don't want to do this"
								},
								buttonFocus: "cancel"
							});

							alertify.alert(alertifyMessage, function (e) {
								toastr.success(location.Name, "Company was NOT deleted!");
								return;
							}
							);

							return;

						}

						alertify.set({
							labels: {
								ok: "Yes, Delete the " + vm.entityName,
								cancel: "Cancel, I don't want to do this"
							},
							buttonFocus: "cancel"
						});
						var message = 'Are you SURE you want to delete this ' + vm.entityName + '? ';

						alertify.confirm(message, function (e) {
							if (e) {
								// user clicked "ok"
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " Delete", entity);
								dataService.DeleteEntity(vm.entityCollectionName, entity);
								toastr.success(location.Name, vm.entityName + " was deleted!");

							} else {
								// user clicked "no"
								toastr.info(location.Name, vm.entityName + " was NOT deleted!");
							}
						});
					}



					vm.add = function () {

						vm.editModel = getNewEntity();
						vm.entity = angular.copy(vm.editModel);
						vm.editPanelTitle = 'New ' + vm.entityName;
						vm.showEditPane = true;
						setFocusToTheSpecifiedField();

					}

					vm.cancelSaveEntity = function () {
						vm.entity = null;
						vm.editModel = null;
						vm.widget.WidgetResource.DefaultIdSelectedForEdit = 0;
						SaveWidgetResourceObjectIfChanged();
						vm.showEditPane = false;
					}

					vm.selectEntity = function (entity) {
						if (entity) {
							if (!vm.editModel || (vm.editModel && vm.editModel.Id != entity.Id)) {

								console.log("Selected entity to edit = %O", entity);
								vm.editModel = angular.copy(entity);

								vm.editModel.associatedSiteIds = [];

								entity.SiteCompanies.forEach(function (sc) {
									vm.editModel.associatedSiteIds[sc.Site.Id] = true;
								});


								console.log("vm.editModel = %O", vm.editModel);

								vm.entity = entity;
								vm.widget.WidgetResource.DefaultIdSelectedForEdit = entity.Id;
								SaveWidgetResourceObjectIfChanged();
								vm.editPanelTitle = 'Editing ' + vm.entityName;
								vm.showEditPane = true;
								setFocusToTheSpecifiedField();
								console.log("vm.entity = %O", vm.entity);
							}
						}

					}

					vm.saveEntity = function () {

						var associatedSiteIdObjects = [];


						vm.editModel.associatedSiteIds.forEach(function (enabled, siteId) {
							associatedSiteIdObjects.push({ SiteId: siteId, Enabled: enabled });
						});


						mapEditModelToEntity();


						//If this is an existing entity, go and get a fresh copy without the SiteCompanies attached.
						if (vm.entity.Id) {



						}

						console.log("Company to save = %O", vm.editModel);

						(vm.editModel.Id ? dataService.GetEntityById(vm.entityCollectionName, vm.entity.Id).then(function (existingEntity) {
							existingEntity.Name = vm.editModel.Name;
							existingEntity.ShortName = vm.editModel.ShortName;
							existingEntity.Description = vm.editModel.Description;
							existingEntity.Address = vm.editModel.Address;
							return existingEntity.$save();

						}) : dataService.AddEntity(vm.entityCollectionName, vm.editModel)).then(
							function (entityFromSave) {

								vm.entityFromSave = entityFromSave;
								console.log("entity returned from the save operation = %O", entityFromSave);
								$q.all(
									//All Sites that are present in the company already associated set, that are not present in the enabled sites list in the company, as delete promise set.
										vm.entity
										.SiteCompanies
										.where(function (sc) { return !vm.editModel.associatedSiteIds[sc.SiteId] })
										.select(function (scToRemoveFromCompany) {

											console.log("Site Company to remove from Company entity = %O", scToRemoveFromCompany);
											return dataService.GetIOPSResource("SiteCompanies")
												.filter("CompanyId", vm.entity.Id)
												.filter("SiteId", scToRemoveFromCompany.SiteId)
												.query().$promise.then(function (data) {

													var scToDelete = data.first();
													scToDelete.Id = -scToDelete.Id;

													return scToDelete.$save();
												});


										})
									.concat(
											associatedSiteIdObjects
											.where(function (en) {
												return en.Enabled && !vm.entity.SiteCompanies.any(function (sc) { return sc.SiteId == en.SiteId });
											})
											.select(function (scToInsert) {

												console.log("Site Company to add to Company entity = %O", scToInsert);
												return dataService.AddEntity("SiteCompanies",
													{
														SiteId: scToInsert.SiteId,
														CompanyId: vm.entity.Id
													});
											})
										)
								).then(function () {


									signalR.SignalAllClientsInGroup("Admin", vm.entityName + (vm.editModel.Id ? " Update" : " Add"), entityFromSave);
									vm.showEditPane = false;
									vm.entity = null;
									vm.editModel = null;

								});


							});
					}


					$scope.$on(vm.entityName + " Add", function (event, newEntity) {
						console.log(vm.entityName + ' Add Event. New Entity = %O', newEntity);
						vm.entities.push(newEntity);
						vm.entities = vm.entities.orderBy(function (e) { return e.Name });
					});

					$scope.$on(vm.entityName + " Update", function (event, updatedEntity) {
						console.log(vm.entityName + ' Update Event. Updated Entity = %O', updatedEntity);


						//Get the company with all of the attached SiteCompany entities for another edit.
						dataService.GetIOPSResource(vm.entityCollectionName)
							.expandPredicate("SiteCompanies")
								.expand("Site")
							.finish()
							.filter("Id", updatedEntity.Id)
							.query()
							.$promise
							.then(function (data) {
								var updatedEntityFromDB = data.first();

								console.log("Updated entity retrieved from DB = %O", updatedEntityFromDB);

								vm.entities = [updatedEntityFromDB].concat(vm.entities).distinct(function (a, b) { return a.Id == b.Id }).orderBy(function (e) { return e.Name });

								console.log("New entities collection = %O", vm.entities);

								if (updatedEntityFromDB.Id == (vm.editModel ? vm.editModel.Id : 0)) {

									vm.editModel = angular.copy(updatedEntityFromDB);
									vm.editModel.associatedSiteIds = [];

									updatedEntityFromDB.SiteCompanies.forEach(function (sc) {
										vm.editModel.associatedSiteIds[sc.Site.Id] = true;
									});
								}

							});

					});

					$scope.$on(vm.entityName + " Delete", function (event, deletedEntity) {
						console.log(vm.entityName + ' Delete Event. Deleted Entity = %O', deletedEntity);
						console.log("vm.entities = %O", vm.entities);
						vm.entities = vm.entities.where(function (e) { return e.Id != deletedEntity.Id });
					});

					$scope.$watch("vm.editModel",
						function (newValue, oldValue) {
							if ((oldValue || '') != (newValue || '')) {
								console.log("$scope.$watch vm.editModel change triggered");
								console.log("Old Value = %O", oldValue);
								console.log("New Value = %O", oldValue);
								//If any of the entities have an Id attribute, then this is editing an existing value.
								//send the changes to all other browsers as they press the keys.
								if (newValue && newValue.Id) {
									console.log("vm.editModelChanged. newValue = %O", newValue);

									signalR.SignalAllClientsInGroup("Admin", vm.entityName + " EditModel Modification", { editModel: vm.editModel, widgetId: vm.widget.Id });
								}
							}
						});

					$scope.$watch("vm.widget.WidgetResource",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if (newValue && newValue.Id) {
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " EditModel Modification", vm.editModel);
							}
						});

					$scope.$watch("vm.widget.searchText",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if ((oldValue || '') != (newValue || '')) {
								console.log("searchText change = Old = " + oldValue + " New = " + newValue);
								vm.widget.WidgetResource.DefaultSearchText = newValue;
								SaveWidgetResourceObjectIfChanged();
								signalR.SignalAllClientsInGroup("Admin", vm.widget.Id + " SearchText Modification", vm.widget.searchText);
							}
						});

					$scope.$on(vm.entityName + " EditModel Modification", function (event, modifiedEntityObject) {
						if (modifiedEntityObject) {

							console.log(vm.entityName + ' Edit Model Modification. Modified Entity = %O', modifiedEntityObject);

							//Only if it is the same entity that we are editing and it came from another widget somewhere in the system.
							if (modifiedEntityObject.editModel.Id == (vm.editModel ? vm.editModel.Id : 0) && modifiedEntityObject.widgetId != vm.widget.Id) {
								vm.editModel = modifiedEntityObject.editModel;
								console.log("vm.editModel reassigned from event. editModel now = %O", vm.editModel);
							}
						}
					});

					$scope.$on(vm.widget.Id + " SearchText Modification", function (event, newSearchText) {
						vm.widget.searchText = newSearchText;
					});



					vm.showWidget = true;

					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
						//console.log("Changed Widget Resource = %O", possiblyChangedResource);
						//console.log("Original widget resource = %O", vm.originalWidgetResource);
						if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

							console.log("Saving widget resource........");
							console.log("Original WidgetResource = %O", vm.originalWidgetResource);
							console.log("Changed WidgetResource = %O", possiblyChangedResource);
							vm.widget.WidgetResource.$save();
							vm.originalWidgetResource = possiblyChangedResource;
						}
					}

					vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
					SaveWidgetResourceObjectIfChanged();

					vm.bootstrapLabelColumns = 3;
					vm.bootstrapInputColumns = 9;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					console.log("Initial vm.widget = %O", vm.widget);


					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.tagDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.tagDataSortField == fieldName) {
							if (vm.widget.displaySettings.tagDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.tagDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.tagDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.tagDataSortField = fieldName;
						}
					}

					//***G
					//++Get the Data
					//---G
					function GetData() {

						console.log("Entry into " + vm.entityCollectionName + " GetData()");


						dataService.GetIOPSResource("Companies")
							.expandPredicate("SiteCompanies")
								.expand("Site")
							.finish()
							.query()
							.$promise
							.then(function (data) {

								console.log("Companies Data = %O", data);


								vm.entities = data.orderBy(function (e) { return e.Name });

								$timeout(function () {
									SetTabBodyHeight(5);
									SetupSplitter();
									vm.showEntities = true;
									vm.widget.searchText = vm.widget.WidgetResource.DefaultSearchText || '';
									if ((vm.widget.WidgetResource.DefaultIdSelectedForEdit || 0) > 0) {
										vm.selectEntity(vm.entities.first(function (e) {
											return e.Id == vm.widget.WidgetResource.DefaultIdSelectedForEdit;
										}));
									}
								}, 50);


							});


					}
					//***G

					console.log(vm.entityCollectionName + " 3");

					GetData();

					function SetTabBodyHeight(repeatCount) {
						$interval(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							var heightToSet = 0;
							if (widgetDimensions) {

								heightToSet = widgetDimensions.height - 3;

								//console.log("Height to set = " + heightToSet);
								$("#containerdata" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-data" + vm.widget.Id).css('height', heightToSet);
								$("#container-edit" + vm.widget.Id).css('height', heightToSet - 20);
								$("#widget-edit-pane-panel-body" + vm.widget.Id).css('height', heightToSet - 20);
								$("#edit-pane-backdrop" + vm.widget.Id).css('height', heightToSet - 20);
							}

						}, 50, repeatCount || 1);
					}





					vm.splitterIsSetup = false;
					function SetupSplitter() {
						if (!vm.splitterIsSetup) {
							$scope.$$postDigest(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								$scope.$$postDigest(function () {

									vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
									vm.widget.WidgetResource.SplitRightPercentage = vm.widget.WidgetResource.SplitRightPercentage || 50;

									vm.splitter = Split(['#containerData' + vm.widget.Id, '#containerEdit' + vm.widget.Id],
										{
											elementStyle: function (dimension, size, gutterSize) {
												return {
													'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
												}
											},
											gutterStyle: function (dimension, gutterSize) {
												return {
													'flex-basis': gutterSize + 'px',
													'background-image': "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
													'background-repeat': 'no-repeat',
													'background-position': '50%',
													'background-color': 'transparent',
													'cursor': 'col-resize'
												}
											},
											sizes: [vm.widget.WidgetResource.SplitLeftPercentage || 50, vm.widget.WidgetResource.SplitRightPercentage || 50],
											minSize: 0,
											onDragEnd: function () {

												var sizes = vm.splitter.getSizes();
												vm.widget.WidgetResource.SplitLeftPercentage = sizes[0];
												vm.widget.WidgetResource.SplitRightPercentage = sizes[1];

												SaveWidgetResourceObjectIfChanged();
											},

										});
									vm.splitterIsSetup = true;
								});


							});

						}


					}

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetTabBodyHeight(1);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$timeout(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight(1);

							}, 200);
						}
					});

					$scope.$on("ResizeVirtualScrollContainers", function () {
						//console.log("ResizeVirtualScrollContainers received");
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						SetTabBodyHeight(1);
					});




					vm.state = $state;

					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});




				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/adminMaintenance/people.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());