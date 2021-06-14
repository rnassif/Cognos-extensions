define([], function () {
    'use strict';

    class Renderer {
        constructor(options) {
            this.content = options.content;
            this.canvas = options.features['Dashboard.Canvas'];

            // monitor content selection and refresh
            this.selectionMonitor = this.canvas.on('change:selections', () => {
                this.renderContent();
            });
        }

        getAPI() {
            return {
                render: (domNode) => this.render(domNode)
            };
        }

        renderContent() {
            let html = '<h1>Select one visualization to display some data stats</h1>'
            const selected = this.canvas.getSelectedContentList();
            if (selected.length === 1) {
                const vizDataStats = selected[0].getFeature('VizDataStats');
                if (vizDataStats) {
                    html = '';
                    const stats = vizDataStats.getStats();
                    for (let label in stats) {
                        html += '<div class="header">' + label + '</div>';
                        html += '<div class="section">'

                        html += '<div class="stat">'
                        html += '<div class="header">Average</div>';
                        html += '<div class="content">' + stats[label].avg.value + '</div>';
                        html += '</div>'


                        html += '<div class="stat">'
                        html += '<div class="header">Min</div>';
                        html += '<div class="content">';
                        html += '<div>' + stats[label].min.attributesLabel + '</div>';
                        html += '<div>' + stats[label].min.value + '</div>';
                        html += '</div>';
                        html += '</div>'


                        html += '<div class="stat">'
                        html += '<div class="header">Max</div>';
                        html += '<div class="content">';
                        html += '<div>' + stats[label].max.attributesLabel + '</div>';
                        html += '<div>' + stats[label].max.value + '</div>';
                        html += '</div>';
                        html += '</div>';

                        html += '</div>'
                    }

                    if (!html) {
                        html = "<h1>The selected visualization does not contain any fact column</h1>"
                    }
                }
            }

            this.parentNode.innerHTML = html;
        }

        render(options) {
            this.parentNode = document.createElement('div');
            this.parentNode.className = 'vizDataStats';
            options.parent.appendChild(this.parentNode);
            this.renderContent();
            return Promise.resolve();
        }


        destroy() {
            this.selectionMonitor.remove();
        }

    }


    return Renderer;

});
