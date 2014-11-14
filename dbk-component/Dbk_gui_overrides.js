var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.gui = dbkjs.gui || {};

dbkjs.gui.createRefreshButton = function(){
    //dummy
};
// jsonDBK.js
dbkjs.gui.detailsPanelHide = function() {
    dbkjs.dbkComp.detailsPanel.hide();
};
// jsonDBK.js
dbkjs.gui.detailsPanelShow = function() {
    dbkjs.dbkComp.detailsPanel.show();
};
// jsonDBK.js
dbkjs.gui.detailsPanelUpdateHtml = function(html) {
    dbkjs.dbkComp.detailsPanel.updateHtml(html);
};
// jsonDBK.js
dbkjs.gui.detailsPanelUpdateTitle = function(text) {
    dbkjs.dbkComp.detailsPanel.updateTitle('<span class="h4"><i class="fa fa-info-circle"></i> &nbsp;' + text + '</span>');
};
// feature.js
dbkjs.gui.infoPanelAddItems = function(html) {
    var s = dbkjs.util.outerHtml(html);
    dbkjs.dbkComp.infoPanel.updateHtml(s);
};
// feature.js
dbkjs.gui.infoPanelAddPagination = function() {
    dbkjs.dbkComp.infoPanel.updateFooterHtml('<ul id="Pagination" class="pagination"></ul>');
};
// feature.js
dbkjs.gui.infoPanelHide = function() {
    dbkjs.dbkComp.infoPanel.hide();
};
// feature.js
dbkjs.gui.infoPanelShow = function() {
    dbkjs.dbkComp.infoPanel.show();
};
// feature.js
dbkjs.gui.infoPanelShowFooter = function() {
    dbkjs.gui.infoPanelShow();
};
// feature.js
dbkjs.gui.infoPanelUpdateHtml = function(html) {
    dbkjs.dbkComp.infoPanel.updateHtml(html);
};
// jsonDBK.js
dbkjs.gui.infoPanelUpdateFooterHtml = function(html) {
    dbkjs.dbkComp.infoPanel.updateFooterHtml(html);
};
// jsonDBK.js
dbkjs.gui.infoPanelUpdateTitle = function(text) {
    dbkjs.dbkComp.infoPanel.updateTitle('<span class="h4">' + text + '</span>');
};
dbkjs.gui.setLogo = function() {
    //dummy
};
// feature.js
dbkjs.gui.showError = function(errMsg) {
    dbkjs.viewerController.logger.error(errMsg);
};
// feature.js
dbkjs.gui.updateSearchInput = function(_obj,dbk_naam_array) {
    //dummy
};


