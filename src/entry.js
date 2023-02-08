import './js/markdown-viewer-webcomponent.js';

export default class MarkdownViewerData {
	
  /*------------------------------- FIELD TEMPLATE --------------------------------------*/
  getTemplate() {
    return {
      constructor: 'file',
      name: 'Markdown viewer',
      icon: 'code_editor',
      model: {
        'field_id': 0,
        'field_name': 'Markdown viewer',
        'field_value': '',
        'data_id': 0,
        'data_type': 'markdown_viewer',
        'file_name': '',
        data_model: {
          interpretation: [{
            src: 'form',
            id: 'default',
            settings: {
              editable: 1,
              show_field_name: 1,
              show_field: 1
            },
            style: {position: "beetwen"}
          }]
        }
      }
    };
  }

  /*------------------------------- ACTION INTERPRETATION --------------------------------------*/

  getInterpretation(gudhub, value, appId, itemId, field_model) {
    
    return [{
      id: 'default',
      name: 'Default',
      content: ()=>
      '<markdown-viewer gh-model="{{field_model}}" app-id="{{appId}}" item-id="{{itemId}}" field-id="{{fieldId}}" field-value="{{field_model.field_value}}" class="markdown-viewer"></markdown-viewer>'
    },{
      id:'value',
      name: 'Value',
      content: () => value
    }];
  }
  /*--------------------------  ACTION SETTINGS --------------------------------*/
  getSettings(scope) {
    return [{
      title: 'Options',
      type: 'general_setting',
      icon: 'menu',
      columns_list: []
    }];
  }
}



angular.module('markdownViewerData', [])

/*=======================================================================================================*/
/*====================================  CODE EDITOR DATA   ==========================================*/
/*=======================================================================================================*/


.factory('markdown_viewer', function($q) {
  const markdownViewerData = new MarkdownViewerData();
  return {
    getTemplate: function () {
      return markdownViewerData.getTemplate();
    },
    getSettings: function (scope) {
      return markdownViewerData.getSettings(scope);
    },

    getInterpretation: function (value) {
      return markdownViewerData.getInterpretation(value);
    }
    
  };
});
