(function ()
{

	var app = angular.module('app');

	app.directive('fileUploadList',
		[
			"odataService", "personnelService", "utilityService", "$odata", "dataCache", "$state", "hotkeys", "displaySetupService", "$timeout", "FileUploader", "$http", "appSettings", "$odataresource", "$window", "$interval", "signalR", "securityService",

			function (odataService, personnelService, utilityService, $odata, dataCache, $state, hotkeys, displaySetupService, $timeout, FileUploader, $http, appSettings, $odataresource, $window, $interval, signalR, securityService)
			{

				var controller = function ($scope)
				{
					var vm = this;
					var iconmenu = "doc,docx,xls,xlsm,xlsx,msg,pdf,ppt,js,css,mp4,mp3,wav,zip,txt,json,config,cs,aspx,html,tif,tiff,,vsd,chm,asp,sql,hl7,xml,linq,rdl,wma,msi,exe.reg";

					var fileImageLibraryServerBaseAddress = "https://odataprod.utmb.edu/FileImageLibrary/";
					//var fileImageLibraryServerBaseAddress = "http://localhost:41840/";

					var uploadReordinal = 100000;
					personnelService.GetPersonById(securityService.GetCurrentUser().UserMasterId).then(function(person) {
						vm.CurrentUserPerson = person;
					});

					vm.state = $state;

					if (vm.mode) {
						if (vm.mode == "readOnly")
						{
							vm.readOnly = true;
						} else {
							vm.readOnly = false;
						}
					}

					var uploader = $scope.uploader = new FileUploader({
						url: fileImageLibraryServerBaseAddress + 'upload'
					});

					
					function traverseFileTree(item, path)
					{
						path = path || "";
						if (item.isFile)
						{
							// Get file
							item.file(function (file) {
								////console.log("Adding to queue in new routine");
								uploader.addToQueue(file);
								////console.log("File:", path + file.name);
							});
						} else if (item.isDirectory) {
							// Get folder contents
							var dirReader = item.createReader();
							dirReader.readEntries(function (entries)
							{
								for (var i = 0; i < entries.length; i++)
								{
									traverseFileTree(entries[i], path + item.name + "/");
								}
							});
						}
					}
					function handleFocus(event)
					{
						$("#pasteTarget").focus();
						$("#pasteTarget").click();

						//console.log("pasteTarget focused");
					}

					var win = angular.element($window).on("focus", handleFocus);
					var descSavePromise = $interval(function ()
					{
						vm.SaveAllModifiedDescriptions();
					}, 1000);

					$scope.$on("$destroy", function ()
					{
						win.off("focus", handleFocus);
						$interval.cancel(descSavePromise);

					});

					$timeout(function() {
						document.getElementById('pasteTarget').addEventListener("drop", function (event)
						{

							event.preventDefault();
							var items = event.dataTransfer.items;
							for (var i = 0; i < items.length; i++) {
								// webkitGetAsEntry is where the magic happens
								var item = items[i].webkitGetAsEntry();
								if (item && !item.isFile)
								{

									uploader.queue.pop();

									traverseFileTree(item);
								}
							}


						}, false);

					}, 200);

					//////////////////////////////////////////////////
					//Section that provides for table reordering
					//////////////////////////////////////////////////
					var fixHelperModified = function (e, tr)
					{
						var $originals = tr.children();
						var $helper = tr.clone();
						$helper.children().each(function (index)
						{
							$(this).width($originals.eq(index).width());
						});
						return $helper;
					},
					updateIndex = function (e, ui)
					{

						var inOrderIdList = "";
						var ordinal = 1;
						//console.log("---------------------------");
						var currentReorderNumber = 0;
						$('#fileUploadTable tbody tr').each(function ()
						{
							var currentImageKey = $(this).attr("ImageKey");

							if (vm.fileImageLibraryData) {
								vm.fileImageLibraryData.forEach(function (item)
								{
									if (item.ImageKey == currentImageKey)
									{
										item.Reordinal = currentReorderNumber += 10;
										if (item.Ordinal != item.Reordinal)
										{
											item.Ordinal = item.Reordinal;
											item.DescriptionModified = true;
											item.ModifierUserMasterId = securityService.GetCurrentUser().UserMasterId;
										}
									}

								});

							}

							uploader.queue.forEach(function(item) {
								if (item.ImageKey == currentImageKey)
								{
									item.Reordinal = currentReorderNumber += 10;
									if (item.Ordinal != item.Reordinal)
									{
										item.Ordinal = item.Reordinal;
										item.DescriptionModified = true;
										item.ModifierUserMasterId = securityService.GetCurrentUser().UserMasterId;
									}
								}
							});


							vm.SaveAllModifiedDescriptions();



							//Set the reorder field for all rows to a new number starting with 10, by 10
						});


					};



					if (!vm.readOnly) {
						
						$timeout(function ()
						{
							$('textarea').each(function (index, el)
							{
								el.style.height = "1px";
								el.style.height = (15 + el.scrollHeight) + "px";

							});
							$("#fileUploadTable tbody").sortable({
								helper: fixHelperModified,
								stop: updateIndex
							}).disableSelection();
						}, 150);
					}
				

					//////////////////////////////////////////////////
					//////////////////////////////////////////////////

					//Go and get the data from the file image library based on the image keys.
					//console.log("vm.imageKeys = %O", vm.imageKeys);

					function LoadList() {
						if (vm.imageKeys && vm.imageKeys.length > 0)
						{
							var list = vm.imageKeys.distinct().join(',');
							var reordinal = 0;


							vm.fileImageLibraryData = [];
							var url = fileImageLibraryServerBaseAddress + "ByImageKeyList?$format=application/json;odata.metadata=none";
							$http.post(url, list)
							.then(function (response)
							{
								var dataStruct = response.data.value.orderByDescending(function (f) { return f.CreationDate }).distinct(function (a, b) { return a.ImageKey == b.ImageKey });
								vm.fileImageLibraryData = dataStruct;
								//Setup the source url for the thumbnail if this is an image paste.
								vm.fileImageLibraryData.forEach(function (item)
								{
									var includeThumbnail = false;
									if (item.FileName == "Pasted Image")
									{
										includeThumbnail = true;
									}

									var fileExtension = item.FileName.split('.').pop().toLowerCase();
									////console.log(fileExtension);
									if (fileExtension == "jpg" || fileExtension == "png" || fileExtension == "jpg" || fileExtension == "gif" || fileExtension == "bmp")
									{
										includeThumbnail = true;
									}


									//Assign an icon for the file
									if (iconmenu.indexOf(fileExtension.toLowerCase()) > -1)
									{
										//This is an icon file display. Assign the right one.
										item.iconFile = "images/FileUpload/icon-" + fileExtension + ".png";
									}


									if (includeThumbnail)
									{
										item.thumbnailUrl = fileImageLibraryServerBaseAddress + "downloads/imagekey?ImageKey=" + item.ImageKey;
									}
									item.Reordinal = reordinal+=10;
									if (item.Ordinal != item.Reordinal) {
										item.Ordinal = item.Reordinal;
										item.DescriptionModified = true;
									}
									personnelService.GetPersonById(item.CreatorUserMasterId).then(function (person)
									{
										item.CreatorPerson = person;
									});
									personnelService.GetPersonById(item.ModifierUserMasterId).then(function (person)
									{
										item.ModifierPerson = person;
									});
								});
								//console.log("vm.fileImageLibraryData = %O", vm.fileImageLibraryData);
							});

						}

					}

					LoadList();


					$scope.$watchCollection("vm.imageKeys", function (newValue, oldValue)
					{
						if (oldValue != newValue)
						{

							//console.log("vm.imageKeys changed");
							//console.log("oldValue = %O", oldValue);
							//console.log("newValue = %O", newValue);

							//Find out What changed.
							var removedImageKeys = [];
							var addedImageKeys = [];

							//Collect the missing keys
							oldValue.forEach(function (oldKey) {
								var found = false;
								newValue.forEach(function(newKey) {
									if (oldKey == newKey) {
										found = true;
									}
								});
								if (!found) {
									removedImageKeys.push(oldKey);
								}
							});

							//Collect the added keys:
							newValue.forEach(function (newKey)
							{
								var found = false;
								oldValue.forEach(function (oldKey)
								{
									if (oldKey == newKey)
									{
										found = true;
									}
								});
								if (!found)
								{
									addedImageKeys.push(newKey);
								}
							});

							//console.log("removedImageKeys = %O", removedImageKeys);
							//console.log("addedImageKeys = %O", addedImageKeys);

							//Find the key in the previous and uploaded files and remove them.
							removedImageKeys.forEach(function(removedKey) {
								vm.fileImageLibraryData.forEach(function(item, index) {
									if (item.ImageKey == removedKey) {
										//console.log("Removing image key = " + removedKey + " at index " + index);
										vm.fileImageLibraryData.splice(index, 1);
									}
								});
								//console.log("vm.fileImageLibraryData is now %O", vm.fileImageLibraryData);

								uploader.queue.forEach(function(uploadedItem, index) {
									if (uploadedItem.fileImageLibraryEntry.ImageKey == removedKey) {
										uploader.queue.splice(index, 1);
									}
								});
							});


							//Add the new upload to the previous files collection
							addedImageKeys.forEach(function(newImageKey) {
								var url = "https://odataprod.utmb.edu/FileImageLibrary/ByImageKeyList?$format=application/json;odata.metadata=none";
								//var url = "http://localhost:41840/ByImageKeyList?$format=application/json;odata.metadata=none";
								$http.post(url, newImageKey)
								.then(function (response)
								{
									var item = response.data.value[0];
									if (item) {
										var includeThumbnail = false;
										if (item.FileName == "Pasted Image")
										{
											includeThumbnail = true;
										}

										var fileExtension = item.FileName.split('.').pop().toLowerCase();
										//console.log(fileExtension);
										if (fileExtension == "jpg" || fileExtension == "png" || fileExtension == "jpg" || fileExtension == "gif" || fileExtension == "bmp")
										{
											includeThumbnail = true;
										}


										//Assign an icon for the file
										if (iconmenu.indexOf(fileExtension.toLowerCase()) > -1)
										{
											//This is an icon file display. Assign the right one.
											item.iconFile = "images/FileUpload/icon-" + fileExtension + ".png";
										}


										if (includeThumbnail)
										{
											item.thumbnailUrl = "https://odatatest.utmb.edu/FileImageLibrary/downloads/imagekey?ImageKey=" + item.ImageKey;
										}
										if (!vm.fileImageLibraryData) {
											vm.fileImageLibraryData = [];
										}
										//vm.fileImageLibraryData.push(item);

									}
								});

							});

							//var uploaderImageKeys = [];
							//uploader.queue.forEach(function(item) {

							//});


							//if (uploader.queue.length > 0) {
							//	for (var i = 0; i < uploader.queue.length; i++) {
							//		if(uploader.queue[i].fileImageLibraryEntry.ImageKey)
							//	}
							//}
							//LoadList();
						}
					});

					vm.markDescriptionModified = function (item)
					{
						item.DescriptionModified = true;
					}

					
					var intHSize = (window.screen.availWidth) * .70;
					var intVSize = (window.screen.availHeight) * .70;
					var intTop = (window.screen.availHeight - intVSize) / 2;
					var intLeft = (window.screen.availWidth - intHSize) / 2;


					var strFeatures = "";

					set_window_size(.85);

					function set_window_size(sngWindow_Size_Percentage)
					{
						intHSize = (window.screen.availWidth) * sngWindow_Size_Percentage * .6;
						intVSize = (window.screen.availHeight) * sngWindow_Size_Percentage;
						intTop = (window.screen.availHeight - intVSize) / 2;
						intLeft = (window.screen.availWidth - intHSize) / 2;
						strFeatures = "top=" + intTop + ",left=" + intLeft + ",height=" + intVSize + ",width=" + intHSize + ", scrollbars=yes, resizable=yes, location=no";
					}

					if (uploader.isHTML5) {
						vm.showHtml5CtrlVInstruction = "(To paste a clipboard image here: click on this panel, then Ctrl-V)";
					}
					if (!vm.readOnly) {
						vm.panelSubtitle = "Drop files anywhere below. Descriptions are editable. Drag item to re-order. Esc to exit. " + vm.showHtml5CtrlVInstruction;
					}

					function window_open(strURL)
					{
						var SRWindow = window.open(strURL, "SRWindow", strFeatures);
					}

					vm.SaveAndClose = function() {
						//Iterate through the ss that have changed and save all of them.
						vm.SaveAllModifiedDescriptions();
						//console.log(uploader.queue);
						$state.go("^");

					}


					$scope.$on("FileImageLibrary.ImageKeyDescription Changed", function(event, data) {
						//console.log("FileImageLibrary.ImageKeyDescription Changed event received. Data = %O", data);
						//search our image key sets and see if one of them need to have the description changed.

					});

					vm.SaveAllModifiedDescriptions = function() {
						//Iterate through the ss that have changed and save all of them.
						if (vm.fileImageLibraryData)
						{

							vm.fileImageLibraryData.forEach(function (previousFile)
							{
								if (previousFile.DescriptionModified)
								{
									var dto = {
										ImageKey: previousFile.ImageKey,
										Description: previousFile.Description,
										Ordinal: previousFile.Ordinal,
										CreatorUserMasterId: previousFile.CreatorUserMasterId,
										ModifierUserMasterId: securityService.GetCurrentUser().UserMasterId
									}
									$odataresource(fileImageLibraryServerBaseAddress + "Downloads/SaveDescription/").update(dto).$promise.then(function (data) {
										//console.log("Downloads/SaveDescription/ returned data = %O", data);
										signalR.SignalAllClients("FileImageLibrary.ImageKeyDescription Changed", dto);
									});
									//save it
									previousFile.DescriptionModified = false;
								}
							});
						}
						uploader.queue.forEach(function (upload)
						{
							if (upload.DescriptionModified)
							{
								////console.log("upload item = %O", upload);
								var dto = {
									ImageKey: upload.fileImageLibraryEntry.ImageKey,
									Description: upload.Description,
									Ordinal: upload.Ordinal,
									CreatorUserMasterId: securityService.GetCurrentUser().UserMasterId
							}
								////console.log("dto = %O", dto);
								$odataresource(fileImageLibraryServerBaseAddress + "Downloads/SaveDescription/").update(dto);
								upload.DescriptionModified = false;
								signalR.SignalAllClients("FileImageLibrary.ImageKeyDescription Changed", dto);
							}
						});
					}




					vm.removeAllUploads = function ()
					{
						if (confirm("You have just chosen to remove and delete all the uploads below!. Are you sure you want to do this?")) {
							uploader.queue.forEach(function (uploadItem) {
								////console.log("upload item to be removed = %O", uploadItem);
								vm.removeUploadFunction()(uploadItem.fileImageLibraryEntry.ImageKey);
							});
							uploader.clearQueue();

							if (vm.fileImageLibraryData) {
								vm.fileImageLibraryData.forEach(function (previousFile)
								{
									vm.removeUploadFunction()(previousFile.ImageKey);
								});
								vm.fileImageLibraryData = null;

							}

						}
					}

					vm.receivedFile = function (file)
					{
						//console.log('received file!', file);
					}



					function handlePaste(e)
					{
						if (!vm.readOnly) {

							//console.log("Clipboard Data Items Count = %O", e.clipboardData.items.length);
							//console.log("Clipboard Data Files Count = %O", e.clipboardData.files.length);
							//console.log("Clipboard Data Types Count = %O", e.clipboardData.types.length);
							e.clipboardData.types.forEach(function(t) {
								//console.log(t);
							});

							for (var i = 0; i < e.clipboardData.items.length; i++)
							{

								//var items = (e.clipboardData || e.originalEvent.clipboardData).items;
								//for (var index in items)
								//{
								//	var item = items[index];
								//	if (item.kind === 'file')
								//	{
								//		var blob = item.getAsFile();
								//		var reader = new FileReader();
								//		reader.onload = function (event) {
								//			//console.log(event.target.result);
								//		}; // data url!
								//		reader.readAsDataURL(blob);
								//	}
								//}

								//console.log("e.clipboardData = %O", e.clipboardData);

								var item = (e.clipboardData || e.originalEvent.clipboardData).items[i];
								//console.log("item = %O", item);
								if (item.type.indexOf("image" == -1))
								{
									var pastedImageAsFile = item.getAsFile();
									//console.log("pastedImageAsFile = %O", pastedImageAsFile);
									var URLObj = window.URL || window.webkitURL;
									try {
										var sourceUrl = URLObj.createObjectURL(pastedImageAsFile);
										//console.log("sourceUrl = " + sourceUrl);
										pastedImageAsFile.name = "Pasted Image";
										pastedImageAsFile.imageDisplayUrl = sourceUrl;
										uploader.addToQueue(pastedImageAsFile);
										$timeout(function() {
											$scope.$apply();
										}, 100);

									} catch (err) {
										
									}
								} else
								{
									//console.log("Discardingimage paste data");
								}

								e.preventDefault();
							}

						}
					}

					$timeout(function ()
					{
						document.getElementById("pasteTarget").addEventListener("paste", handlePaste);
					}, 200);

					vm.viewItem = function (item)
					{
						var url = fileImageLibraryServerBaseAddress + "downloads/imagekey?ImageKey=" + item.ImageKey;
						window_open(url);


					}


					vm.ViewItemIfReadOnly = function (item)
					{
						if (vm.mode == "readOnly") {
							vm.viewItem(item);
						}
					}



					vm.imageSourceUrl = function(imageKey) {
						var url = "";
						////console.log(item);
						if (imageKey)
						{
							url = fileImageLibraryServerBaseAddress + "downloads/imagekey?ImageKey=" + imageKey;
						} 
					}


					// FILTERS

					uploader.filters.push({
						name: 'customFilter',
						fn: function (item /*{File|FileLikeObject}*/, options)
						{
							return this.queue.length < 1000;
						}
					});

					// CALLBACKS
					//$window.open('url', '_blank');

					uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options)
					{
						//console.info('onWhenAddingFileFailed', item, filter, options);
					};
					uploader.onAfterAddingFile = function (fileItem) {
						////console.log("fileItem uploading = %O", fileItem);
						fileItem.upload();
						//Assign an icon for the file
						var fileExtension = fileItem.file.name.split('.').pop();
						if (iconmenu.indexOf(fileExtension.toLowerCase()) > -1)
						{
							//This is an icon file display. Assign the right one.
							fileItem.iconFile = "images/FileUpload/icon-" + fileExtension + ".png";
						}
						fileItem.DescriptionModified = false;
						//console.info('onAfterAddingFile', fileItem);
					};
					uploader.onAfterAddingAll = function (addedFileItems)
					{
						//console.info('onAfterAddingAll', addedFileItems);
					};
					uploader.onBeforeUploadItem = function (item)
					{
						//console.info('onBeforeUploadItem', item);
					};
					uploader.onProgressItem = function (fileItem, progress)
					{
						//console.info('onProgressItem', fileItem, progress);
					};
					uploader.onProgressAll = function (progress)
					{
						//console.info('onProgressAll', progress);
					};
					uploader.onSuccessItem = function (fileItem, response, status, headers)
					{
						var alreadyPresent = false;
						////console.log("Server response from upload = %O", response);
						////console.log("fileItem = %O", fileItem);
						uploader.queue.forEach(function (item)
						{
							if (item.fileImageLibraryEntry && item.fileImageLibraryEntry.ImageKey == response.ImageKey)
							{
								alreadyPresent = true;
							}
						});
						if (vm.fileImageLibraryData) {
							
							vm.fileImageLibraryData.forEach(function (item)
							{
								if (item.ImageKey == response.ImageKey)
								{
									alreadyPresent = true;
								}

							});
						}


						var fileDataObject = {
							ImageKey: response.ImageKey,
							size: {
								original: response.intOriginal_Size,
								compressed: response.intCompressed_Size
							},
							name: response.strFilename
						}
						fileItem.ImageKey = response.ImageKey;
						fileItem.FileName = response.strFilename;
						fileItem.CreatorUserMasterId = securityService.GetCurrentUser().UserMasterId;
						fileItem.CreatorPerson = vm.CurrentUserPerson;
						fileItem.fileImageLibraryEntry = fileDataObject;
						////console.log("fileDataObject before description = %O", fileDataObject);
						if (response.Description == null || response.Description == "") {
							fileItem.Description = fileItem.file.name.split('.').shift();
							
						} else {
							
							fileItem.Description = response.Description;
						}
						var includeThumbnail = false;

						var fileExtension = fileItem.file.name.split('.').pop().toLowerCase();
						if (fileExtension == "jpg" || fileExtension == "png" || fileExtension == "gif" || fileExtension == "bmp")
						{
							includeThumbnail = true;
						}


						if (includeThumbnail)
						{
							fileItem.thumbnailUrl = fileImageLibraryServerBaseAddress + "downloads/imagekey?ImageKey=" + response.ImageKey;
						}
						//Only call the add upload function for the file image if it was not already there
						if (!alreadyPresent) {
							vm.imageKeys.push(fileDataObject.ImageKey);
							//console.log("ImageKeys array = %O", vm.imageKeys);
							//console.log("FileUploadDirective about to call the upload external function with an ImageKey = " + fileDataObject.ImageKey);
							vm.addUploadFunction()(fileDataObject.ImageKey);
							//console.log("Finished calling the external upload function");
						}


						fileItem.Ordinal = uploadReordinal++;

						$timeout(function ()
						{
							$('textarea').each(function (index, el)
							{
								el.style.height = "1px";
								el.style.height = (15 + el.scrollHeight) + "px";

							});
						}, 150);
						fileItem.DescriptionModified = true;
						//console.info('onSuccessItem', fileItem, response, status, headers);
					};

					vm.removeUploaderItem = function (item)
					{
						if (confirm("You have just chosen to remove and delete an upload!. Are you sure you want to do this?"))
						{
							vm.removeUploadFunction()(item.fileImageLibraryEntry.ImageKey);
							item.remove();
						}

					}

					vm.removePreviousFile = function (previousFile)
					{
						if (confirm("You have just chosen to remove and delete an upload!. Are you sure you want to do this?"))
						{
							//Find the file in the local array and get rid of it
							for (var i = 0; i < vm.fileImageLibraryData.length; i++)
							{
								if (vm.fileImageLibraryData[i].ImageKey == previousFile.ImageKey)
								{
									vm.fileImageLibraryData.splice(i, 1);
								}
							}



							vm.removeUploadFunction()(previousFile.ImageKey);

							//The above is equivalent to:
							//var func = vm.removeUploadFunction();
							//func(previousFile.ImageKey);
						}

					}
					uploader.onErrorItem = function (fileItem, response, status, headers)
					{
						//console.info('onErrorItem', fileItem, response, status, headers);
					};
					uploader.onCancelItem = function (fileItem, response, status, headers)
					{
						//console.info('onCancelItem', fileItem, response, status, headers);
					};
					uploader.onCompleteItem = function (fileItem, response, status, headers)
					{
						//console.info('onCompleteItem', fileItem, response, status, headers);
					};
					uploader.onCompleteAll = function ()
					{
						//console.info('onCompleteAll');
						//console.log("Queue = %O", uploader.queue);
					};

					//console.info('uploader', uploader);

					$timeout(function ()
					{
						displaySetupService.SetPanelDimensions();
					}, 100);


					hotkeys.bindTo($scope)
						.add({
							combo: 'esc',
							allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
							callback: function ()
							{
								vm.SaveAllModifiedDescriptions();
								$timeout(function() {
									$state.go("^");
								}, 150);

							}
						});


				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "angular/common/directives/panels/fileUploadListDirectiveTemplate.html?" + Date.now(),

					scope: {
						
						imageKeys: "=",
						listTitle: "@",
						removeUploadFunction: "&",
						updateDescriptionFunction: "&",
						addUploadFunction: "&",
						hideCloseButton: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
	]);

}());