# Visualization data stats extension
A sample extension to showcase the Cognos dashboard feature extension mechanism.

The extension is adding a custom widget that does the following:

* Use the dashboard API to listen for any datapoint selection event.

* When the user selects a data point in a visualization, it will trigger a data point selection event. If the visualization belongs to the same page as the custom widget, we will display an iframe using a URL containing the data point selection values.

* The URL is a property that the author can set in the property pane. The URL can contain the keyword `{DATAPOINTS}`. The custom widget will replace the keyword with the selected datapoint labels before refreshing the iframe.





