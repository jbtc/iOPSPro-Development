/*
@license
dhtmlxScheduler v.4.3.1 

This software is covered by DHTMLX Commercial License. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler.attachEvent("onTimelineCreated",function(e){"tree"==e.render&&(e.y_unit_original=e.y_unit,e.y_unit=scheduler._getArrayToDisplay(e.y_unit_original),scheduler.attachEvent("onOptionsLoadStart",function(){e.y_unit=scheduler._getArrayToDisplay(e.y_unit_original)}),scheduler.form_blocks[e.name]={render:function(e){var t="<div class='dhx_section_timeline' style='overflow: hidden; height: "+e.height+"px'></div>";return t},set_value:function(e,t,a,r){var n=scheduler._getArrayForSelect(scheduler.matrix[r.type].y_unit_original,r.type);

e.innerHTML="";var i=document.createElement("select");e.appendChild(i);var l=e.getElementsByTagName("select")[0];!l._dhx_onchange&&r.onchange&&(l.onchange=r.onchange,l._dhx_onchange=!0);for(var d=0;d<n.length;d++){var s=document.createElement("option");s.value=n[d].key,s.value==a[scheduler.matrix[r.type].y_property]&&(s.selected=!0),s.innerHTML=n[d].label,l.appendChild(s)}},get_value:function(e,t,a){return e.firstChild.value},focus:function(e){}})}),scheduler.attachEvent("onBeforeSectionRender",function(e,t,a){
var r={};if("tree"==e){var n,i,l,d,s,o;t.children?(n=a.folder_dy||a.dy,a.folder_dy&&!a.section_autoheight&&(l="height:"+a.folder_dy+"px;"),i="dhx_row_folder",d="dhx_matrix_scell folder",s="<div class='dhx_scell_expand'>"+(t.open?"-":"+")+"</div>",o=a.folder_events_available?"dhx_data_table folder_events":"dhx_data_table folder"):(n=a.dy,i="dhx_row_item",d="dhx_matrix_scell item"+(scheduler.templates[a.name+"_scaley_class"](t.key,t.label,t)?" "+scheduler.templates[a.name+"_scaley_class"](t.key,t.label,t):""),
s="",o="dhx_data_table");var _="<div class='dhx_scell_level"+t.level+"'>"+s+"<div class='dhx_scell_name'>"+(scheduler.templates[a.name+"_scale_label"](t.key,t.label,t)||t.label)+"</div></div>";r={height:n,style_height:l,tr_className:i,td_className:d,td_content:_,table_className:o}}return r});var section_id_before;scheduler.attachEvent("onBeforeEventChanged",function(e,t,a){if(scheduler._isRender("tree"))for(var r=scheduler._get_event_sections?scheduler._get_event_sections(e):[e[scheduler.matrix[scheduler._mode].y_property]],n=0;n<r.length;n++){
var i=scheduler.getSection(r[n]);if(i&&"undefined"!=typeof i.children&&!scheduler.matrix[scheduler._mode].folder_events_available)return a||(e[scheduler.matrix[scheduler._mode].y_property]=section_id_before),!1}return!0}),scheduler.attachEvent("onBeforeDrag",function(e,t,a){if(scheduler._isRender("tree")){var r,n=scheduler._locate_cell_timeline(a);if(n&&(r=scheduler.matrix[scheduler._mode].y_unit[n.y].key,"undefined"!=typeof scheduler.matrix[scheduler._mode].y_unit[n.y].children&&!scheduler.matrix[scheduler._mode].folder_events_available))return!1;

var i=scheduler.getEvent(e),l=scheduler.matrix[scheduler._mode].y_property;section_id_before=i&&i[l]?i[l]:r}return!0}),scheduler._getArrayToDisplay=function(e){var t=[],a=function(e,r){for(var n=r||0,i=0;i<e.length;i++)e[i].level=n,"undefined"!=typeof e[i].children&&"undefined"==typeof e[i].key&&(e[i].key=scheduler.uid()),t.push(e[i]),e[i].open&&e[i].children&&a(e[i].children,n+1)};return a(e),t},scheduler._getArrayForSelect=function(e,t){var a=[],r=function(e){for(var n=0;n<e.length;n++)scheduler.matrix[t].folder_events_available?a.push(e[n]):"undefined"==typeof e[n].children&&a.push(e[n]),
e[n].children&&r(e[n].children,t)};return r(e),a},scheduler._toggleFolderDisplay=function(e,t,a){var r,n=function(e,t,a,i){for(var l=0;l<t.length&&(t[l].key!=e&&!i||!t[l].children||(t[l].open="undefined"!=typeof a?a:!t[l].open,r=!0,i||!r));l++)t[l].children&&n(e,t[l].children,a,i)},i=scheduler.getSection(e);"undefined"!=typeof t||a||(t=!i.open),scheduler.callEvent("onBeforeFolderToggle",[i,t,a])&&(n(e,scheduler.matrix[scheduler._mode].y_unit_original,t,a),scheduler.matrix[scheduler._mode].y_unit=scheduler._getArrayToDisplay(scheduler.matrix[scheduler._mode].y_unit_original),
scheduler.callEvent("onOptionsLoad",[]),scheduler.callEvent("onAfterFolderToggle",[i,t,a]))},scheduler.attachEvent("onCellClick",function(e,t,a,r,n){scheduler._isRender("tree")&&(scheduler.matrix[scheduler._mode].folder_events_available||"undefined"!=typeof scheduler.matrix[scheduler._mode].y_unit[t]&&"undefined"!=typeof scheduler.matrix[scheduler._mode].y_unit[t].children&&scheduler._toggleFolderDisplay(scheduler.matrix[scheduler._mode].y_unit[t].key))}),scheduler.attachEvent("onYScaleClick",function(e,t,a){
scheduler._isRender("tree")&&"undefined"!=typeof t.children&&scheduler._toggleFolderDisplay(t.key)}),scheduler.getSection=function(e){if(scheduler._isRender("tree")){var t,a=function(e,r){for(var n=0;n<r.length;n++)r[n].key==e&&(t=r[n]),r[n].children&&a(e,r[n].children)};return a(e,scheduler.matrix[scheduler._mode].y_unit_original),t||null}},scheduler.deleteSection=function(e){if(scheduler._isRender("tree")){var t=!1,a=function(e,r){for(var n=0;n<r.length&&(r[n].key==e&&(r.splice(n,1),t=!0),!t);n++)r[n].children&&a(e,r[n].children);

};return a(e,scheduler.matrix[scheduler._mode].y_unit_original),scheduler.matrix[scheduler._mode].y_unit=scheduler._getArrayToDisplay(scheduler.matrix[scheduler._mode].y_unit_original),scheduler.callEvent("onOptionsLoad",[]),t}},scheduler.deleteAllSections=function(){scheduler._isRender("tree")&&(scheduler.matrix[scheduler._mode].y_unit_original=[],scheduler.matrix[scheduler._mode].y_unit=scheduler._getArrayToDisplay(scheduler.matrix[scheduler._mode].y_unit_original),scheduler.callEvent("onOptionsLoad",[]));

},scheduler.addSection=function(e,t){if(scheduler._isRender("tree")){var a=!1,r=function(e,n,i){if(t)for(var l=0;l<i.length&&(i[l].key==n&&"undefined"!=typeof i[l].children&&(i[l].children.push(e),a=!0),!a);l++)i[l].children&&r(e,n,i[l].children);else i.push(e),a=!0};return r(e,t,scheduler.matrix[scheduler._mode].y_unit_original),scheduler.matrix[scheduler._mode].y_unit=scheduler._getArrayToDisplay(scheduler.matrix[scheduler._mode].y_unit_original),scheduler.callEvent("onOptionsLoad",[]),a}},scheduler.openAllSections=function(){
scheduler._isRender("tree")&&scheduler._toggleFolderDisplay(1,!0,!0)},scheduler.closeAllSections=function(){scheduler._isRender("tree")&&scheduler._toggleFolderDisplay(1,!1,!0)},scheduler.openSection=function(e){scheduler._isRender("tree")&&scheduler._toggleFolderDisplay(e,!0)},scheduler.closeSection=function(e){scheduler._isRender("tree")&&scheduler._toggleFolderDisplay(e,!1)};
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_treetimeline.js.map