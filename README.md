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

>This is where the the dashboard exposes its extension points. Each item in here will have a property called **containerId** that identifies the type of the >dashboard extension. The object will contains various properties that are specific to the type of extension. We will go over this later in this tutorial.


I will cover in the next few sections 3 main dashboard extension points:

* Dashboard features

* Content features

* Custom content


## Dashboard Features

A dashboard feature is a piece of code (i.e. javascript class) that is registered with the dashboard. An instance of the feature class will be created as part of the life cycle of the dashboard. Only one instance of this feature will exist per dashboard instance.

A feature can define a list of other required features that it depends on. The required features APIs will be passed to the new feature in the constructor. A Feature can also expose its own API that can be consumed by other features.

### Example


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
			}]
		  }]
	}]
}
```


Here is the documentation of the various properties in the json spec under the *collectionItems* property:

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

>In this example, my custom feature needs to access the dashboard Canvas API.



**'runtimeDependencies'** 

>This is the same as the dependencies list, but it will only make the features available
>when used in any method expect the constructor. If the feature is accessed in the constructor,
>an exception will be thrown. It is better to use this list when you don't need to access the 
>required feature in your constructor.

>In this example, my custom feature needs to access the dashboard Transaction API.




### Class example

```javascript

class MyFeature {


		/**
		 * 
		 * @param {*} options.params map that contains the list of features defined 
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

----

