# Visualization data stats extension
A sample extension to showcase the Cognos dashboard feature extension mechanism.

The extension is adding custom widget that does the following:

* Use the dashboard API to list for an datapoint selection event
* If the event is generated from a viz that belongs to the same page as the custom wiget, then display an iframe using  a url that contains the data point selection values
* The url is a property that can be set in the property pane. The url can contain a keywork `{DATAPOINTS}` and will be replaced by the seleted datapoint labels before refreshing the iframe.





