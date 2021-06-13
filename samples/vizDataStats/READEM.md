# Visualization data stats extension
A sample extension to showcase the Cognos dashboard feature extension mechanism.

The extension is adding 2 things:

A content feature that will be enabled for any visualization object. This feature is called "VisDataStats". The feature has a method called "getStats()" that return basic data stats like the average, minimum or maximum values associated with the visualization.


A custom content (i.e widget) that disaply the stats info for any selected visualization. The custom widget uses the canvas API to monitor content selection and will access the "VisDataStats" feature of the selected content to calculate the stats.



