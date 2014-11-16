function UIPanel(name) {

  'use strict';

  var that    = this;

  that.create = function (name) {
    this.panel = $('<div class="ui-panel"></div>')
      .attr('id', name + '-panel');
    this.panelTop = $('<div class="ui-panel-top"></div>')
      .attr('id', name + '-panel-top')
      .appendTo(this.panel);
    this.toolbar = $('<div class="ui-toolbar"></div>')
      .attr('id', name + '-toolbar')
      .appendTo(this.panelTop);
    this.toolbarLeft = $('<div class="ui-toolbar-left"></div>')
      .attr('id', name + '-ui-toolbar-left')
      .appendTo(this.toolbar);
    this.toolbarCenter = $('<div class="ui-toolbar-center"></div>')
      .attr('id', name + '-ui-toolbar-center')
      .appendTo(this.toolbar);
    this.toolbarRight = $('<div class="ui-toolbar-right"></div>')
      .attr('id', name + '-ui-toolbar-right')
      .appendTo(this.toolbar);
    this.panelMiddle = $('<div class="ui-panel-middle"></div>')
      .attr('id', name + '-ui-panel-middle')
      .appendTo(this.panel);
    this.panelLeft = $('<div class="ui-panel-left"></div>')
      .attr('id', name + '-ui-panel-left')
      .appendTo(this.panelMiddle);
    this.panelCenter = $('<div class="ui-panel-center"></div>')
      .attr('id', name + '-ui-panel-center')
      .appendTo(this.panelMiddle);
    this.panelRight = $('<div class="ui-panel-right"></div>')
      .attr('id', name + '-ui-panel-right')
      .appendTo(this.panelMiddle);
    this.panelBottom = $('<div class="ui-panel-bottom"></div>')
      .attr('id', name + '-ui-panel-bottom')
      .appendTo(this.panel);
    return this.panel;
  };

  that.addToolbarButton = function(position, id, text, icon) {
    var button = $('<button class="ui-toolbar-button">' + text + '</button>')
      .attr('id', id);
    if (icon !== '') {
      $('<i class="fa ' + icon + ' fa-2x ui-color-gray"></i>')
        .appendTo(button);
    }
    switch (position) {
      case 'left': 
        button.appendTo(this.toolbarLeft);
        break;
      case 'center': 
        button.appendTo(this.toolbarCenter);
        break;
      case 'right': 
        button.appendTo(this.toolbarRight);
        break;
    }
  };

  that.toggle = function(panel) {
    switch(panel) {
      case 'top' :
        break;
      case 'right' :
        // $(this.panel).toggleClass('ui-panel-right-push');
        $(this.panel).toggleClass('ui-panel-right-open');
        break;
      case 'bottom' :
        break;
      case 'left' :
        // $(this.panel).toggleClass('ui-panel-left-push');
        $(this.panel).toggleClass('ui-panel-left-open');
        break;
    }
  };
}
