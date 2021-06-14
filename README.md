# Cognos-extensions
This repo contains a collection of extensions and tutorials that will improve your IBM Cognos Dashboard experience. Extensions will allow you to implement some missing functionality that you require in your dashboard, or add new types of content or widgets.

Each extension will have a step by step tutorial that will explain what the extension is doing and how to implement it.

IBM Cognos dashboard has a documented javascript API. The documentation focuses on how to create a new custom application that uses the API. I will show you here how you can take advantage of the API to extend your existing dashboard experience.

For you reference, the Cognos Dashboard API documentation can be found here:

https://www.ibm.com/docs/en/cognos-analytics/11.1.0?topic=apis-dashboard-javascript-api

### Note:

Some of the APIs and extension points that i will use might not be mentioned in the public documentation. These are provisional APIs that are currently being worked on and might be adjusted or changed in future releases.


## Dashboard Extensions Overview

The IBM Cognos Dashboard application provides various extension points that can be used to extend or add new functionality to the dashboard. Extensions are zip files that contain some code (e.g. javascript) and a JSON specification that a user with ***Portal Administrator*** or ***System Administrator*** privileges can upload to Cognos. Once uploaded, the dashboard will load the extensions and they will be part of the application. 

The Cognos extension mechanism is not new, it was released a while back in version 11.0.0 and the documentation can be found here.  

https://www.ibm.com/docs/en/cognos-analytics/11.0.0?topic=roles-creating-extensions

In this tutorial, you will learn how to use this extension mechanism to take advantage of the Dashboard extension points and javascript API.

Before we begin, let us have an overview of the Cognos extension mechanism. In general, the Cognos extension json specification will look like the following :


```javascript 

{
	"name": "myFeature",
	"comment": "The NAME of the extension, specified above, is very important.",
	"schemaVersion": "2.0",
	"extensions": [{
		"perspective":"dashboard",
		"features": [ {
			"id": "com.ibm.dashboard.myFeature",
			"collectionItems": []
		  }]
	}]
}
```

Some of the important properties in this JSON:

**name**: 

>This is the name of the Cognos extension. The name is important as it will be used in any path used to access static resources that are packaged in the extension zip file (e.g. css, javascript files)

**perspective**: 

>This is the name of the application that is being extended. In the case of the dashboard, the value here is always **dashboard**

**collectionItems**: 

>This is where the the dashboard exposes its extension points. Each item in here will have a property called **containerId** that identifies the type of the dashboard extension. The object will contains various properties that are specific to the type of extension. We will go over this later in this tutorial.


I will cover in the next few sections 3 main dashboard extension points:

* [Dashboard features](#dashboard_features)

* [Content features](#content_features)

* [Custom content](#custom_content)


## <a name="dashboard_features"></a> Dashboard Features

A dashboard feature is a piece of code (i.e. javascript class) that is registered with the dashboard. An instance of the feature class will be created as part of the life cycle of the dashboard. Only one instance of this feature will exist per dashboard instance.

A feature can define a list of other required features that it depends on. The required features APIs will be passed to the new feature in the constructor. A Feature can also expose its own API that can be consumed by other features.

### Example

**Note:** The syntax of the JSON under *collectionItems* is provisional and might slightly change in future releases.


```javascript 

{
	"name": "myFeature",
	"comment": "The NAME of the extension, specified above, is very important.",
	"schemaVersion": "2.0",
	"extensions": [{
		"perspective":"dashboard",
		"features": [ {
			"id": "com.ibm.dashboard.myFeature",
			"collectionItems": [{
				"containerId": "com.ibm.bi.dashboard.features",
				"name": "myDashboardFeature",
				"id": "dashboard.myFeature",
				"class": "v1/ext/myFeature/js/features/myDashboardFeature",
				"dependencies":["Canvas"],
				"runtimeDependencies":["Transaction"],
				"profiles": ["consume"]
			}]
		  }]
	}]
}
```


Under the *collectionItems* property, an entry defines the dashboard feature with the following attributes:



**'containerId'** 

>The value ***com.ibm.bi.dashboard.features*** tells the dashboard application that this entry represents a dashboard feature.


**'name'** 

>This is the name of the feature that will be used to access its API (if any)


**'class'**

>This is the path of the feature class. The class file is part of the extension zip file. This path has 3 parts:
> * The first part is always the same: **v1/ext/**
> * The second part is the name of the feature defined the feature specification: **myFeature**
> * The 3rd part is the path to the file in the zip file: **js/features/myDashboardFeature**

> Where I have file **myDashboardFeature.js** under the folder **js/features** in my zip extension zip file.


**'dependencies'**

>This is the list of dependencies that the feature depends on. 
>This dependency list will make sure that the the required features
>are created and ready and can be accessed in the constructor of the feature.
>This dependency list should only be used when you need to access certain 
>feature in the constructor. Adding dependencies in this list will have some 
>performance implications since it will block the creation of the feature until 
>all its required features are created and initialized.

>In this example, my custom feature needs to access the dashboard Canvas API.



**'runtimeDependencies'** 

>This is the same as the dependencies list, but it will only make the features available
>when used in any method expect the constructor. If the feature is accessed in the constructor,
>an exception will be thrown. It is better to use this list when you don't need to access the 
>required feature in your constructor.

>In this example, my custom feature needs to access the dashboard Transaction API.


**'profiles'**
> Indicates when the feature is used. Possible values are:
> * 'consume': The feature is needed when the dashboard is in view mode
> * 'authoring' : The feature is only needed when the dashboad is in edit mode

> Most likely the value you want here is 'consume' unless your feature to only be available when the dashboard is in edit mode.



### Class example

```javascript

class MyFeature {


		/**
		 * 
		 * @param {*} options.features map that contains the list of features defined 
		 * in both the dependencies and runtimeDependencies lists
		 *
		 */
		constructor(options) {
		      // In the json example above, I defined a dependency on the Canvas API. I can access it here using:
		      //  options.features['Canvas']

		      // Also, since the Transaction API is defined under the runtimeDependencies, I cannot use it in the constructor or the initialize function.
		      // But it can be accessed in any other function in this class.
		}
	
		/**
		 * 
		 * By default, the feature instance will only be created when the feature is used by other features or widgets. 
		 * This means that if no widget or feature accesses this feature, then it will not be created.
		 * There are certain situations where you want the feature to be created and do some work even if it 
		 * is not being referenced by other features or widgets.
		 * This function here can be used to force the creation of the instance and you can do any initialization work here.
		 * 
		 * Defining this function will force create your feature object whether it is being referenced or not.
		 * 
		 */
		initialize() {
		}
		

		/**
		 * Return the feature API (if any) to be exposed to other features
		 * 
		 */
		getAPI() {
			return {
				someAPIFunction: function() {}
			}
		}
	
		/**
		 * Called when the dashbaord is closed
		 */
		destroy() {
		}   
	}
```

## <a name="content_features"></a> Dashboard Content Features

A dashboard content is any content that is part of the dashboard canvas. This could be a tab control, a page, a widget, a group, etc.. Bascially any object that is part of the dashboard. 

A content feature is a piece of code (i.g. class) that is registered with the dashboard. An instance of the content feature class will be created as part of the life cycle of each content in the dashboard canvas. A different instance of the feature will be created for every content instance in the canvas.

For example, if I have a dashboard with 5 widgets and I have a content feature registered with those widgets, then 5 instances of the feature will be created. Each instance of the feature will receive the instance of the content that it is associated with.

The feature can define a list of required features that it depends on. Content features can expose their own API that other feature can consume and use.


### Example

The following json, contributes a new content feature. It is very similar to the dashboard feature, with an additional *type* attribute that indicate which content type the feature is associated with.



```javascript 

{
	"name": "myFeature",
	"comment": "The NAME of the extension, specified above, is very important.",
	"schemaVersion": "2.0",
	"extensions": [{
		"perspective":"dashboard",
		"features": [ {
			"id": "com.ibm.dashboard.myFeature",
			"collectionItems": [{
				"containerId": "com.ibm.bi.dashboard.content-features",
				"name": "myContentFeature",
				"id": "dashboard.myContentFeature",
				"class": "v1/ext/myFeature/js/features/myContentFeature",
				"dependencies":["state"],
				"runtimeDependencies":["Dashboard.Transaction"],
				"types":["widget.text", "widget.live", "page"],
				"profiles":["consume"]
			}]
		  }]
	}]
}
```
Here is the documentation of the various properties in the json spec:




**'containerId'** 

>The value ***com.ibm.bi.dashboard.features*** tells the dashboard application that this entry represents a dashboard feature.


**'name'** 

>This is the name of the feature that will be used to access its API (if any)


**'class'**

>This is the path of the feature class. The class file is part of the extension zip file. This path has 3 parts:
>The first part is always the same: **v1/ext/**
>The second part is the name of the feature defined the feature specification: **myFeature**
>The 3rd part is the path to the file in the zip file: **js/features/myDashboardFeature**

>Where I have file **myDashboardFeature.js** under the folder **js/features** in my zip extension zip file.


**'dependencies'**

>This is the list of dependencies that the feature depends on. 
>This dependency list will make sure that the the required features
>are created and ready and can be accessed in the constructor of the feature.
>This dependency list should only be used when you need to access certain 
>feature in the constructor. Adding dependencies in this list will have some 
>performance implications since it will block the creation of the feature until 
>all its required features are created and initialized.

>In this example, my custom feature needs to access the content state API.
>In order to require a dashboard level feature, the feature name must be prefixed with "Dashboard.". 
For example, "Dashboard.Transaction"


**'runtimeDependencies'** 

>This is the same as the dependencies list, but it will only make the features available
>when used in any method expect the constructor. If the feature is accessed in the constructor,
>an exception will be thrown. It is better to use this list when you don't need to access the 
>required feature in your constructor.

>In this example, my custom feature needs to access the dashboard Transaction API.
>In order to require a dashboard level feature, the feature name must be prefixed with "Dashboard.". 
For example, "Dashboard.Transaction"


**'profiles'**
> Indicates when the feature is used. Possible values are:
> * 'consume': The feature is needed when the dashboard is in view mode
> * 'authoring' : The feature is only needed when the dashboad is in edit mode

> Most likely the value you want here is 'consume' unless your feature to only be available when the dashboard is in edit mode.



**"types"**

>The list of content types that this feature will be associated with. 
>
>If no types are defined, the feature will be available for any type.

>An example of a type:
```
 'widget' : Any widget in the canvas
 'widget.<widgetType>' : A specific type of widget where <widgetType> could be something like 
	'shape' - Shape widget 
	'live' - Visualization
	'text' - Text widget
	'media' - Media widget
	'webpage' - webpage
	'image' - image
 'page': A page object

```


### Class example

```javascript

class MyFeature {


		/**
		 * 
		 * @param {*} options.features - A Map that contains the list of features defined 
		 * in both the dependencies and runtimeDependencies lists
		 * @param {*} options.content - A reference to the content API associated with this feature
		 * 
		 *
		 */
		constructor(options) {
		      // In the json example above, I defined a dependency on the conent state API. I can access it here using:
		      //  options.features['state']

		      // Also, since the Transaction API is defined under the runtimeDependencies, I cannot use it in the constructor or the initialize function.
		      // But it can be accessed in any other function in this class.
		}
	
		/**
		 * 
		 * By default, the feature instance will only be created when the feature is used by other features or widgets. 
		 * This means that if no widget or feature accesses this feature, then it will not be created.
		 * There are certain situations where you want the feature to be created and do some work even if it 
		 * is not being referenced by other features or widgets.
		 * This function here can be used to force the creation of the instance and you can do any initialization work here.
		 * 
		 * Defining this function will force create your feature object whether it is being referenced or not.
		 * 
		 */
		initialize() {
		}
		

		/**
		 * Return the feature API (if any) to be exposed to other features
		 * 
		 */
		getAPI() {
			return {
				someAPIFunction: function() {}
			}
		}
	
		/**
		 * Called when the dashbaord is closed
		 */
		destroy() {
		}   
	} 

```


## <a name="custom_content"></a> Custom Content



**This collection replaces the existing custom widget collection "com.ibm.bi.dashboard.widgets"**

The documented way for adding custom widgets in the dashboard is described here:

https://www.ibm.com/docs/tr/cognos-analytics/11.1.0?topic=extensions-adding-dashboard-widget

While this method works fine, it is limited that it will not give access to the dashboard API to the newly added custom widget code.
In order to add a new custom content or widget that can access the existing dashboard API, you need to use the new collection **com.ibm.bi.dashboard.contentTypes** instead of **com.ibm.bi.dashboard.widgets**

This new collection **com.ibm.bi.dashboard.contentTypes** is provisional and it might change in future releases.

The new content type will show up under the custom widget panel and can be added to the canvas (A potential defect that exists in the current product that might prevent drag&drop to work when adding the widget. Instead, simply click on the widget and it will be added to the dashboard). 

### Example
The following json, contributes a new widget that will show up the custom widget panel. The widget webcontent (including the javascript class file and image)  must be zipped with the json file.

This example adds a new custom content with some properties will be exposed in the properties pane.

The dependencies array under "renderer" can be used to access any dashboard feature API that is required. In the following example, the widget is using the dashboard Canvas API.

```javascript 

{
    "name": "myCustomContent",
    "schemaVersion": "1.0",
    "extensions": [
      {
        "perspective": "dashboard",
        "comment": "Extension that adds a new widget to the dashboard",
        "features": [
          {
            "id": "myNewWidget",
            "collectionItems": [{
                "containerId": "com.ibm.bi.dashboard.contentTypes",
                "id": "myCustomContentID",
                "type": "myCustomButton",
                "iconUrl": "v1/ext/myCustomContent/images/myIcon.svg",
                "expose": true,
                "name": "Sample button",
                "propertyLayoutList": [{
                    "type": "Section",
                    "id": "my_settings",
                    "label": "My options",
                    "position": 0
                }],
                "propertyList": [{
                    "id": "myInputProperty",
                    "editor": {
                        "sectionId": "general.my_settings",
                        "uiControl": {
                            "type": "InputLabel",
                            "label": "my input"
        
                        }
                    }
                }, {
                    "id": "myToggleProperty",
                    "editor": {
                        "sectionId": "general.my_settings",
                        "uiControl": {
                            "type": "ToggleButton",
                            "label": "my toggle"
        
                        }
                    }
                }, {
                    "id": "myDropDownProperty",
                    "editor": {
                        "sectionId": "general.my_settings",
                        "uiControl": {
                            "type": "DropDown",
                            "label": "My dropdown options",
                            "options": [{
                                "label": "Option 1",
                                "value": "option1"
                            },{
                                "label": "Option 2",
                                "value": "option2"
                            },{
                                "label": "Option 3",
                                "value": "option3"
                            }]
                        }
                    }
                }],
                "renderer": {
                    "class": "v1/ext/myCustomContent/js/MyCustomWidget",
                    "dependencies": ["Dashboard.Canvas"]
                },
                "capabilities": {
                    "selection": true
                }
            }]
          }
        ]
      }
    ]
  }
```  
  
**'containerId'** 

>The value ***om.ibm.bi.dashboard.contentTypes*** tells the dashboard application that this entry represents a content type definition.

**'id'** 

>The content identifier

**'type'** 

>The content type. This is the value used to identify the type of the content when registering content features.

**'iconUrl'** 

>The icon to be display in the widget panel in the dashboard

**'expose'** 

>Indicate whether to expose this custom widget entry in the custom wiget panel or not. There might be cases where the custom widget is only used internally and created using the APIs. In this case, expose can be set to false.


**'name'** 

>The name to be display in the widget panel


**'propertyList'** 

>The list of properties that this content depends on. The properties can define an editor, and this will show the property editor in the properties panel so that the auther can change the properties. The custom widget can access the properties value using the content API .


**'name'** 

>The name to be display in the widget panel


**'renderer/class'**

>This is the path of the renderer class. The class file is part of the extension zip file. This path has 3 parts:
>The first part is always the same: **v1/ext/**
>The second part is the name of the feature defined the feature specification: **myCustomContent**
>The 3rd part is the path to the file in the zip file: **js/MyCustomWidget**

>Where I have file **MyCustomWidget.js** under the folder **js/** in my zip extension zip file.


**'renderer/dependencies'**

>This is the list of dependencies that the renderer depends on. 
>This dependency list will make sure that the the required features
>are created and ready and can be accessed in the constructor of the feature.
>This dependency list should only be used when you need to access certain 
>feature in the constructor. Adding dependencies in this list will have some 
>performance implications since it will block the creation of the feature until 
>all its required features are created and initialized.

>In this example, my custom feature needs to access the content state API.
>In order to require a dashboard level feature, the feature name must be prefixed with "Dashboard.". 
For example, "Dashboard.Transaction"


**'renderer/runtimeDependencies'** 

>This is the same as the dependencies list, but it will only make the features available
>when used in any method expect the constructor. If the feature is accessed in the constructor,
>an exception will be thrown. It is better to use this list when you don't need to access the 
>required feature in your constructor.

>In this example, my custom feature needs to access the dashboard Transaction API.
>In order to require a dashboard level feature, the feature name must be prefixed with "Dashboard.". 
For example, "Dashboard.Transaction"




