(function () {
	"use strict";


	function UtilityService($rootScope, $timeout, $parse, signalR) {

		var service = {};

		service.ReplaceItemInArrayById = function (arr, item) {
			var replaced = false;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].Id == item.Id) {
					arr[i] = item;
					replaced = true;
					break;
				}
			}
			//Add the item if it was not replaced by the loop above.
			if (!replaced) {
				arr.push(item);
			}
		};

		service.GetQuerystringParameterByName = function (name) {
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
				results = regex.exec(location.search);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		}

		service.ReplaceItemInArrayByIdOnlyIfPresent = function (arr, item) {
			var replaced = false;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].Id == item.Id) {
					arr[i] = item;
					replaced = true;
					break;
				}
			}
		};


		service.ToFixed = function (number, fractionSize) {
			var fixed = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);
			fixed = fixed.toString();
			//console.log(fixed);
			if (fixed.indexOf('.') < 0) {
				fixed += '.0';
			}
			return fixed;
		}



		service.SecondsToString = function (seconds) {
			if (!seconds) {
				return '';
			}
			if (seconds == "NULL") {
				return '';
			}
			if (seconds == "null") {
				return '';
			}
			if (+seconds != seconds) {
				return '';
			}


			var numdays = Math.floor(seconds / 86400);
			var numhours = Math.floor((seconds % 86400) / 3600);
			var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
			var numseconds = ((seconds % 86400) % 3600) % 60;
			return (numdays > 0 ? numdays + (numdays == 1 ? ' day ' : ' days ') : '') + (numhours > 9 ? numhours : '0' + numhours) + ":" + (numminutes > 9 ? numminutes : '0' + numminutes) + ":" + (numseconds > 9 ? numseconds : '0' + numseconds);
		}

		service.DateDifferenceToString = function (startDate, endDate) {
			var seconds = (moment.utc(moment(endDate, "DD/MM/YYYY HH:mm:ss").diff(moment(startDate, "DD/MM/YYYY HH:mm:ss")))) / 1000;
			return service.SecondsToString(seconds);
		}

		service.GetElapsedTimeAsDisplayString = function (startDate, endDate) {

			var seconds = (moment.utc(moment(endDate, "DD/MM/YYYY HH:mm:ss").diff(moment(startDate, "DD/MM/YYYY HH:mm:ss")))) / 1000;
			return service.SecondsToString(seconds);

		}

		service.RemoveItemFromArrayById = function (arr, item) {
			if (item) {
				for (var i = 0; i < arr.length; i++) {
					var itemId = item.Id;
					if (!itemId) {
						itemId = item;
					}
					if (arr[i].Id == itemId) {
						//console.log("removing %O", item);
						arr.splice(i, 1);
						break;
					}
				}
			}
		}

		service.IsItemInArray = function (arr, item) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].Id == item.Id) {
					return true;
				}
			}
			return false;
		}

		service.GetFormattedDisplayDate = function (d) {
			return moment(d).format("YYYY-MM-DD HH:mm:ss");
		}

		service.GetFormattedLocalDisplayDateFromUTCDate = function (d) {
			return moment(service.GetLocalDateFromUTCDate(d)).format("YYYY-MM-DD HH:mm:ss");
		}

		service.GetHighResolutionFormattedDisplayDate = function (d) {
			return moment(d).format("YYYY-MM-DD HH:mm.SSS");
		}

		service.GetFormattedDisplayDateOnly = function (d) {
			return moment(d).format("MM/DD/YYYY");
		}

		service.SetupSelectpickerDropdown = function (scope, fieldName) {

			scope.$$postDigest(function () {
				var fieldLabel = fieldName.split('.').pop();
				var getter = $parse(fieldName);

				//console.log(getter(scope));
				var jquerySelectorString = "#" + fieldLabel;

				//console.log($(jquerySelectorString));
				$(jquerySelectorString).selectpicker();

				$(jquerySelectorString).on('change', function () {
					//console.log("selectpicker " + fieldName + " changed------------------------------------");
					var value = $(jquerySelectorString + " > option:selected").val();
					getter.assign(scope, value);
					$timeout(function () {
						scope.$apply();
					}, 1);
				});
				$(jquerySelectorString).selectpicker('val', getter(scope));

			});

		}

		service.FormatNumberWithCommas = function (x) {
			var parts = x.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		}

		function translateMomentDateToJavascriptDate(momentDate) {
			var dateValue = momentDate._d;

			//var returnDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), dateValue.getHours(), dateValue.getMinutes(), dateValue.getSeconds(), dateValue.getMilliseconds());
			return dateValue;
		}

		var timeZoneOffsetHoursFromUTC = (new Date().getTimezoneOffset()) / 60;
		console.log("utilityService timeZoneOffsetHoursFromUTC = %O", timeZoneOffsetHoursFromUTC);


		service.GetLocalDateFromUTCDate = function (utcDate) {
			if (utcDate) {
				//console.log("================================================");
				//console.log("UTCDate = %O", utcDate);
				var newDate = moment(utcDate).subtract(timeZoneOffsetHoursFromUTC, 'hours');
				var localDate = translateMomentDateToJavascriptDate(newDate);
				//console.log("Local Date = %O", localDate);
				return localDate;
			}
		}

		service.GetUTCDateFromLocalDate = function (localDate) {
			if (localDate) {
				//console.log("================================================");
				//console.log("localDate = %O", localDate);
				var functionLocalDate = angular.copy(localDate);
				functionLocalDate.setHours(functionLocalDate.getHours() + timeZoneOffsetHoursFromUTC);
				//console.log("UTC Date Equivalent = %O", functionLocalDate);

				return functionLocalDate;
			}
		}

		service.GetLocalDateFromUTCDateString = function (utcDate) {
			if (utcDate) {

				//console.log("================================================");
				//console.log("localDate = %O", localDate);
				var functionLocalDate = new Date(angular.copy(utcDate));
				functionLocalDate.setHours(functionLocalDate.getHours() - timeZoneOffsetHoursFromUTC);
				//console.log("UTC Date Equivalent = %O", functionLocalDate);

				return functionLocalDate;
			}
		}

		service.FormatDateToODataParameter = function (inputDate) {
			return moment(inputDate).format("YYYY-MM-DDTHH:mm:ss");
		}

		service.FormatSaveDate = function (inputDate) {
			return moment(inputDate).format("YYYY-MM-DDTHH:mm:ss");
		}

		service.GetUTCQueryDate = function (inputDate) {
			//var newDate = moment(inputDate).add(timeZoneOffsetHoursFromUTC, 'hours');
			//return translateMomentDateToJavascriptDate(newDate);
			var newDate = moment(inputDate);
			return translateMomentDateToJavascriptDate(newDate);
		}
		service.GetUTCQueryDateMinutesAgo = function (inputDate) {
			//var newDate = moment(inputDate).add(timeZoneOffsetHoursFromUTC, 'hours');
			//return translateMomentDateToJavascriptDate(newDate);
			var newDate = moment(inputDate);
			return translateMomentDateToJavascriptDate(newDate);
		}

		service.GetODataQueryDateFromUTCDate = function (inputDate) {
			var newDate = moment(inputDate).subtract(timeZoneOffsetHoursFromUTC, 'hours');
			return translateMomentDateToJavascriptDate(newDate);
		}





		service.GetNonUTCQueryDate = function (inputDate) {
			var newDate = moment(inputDate);
			return translateMomentDateToJavascriptDate(newDate);
		}


		service.GetQueryDateForNow = function () {
			var newDate = moment().add(timeZoneOffsetHoursFromUTC, 'hours');
			return translateMomentDateToJavascriptDate(newDate);
		}

		service.GetQueryDateSecondsAgo = function (secondsToSubtract) {
			var newDate = (moment().add(timeZoneOffsetHoursFromUTC, 'hours')).subtract(secondsToSubtract, 'seconds');
			return translateMomentDateToJavascriptDate(newDate);
		}

		service.GetQueryDateMinutesAgo = function (minutesToSubtract) {
			var newDate = (moment().add(timeZoneOffsetHoursFromUTC, 'hours')).subtract(minutesToSubtract, 'minutes');
			return translateMomentDateToJavascriptDate(newDate);
		}

		service.GetQueryDateHoursAgo = function (hoursToSubtract) {
			var newDate = (moment().add(timeZoneOffsetHoursFromUTC, 'hours')).subtract(hoursToSubtract, 'hours');
			return translateMomentDateToJavascriptDate(newDate);
		}

		service.GetQueryDateDaysAgo = function (daysToSubtract) {
			var newDate = (moment().add(timeZoneOffsetHoursFromUTC, 'hours')).subtract(daysToSubtract, 'days');
			return translateMomentDateToJavascriptDate(newDate);
		}



		service.GetOdataUpdateableCurrentDateTime = function () {
			var utc = new Date().toISOString();
			console.log("utc = %O", utc);
			return utc;
		}



		service.DeleteResourceItemWithConfirmation = function (item, itemTypeName, containingCollection, deleteMessageToUser, odataSourceName, odataCollectionName) {

			alertify.set({
				labels: {
					ok: "Yes, Delete the " + itemTypeName,
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});
			var message = 'Are you SURE you want to delete this ' + itemTypeName + '? ';
			if (deleteMessageToUser) {
				message = deleteMessageToUser;
			}

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"
					item.$delete();
					service.RemoveItemFromArrayById(containingCollection, item);
					if (odataSource && odataCollection) {
						signalR.SignalAllClients(odataSourceName + "." + odataCollectionName + " Deleted", item.Id);
					}



					toastr.success(item.Name, itemTypeName + " was deleted!");

				} else {
					// user clicked "no"
					toastr.info(item.Name, itemTypeName + " was NOT deleted!");
				}
			});




		}

		return service;
	}


	angular
		.module("app")
		.factory('utilityService', ['$rootScope', '$timeout', '$parse', "signalR", UtilityService]);



}());	//UtilityService
