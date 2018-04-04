(function () {

	var app = angular.module('app');

	app.directive('modules',
		[
			"$rootScope", "dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$location",

			function ($rootScope, dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $location) {

				var controller = function ($scope) {
					var vm = this;


					//Entity Specific Code

					vm.entityName = "Module";
					vm.entityCollectionName = "Modules";
					vm.focusFieldName = 'Mnemonic';
					console.log(vm.entityCollectionName + " Controller invoked");

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
					vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
					vm.columnHideWidth1 = 620;
					vm.columnHideWidth2 = 450;

					if (!vm.widget.WidgetResource.EditScreenPercentage) {
						vm.widget.WidgetResource.EditScreenPercentage = 50;
						SaveWidgetResourceObjectIfChanged();
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
								CollapseEditPane();
							}
						});

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

					vm.add = function () {

						vm.entity = getNewEntity();
						vm.editModel = getNewEntity();
						vm.editModel.activeState = vm.editModel.Active ? 1 : 0;
						vm.editPanelTitle = 'New ' + vm.entityName;
						vm.showEditPane = true;
						ExpandEditPane();
						setFocusToTheSpecifiedField();

					}

					//$interval(function() {
					//	console.log("search text = %O", vm.widget.searchText);
					//}, 1000);

					//***G
					//++Data Input/Output
					//***G

					//---B
					function GetData() {

						console.log("Entry into " + vm.entityCollectionName + " GetData()");

						dataService.GetIOPSResource(vm.entityCollectionName)
							.expandPredicate("CreatorUser")
								.expand("Person")
							.finish()
							.expandPredicate("LastModifiedUser")
								.expand("Person")
							.finish()
							.orderBy("Name")
							.query()
							.$promise
							.then(function (data) {

								vm.entities = data;
								console.log(data);
								$timeout(function () {
									vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
									SetTabBodyHeight(5);
									vm.showEntities = true;
									vm.widget.searchText = vm.widget.WidgetResource.DefaultSearchText || '';
									if ((vm.widget.WidgetResource.DefaultIdSelectedForEdit || 0) > 0) {
										vm.editPaneExpanded = true;
										vm.selectEntity(vm.entities.first(function (e) {
											return e.Id == vm.widget.WidgetResource.DefaultIdSelectedForEdit;
										}));
										vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
									} else {
										vm.listPaneWidth = vm.widgetDimensions.width;
									}
									SetupSplitter();
								}, 50);
							});
					}

					//---B
					vm.saveEntity = function () {

						console.log("saveEntity() - vm.editModel = %O", vm.editModel);

						mapEditModelToEntity();

						(vm.editModel.Id ? dataService.GetEntityById(vm.entityCollectionName, vm.entity.Id).then(function (existingEntity) {

							existingEntity.Name = vm.editModel.Name;
							existingEntity.Mnemonic = vm.editModel.Mnemonic;
							existingEntity.Description = vm.editModel.Description;
							existingEntity.LastModifiedUserId = Global.User.Id;
							existingEntity.LastModifiedDate = utilityService.GetOdataUpdateableCurrentDateTime();
							existingEntity.Active = vm.editModel.activeState == 1 ? true : false;

							return existingEntity.$save();

						}) : dataService.AddEntity(vm.entityCollectionName, vm.entity))
							.then(
								function (entityFromSave) {

									vm.entity = null;
									console.log("Entity from save = %O", entityFromSave);
									signalR.SignalAllClientsInGroup("Admin", vm.entityName + (vm.editModel.Id ? " Modified" : " Added"), entityFromSave);
									vm.showEditPane = false;
									CollapseEditPane();

								});
					}

					//---B
					function getNewEntity() {
						return {
							Name: '',
							Description: '',
							Mnemonic: '',
							CreationDate: utilityService.GetOdataUpdateableCurrentDateTime(),
							CreatorUserId: Global.User.Id,
							Active: 0
						}
					}

					//---B
					function mapEditModelToEntity() {
						vm.entity.Mnemonic = vm.editModel.Mnemonic;
						vm.entity.Name = vm.editModel.Name;
						vm.entity.Description = vm.editModel.Description;
						vm.entity.Active = vm.editModel.activeState == 1 ? true : false;

						if (vm.entity.Id) {
							vm.entity.LastModifiedUserId = Global.User.Id;
							vm.entity.LastModifiedDate = utilityService.GetOdataUpdateableCurrentDateTime();
						} else {
							vm.entity.CreatorUserId = Global.User.Id;
							vm.entity.CreationDate = utilityService.GetOdataUpdateableCurrentDateTime();

						}
					}


					//---B
					function getEntityByIdFromDBAndMergeToEntities(id) {
						//Go and get the expanded entity from the database
						dataService.GetIOPSResource(vm.entityCollectionName)
							.filter("Id", id)
							.expandPredicate("CreatorUser")
							.expand("Person")
							.finish()
							.expandPredicate("LastModifiedUser")
							.expand("Person")
							.finish()
							.query()
							.$promise
							.then(function (data) {


								console.log("Data from odata expansion = %O", data);

								var updatedEntityFromDB = data.first();

								console.log("Updated entity from db = %O", updatedEntityFromDB);

								vm.entities = [updatedEntityFromDB].concat(vm.entities).distinct(function (a, b) { return a.Id == b.Id }).orderBy(function (e) { return e.Name });
								if (updatedEntityFromDB.Id == (vm.editModel ? vm.editModel.Id : 0)) {
									vm.editModel = angular.copy(updatedEntityFromDB);
								}

							});

					}

					//---B
					vm.delete = function (entity) {



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

								//+User clicked "ok"

								//If the entity to be deleted is the same as the one selected for edit, then clear the edit screen.
								if (entity.Id == (vm.entity ? vm.entity.Id : -1)) {
									vm.entity = null;
									vm.editModel = null;
									vm.showEditPane = false;
								}
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " Deleted", entity);
								dataService.DeleteEntity(vm.entityCollectionName, entity);
								CollapseEditPane();
								toastr.success(location.Name, vm.entityName + " was deleted!");

							} else {
								// user clicked "no"
								toastr.info(location.Name, vm.entityName + " was NOT deleted!");
							}
						});
					}




					//***G







					//***G
					//++Events
					//---G


					//---B
					$scope.$on(vm.entityName + " Added", function (event, updatedEntity) {

						console.log(vm.entityName + ' Add Event. New Entity = %O', updatedEntity);
						getEntityByIdFromDBAndMergeToEntities(updatedEntity.Id);

					});

					//---B
					//---B
					$scope.$on(vm.entityName + " Updated", function (event, updatedEntity) {

						console.log(vm.entityName + ' Update Event. Updated Entity = %O', updatedEntity);
						getEntityByIdFromDBAndMergeToEntities(updatedEntity.Id);

					});

					//---B
					$scope.$on(vm.entityName + " Deleted", function (event, deletedEntity) {
						console.log(vm.entityName + ' Delete Event. Deleted Entity = %O', deletedEntity);
						console.log("vm.entities = %O", vm.entities);
						vm.entities = vm.entities.where(function (e) { return e.Id != deletedEntity.Id });
					});


					//---B
					$scope.$watch("vm.editModel",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if (newValue && newValue.Id) {
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " EditModel Modification", vm.editModel);
							}
						});

					//---B
					$scope.$watch("vm.widget.WidgetResource",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if (newValue && newValue.Id) {
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " EditModel Modification", vm.editModel);
							}
						});

					//---B
					//---B
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

					//---B
					$scope.$on(vm.entityName + " EditModel Modification", function (event, modifiedEntity) {
						if (modifiedEntity) {

							console.log(vm.entityName + ' Edit Model Modification. Modified Entity = %O', modifiedEntity);
							if (modifiedEntity.Id == (vm.editModel ? vm.editModel.Id : 0)) {
								vm.editModel = modifiedEntity;
							}
						}
					});

					//---B
					$scope.$on(vm.widget.Id + " SearchText Modification", function (event, newSearchText) {
						vm.widget.searchText = newSearchText;
					});

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetTabBodyHeight(1);
							if (vm.entity) {
								vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
							} else {
								vm.listPaneWidth = vm.widgetDimensions.width;
							}
						}
					});

					//---B
					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$timeout(function () {
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
								console.log("vm.listPaneWidth = " + vm.listPaneWidth);
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight(1);
								if (vm.entity) {
									vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
								} else {
									vm.listPaneWidth = vm.widgetDimensions.width;
								}

							}, 200);
						}
					});

					//---B
					$scope.$on("ResizeVirtualScrollContainers", function () {
						//console.log("ResizeVirtualScrollContainers received");
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						SetTabBodyHeight(1);
					});



					//***G



					//---B

					vm.cancelSaveEntity = function () {
						vm.entity = null;
						vm.widget.WidgetResource.DefaultIdSelectedForEdit = 0;
						SaveWidgetResourceObjectIfChanged();
						vm.showEditPane = false;
						CollapseEditPane();
					}

					//---B
					vm.selectEntity = function (entity) {
						if (entity) {
							vm.editModel = angular.copy(entity);
							vm.editModel.activeState = vm.editModel.Active ? 1 : 0;
							vm.entity = entity;
							vm.widget.WidgetResource.DefaultIdSelectedForEdit = entity.Id;

							SaveWidgetResourceObjectIfChanged();
							vm.editPanelTitle = 'Editing ' + vm.entityName;
							vm.showEditPane = true;
							setFocusToTheSpecifiedField();
							ExpandEditPane();
							console.log("Selected Entity = %O", vm.editModel);
						}


					}


					vm.editPaneExpanded = false;
					var editPaneAnimationInterval = 3;


					//---B
					function ExpandEditPane() {

						if (!vm.editPaneExpanded) {

							var currentPercentage = 0;
							SetupSplitter(true);
							$interval(function () {

								currentPercentage += 1;
								vm.splitter.setSizes([100 - currentPercentage, currentPercentage]);
								vm.listPaneWidth = vm.widgetDimensions.width * ((100 - currentPercentage) / 100);

							}, editPaneAnimationInterval, vm.widget.WidgetResource.SplitRightPercentage);
							vm.editPaneExpanded = true;
							console.log("vm.listPaneWidth = " + vm.listPaneWidth);
						}
					}

					//---B
					function CollapseEditPane() {

						if (vm.editPaneExpanded) {

							var currentPercentage = vm.widget.WidgetResource.SplitRightPercentage;
							$interval(function () {

								currentPercentage -= 2;
								vm.splitter.setSizes([100 - currentPercentage, currentPercentage]);
								vm.listPaneWidth = vm.widgetDimensions.width * ((100 - currentPercentage) / 100);

							}, editPaneAnimationInterval, vm.widget.WidgetResource.SplitRightPercentage).then(function() {
								vm.splitter.destroy();
								vm.splitterIsSetup = false;
							});

							vm.editPaneExpanded = false;
							vm.listPaneWidth = vm.widgetDimensions.width;
							console.log("vm.listPaneWidth = " + vm.listPaneWidth);
						} else {
							vm.listPaneWidth = vm.widgetDimensions.width;
						}
					}

					//---B
					function setFocusToTheSpecifiedField() {
						$timeout(function () {
							$("#" + vm.widget.Id + '-' + vm.entityName + '-' + vm.focusFieldName).focus();
						}, 50);
					}

					vm.showWidget = true;

					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					//---B
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


					//---B
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

					GetData();

					//---B
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




					//---B
					vm.splitterIsSetup = false;
					function SetupSplitter(expand) {
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
											sizes: [

												vm.entity && !expand ? (vm.widget.WidgetResource.SplitLeftPercentage || 50) : 100
												,
												vm.entity && !expand ? (vm.widget.WidgetResource.SplitRightPercentage || 50) : 0

											],
											minSize: 0,
											onDrag: function () {
												var sizes = vm.splitter.getSizes();
												if (vm.widgetDimensions.width == 0) {
													vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
												}
												vm.listPaneWidth = vm.widgetDimensions.width * (sizes[0] / 100);
												//console.log("vm.listPaneWidth = " + vm.listPaneWidth);

											},
											onDragEnd: function () {

												var sizes = vm.splitter.getSizes();
												vm.widget.WidgetResource.SplitLeftPercentage = sizes[0];
												vm.widget.WidgetResource.SplitRightPercentage = sizes[1];
												vm.widget.WidgetResource.EditScreenPercentage = sizes[1];
												if (vm.widgetDimensions.width == 0) {
													vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
												}
												vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
												//console.log("vm.listPaneWidth = " + vm.listPaneWidth);

												SaveWidgetResourceObjectIfChanged();
											}
										});
									vm.splitterIsSetup = true;
									//vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
									console.log("vm.listPaneWidth = " + vm.listPaneWidth);
								});
							});
						}
					}


					vm.state = $state;

					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});



				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/adminMaintenance/modules.html?" + Date.now(),

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