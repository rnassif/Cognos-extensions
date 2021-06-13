# Visualization data stats extension
A sample extension to showcase the Cognos dashboard feature extension mechanism.

The extension is adding 2 things:

- A content feature that is registered with any content of type visualizatoin. This feature is called **VisDataStats**. The feature has a method called "*getStats()*" that returns some basic data stats like the average, minimum or maximum values associated with the visualization.


- A custom content (i.e widget) that displays the stats information for any selected visualization. The custom widget uses the canvas API to monitor the content selection and will access the **VisDataStats** feature of the selected content to calculate the stats.


## How to install the extension
- Create a zip file that contains the content if this folder:
https://github.com/rnassif/Cognos-extensions/tree/main/samples/vizDataStats/ext

- Go tho the Cognos customization panel under the administration and upload the extension.


See the video here for more details on what this feature does
https://github.com/rnassif/Cognos-extensions/tree/main/samples/vizDataStats/video






