
define([
], function() {
	'use strict';

	class MyCustomWidget {
		constructor(options) {
            this.content = options.content;
            this.canvas = options.features['Canvas'];

            this.content.on('change:property:myInputProperty', () => this.renderControl());
            this.content.on('change:property:myToggleProperty', () => this.renderControl());
            this.content.on('change:property:myDropDownProperty', () => this.renderControl());
        }

		getAPI() {
			return {
				render: (options) => this.render(options)
			}
        }

        destroy() {
        }  

        renderControl() {
             this.parentNode.innerHTML = '<div> This is a sample widget:' +  
             '<br> myInputProperty is '+ this.content.getPropertyValue('myInputProperty') + 
             '<br> myToggleProperty is '+ this.content.getPropertyValue('myToggleProperty') + 
             '<br> myDropDownProperty is '+ this.content.getPropertyValue('myDropDownProperty') + 
             '</div>';
        }

		render(options){
            this.parentNode = options.parent;
            this.renderControl();
            return Promise.resolve();
        }
	
	}


	return MyCustomWidget;

});
