define([
], function() {
	'use strict';

	class Renderer {
		constructor(options) {
            this.content = options.content;
            this.canvas  = options.features['Dashboard.Canvas'];
            this.listnerers = [];
            this.dataSelection = null;

            // re-render when a property value changes
            this.listnerers.push(this.canvas.on('change:content:selections:select', (e) => {
                console.log(e);
                const dataSelectionOrigin = this.canvas.getContent(e.info.contentId);
                // If the the custom widget has the same parent as the originating visualization, then refresh the control
                // 
                if(dataSelectionOrigin.getContainer() === this.content.getContainer()){

                    const selections = e.info.value;
                    const dataPointLabels= [];
                    selections.forEach((selection) => {
                        selection.categories.forEach((category) => {
                            dataPointLabels.push(category.label);
                        });
                    });
                    this.datapoints = dataPointLabels.join();
                    this.renderControl()
                }
            }));

            // re-render when a property value changes
            this.content.on('change:property:url', () => this.renderControl());
        }

		getAPI() {
			return {
				render: (domNode) => this.render(domNode)
			}
        }

        destroy() {
            // cleanup registered listeners
            this.listnerers.forEach(listener => listener.remove())
        }  
        
        getSelectedDataPoints() {
            return this.datapoints || '';
        }

        renderControl() {
            // remove previous content-- yes, we could enhance this and re-user the iframe
            if (this.contentNode){
                this.contentNode.remove();
            }
            let url = this.content.getPropertyValue('url');
            if (url){
                const datapoints = this.getSelectedDataPoints();
                url = url.replace('{DATAPOINTS}', encodeURIComponent(datapoints))
                this.contentNode = document.createElement('iframe');
                this.contentNode.src = url;
            } else {
                this.contentNode = document.createElement('div');
                this.contentNode.innerHTML = 'Provide a url property'
            } 
            this.parentNode.appendChild(this.contentNode);
        }

		render(options){
            this.parentNode = options.parent;
            this.renderControl();
            return Promise.resolve();
        }
	
	}

	return Renderer;

});
