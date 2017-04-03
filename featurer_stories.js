<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<!-- Copyright (c) 2011  Rally Software Development Corp.  All rights reserved -->
<html>
<head>
    <title>Print Feature Cards</title>
    <meta name="Name" content="App: Print Feature Cards"/>
    <meta name="Version" content="2013.11.04"/>
    <meta name="Vendor" content="Rally Software"/>
    <script type="text/javascript" src="https://rally1.rallydev.com/apps/1.32/sdk.js"></script>

    <script type="text/javascript">
    var MAX_NAME_LEN = 115;
        var APP_TYPE = "Feature";
        var CARD_TYPE = "stories";
        
        function PrintStoryCards(rallyDataSource) {
        
            function displayCards(results) {
            	console.log(results);
                var estimate, loginName, ownerClass, storyId, taskId, description,
                        i, name, theMarkup, data, userTable, ownerText;
        
                userTable = buildUserTable(results.users);
        
                data = results[CARD_TYPE];
        
                for (i = 0; i < data.length; i++) {
					// dont show epics
                	if ((data[i].Children != null) && (data[i].Children.length > 0))
                		continue;
                    name = data[i].Name;
                    if (name.length > MAX_NAME_LEN) {
                        name = name.substring(0, MAX_NAME_LEN);
                        name += "...";
                    }
        
                    loginName = data[i].Owner;
                    if (typeof loginName === 'undefined' || loginName === null) {
                        ownerClass = "NoOwner";
                        ownerText = "No Owner";
                    } else {
                        ownerClass = loginName.UserName.replace(/[@|\.]/g,"");
                        ownerText = makeOwnerText(loginName, userTable);
                    }
        
                    if (CARD_TYPE === 'stories') {
                        storyId = data[i].FormattedID;
                        taskId = "";
                    } else {
                        storyId = data[i].WorkProduct.FormattedID;
                        taskId = results.tasks[i].FormattedID;
                    }
        
        			if (data[i].PreliminaryEstimate) {
        				estimate = data[i].PreliminaryEstimate.Name;
        			}
                    else if (data[i].PlanEstimate) {
                        estimate = data[i].PlanEstimate;
                    } else if (data[i].Estimate) {
                        estimate = data[i].Estimate;
                    } else {
                        estimate = "None";
                    }
        
                    // description = data[i].Description.slice(0,240);
					var typename = "feature"
					
					if(data[i]._type === 'HierarchicalRequirement') 
					{
						
						if(data[i].Feature !== undefined && data[i].Feature !== null && data[i].Feature.FormattedID !== undefined) {
							storyId += " : " + data[i].Feature.FormattedID;
							typename = "story"
						}
						else {
							typename = "story-no-feature"
						}
					}	
					
					
                    description = data[i].Description.slice(0,1024);
					
                    theMarkup = createMarkup(i, data.length, name, ownerText, ownerClass, description,
                            storyId, taskId, estimate, typename);
        
                    dojo.byId("cards").innerHTML += theMarkup;
                }
        
                ownerPopulate(results);
            }
        
            function buildUserTable(userData) {
                var table = {};
                for (var i = 0; i < userData.length; i++) {
                    table[userData[i].LoginName] = userData[i].DisplayName;
                }
                return table;
            }
        
            function makeOwnerText(loginName, userTable) {
                if (typeof userTable[loginName] === 'undefined' || userTable[loginName] === '') {
                    return loginName._refObjectName.split('@');
                } else {
                    return userTable[loginName];
                }
            }
        
            function createMarkup(cardNum, totalCards, name, ownerText, ownerClass, description, storyId, taskId, estimate, typename) {
                var theMarkup, id;
                if (CARD_TYPE === 'stories') {
                    id = storyId;
                } else {
                    id = taskId + ':' + storyId;
                }
        
                theMarkup =
                        '<div class="artifact ' + typename + '">' +
                                '<div class="header">' +
                                '<span class="storyID">' + id + '</span>' +
                                '<span class="owner ' + ownerClass + '">' + '</span>' +
                                '<span class="ownerText">' + ownerText + '</span>' +
                                '</div>' +
                                '<div class="content">' +
                                '<div class="card-title">' + name + '</div>' +
                                '<div class="description">' + description + '</div>' +
                                '</div>' +
                                '<span class="estimate">' + estimate + '</span>' +
                                '</div>';
        
                if (Math.ceil((cardNum + 1) % 4) === 0) {
                    theMarkup = theMarkup + '<div class=pb></div>';
                } else if (cardNum === totalCards - 1) {
                    theMarkup = theMarkup + '<div class=cb>&nbsp;</div>';
                }
        
                return theMarkup;
            }
        
            function ownerPopulate(results) {
                for (i = 0; i < results.users.length; i++) {
                    var ownerName = results.users[i].UserName.replace(/[@|\.]/g, "");
                    var ownerImage = rally.sdk.util.Ref.getUserImage(results.users[i], 40);
                    dojo.forEach(dojo.query("."+ownerName), function(ownerNode) {
                        ownerNode.innerHTML = "<IMG SRC='" + ownerImage + "'/>";
                    });
                }
            }
        
            function runQuery() {
                console.log("Release:",iterationDropdown.getSelectedName(), iterationDropdown.getSelectedName()==="");
                dojo.empty(dojo.byId("cards"));
                var queryArray = [];
                
                var query = "";
                
				//Print features instead of stories.
                // query = "(PortfolioItemType.Ordinal = 0)";
                //console.log("level dropdown",levelDropdown);
                var selectedRelease = iterationDropdown.getSelectedName();
                //var level = levelDropdown.getSelectedItem().value;
                //console.log("selectedRelease",selectedRelease,level);
                query = "((PortfolioItemType.Ordinal = " + 0 + ") and " +
                    ( selectedRelease === "" ? "(Release = null)" 
                            : "(Release.Name = " + "\"" + selectedRelease + "\")" ) +
                    ")";
                console.log("query",query);
        
				
				var query1 = '(Release.Name contains "' + selectedRelease + '")';
                queryArray[0] = {
                    key: CARD_TYPE,
                    type: 'PortfolioItem',
                    query: query,
                    fetch: 'Name,Iteration,Owner,FormattedID,PlanEstimate,ObjectID,Description,UserName,Children,PreliminaryEstimate',
                    order: 'Rank'
                };
                queryArray[1] = {
                    key: 'users',
                    type: 'users',
                    fetch: 'UserName,ObjectID,DisplayName'
                };
				
			
				
                rallyDataSource.setApiVersion("1.43");
                rallyDataSource.findAll(queryArray, displayCards);
				
				setTimeout(function(){
					var queryArray1 = [];
					queryArray1[0] = {
						key: "stories",
						type: 'hierarchicalrequirement',
						query: query1,
						fetch: 'Name,Iteration,WorkProduct,Owner,FormattedID,Estimate,ObjectID,Description,UserName,PlanEstimate,Parent,Feature',
						order: 'Rank'
					};
					queryArray1[1] = {
						key: 'users',
						type: 'users',
						fetch: 'UserName,ObjectID,DisplayName'
					};
					rallyDataSource.findAll(queryArray1, displayCards);
				}, 200);
            }
        
            function getStyleSheet() {
                var styleSheet;
                dojo.forEach(dojo.query('style'), function(s) {
                    if(s.title == 'printCards'){
                        styleSheet = s;
                    }
                });
                return styleSheet.innerHTML;
            }
        
            function printPop() {
                var title, options, printWindow, doc, cardMarkup;
        
                title = CARD_TYPE.slice(0, 1).toUpperCase() + CARD_TYPE.slice(1);
                options = "toolbar=1,menubar=1,scrollbars=yes,scrolling=yes,resizable=yes,width=1000,height=500";
                printWindow = window.open('', title, options);
                doc = printWindow.document;
        
                cardMarkup = dojo.byId("printSection").innerHTML;
        
                doc.write('<html><head><title>Print Feature</title>');
                doc.write('<style>');
                doc.write(getStyleSheet());
                doc.write('</style>');
                doc.write('</head><body class="landscape">');
                doc.write(cardMarkup);
                doc.write('</body></html>');
                doc.close();
        
                printWindow.print();
                return false;
            }
            
            function onDataRetrieved(a, eventArgs) {
			    //Add an "All" option
			    var all = {};
			    all[eventArgs.displayValueProperty] = "Unscheduled";
			    all[eventArgs.valueProperty] = "Unscheduled";
			    eventArgs.items.unshift(all);
			}
        
            this.display = function(){
                
				//levelDropdown = new rally.sdk.ui.basic.Dropdown( {
                //    label: "Hierarchy Level:",
                //    showLabel : true,
                //    items : [
                //        { label : "0", value : "0"},
                //        { label : "1", value : "1"},
                //        { label : "2", value : "2"}
                //    ],
                //    defaultValue : "0"
                //});
                //levelDropdown.display("levelDropdown");
				
                // iterationDropdown = new rally.sdk.ui.IterationDropdown({}, rallyDataSource);
                iterationDropdown = new rally.sdk.ui.ReleaseDropdown({}, rallyDataSource);
                iterationDropdown.addEventListener("onDataRetrieved",    onDataRetrieved);
                iterationDropdown.display("iterationDropdown", runQuery);
        
                var config = {
                    text: "Print " + APP_TYPE + " Cards",
                    value: "myValue"
                };
                var button = new rally.sdk.ui.basic.Button(config);
                button.display("buttonDiv", printPop);
            };
        }
    </script>
 	<style type="text/css" title="printCards">
        /* PLEASE LEAVE THIS STYLESHEET INLINE SINCE TITLE IS NECESSARY */
        @media print {
                #interface {
                    display: none;
                }
 
                .artifact{
                  page-break-inside:avoid;
                    /* page-break-before: always; */
                    /* clear: both; */
                }
            }
 
            #buttonDiv,
            #iterationDropdown {
                display:inline;
            }
 
            #interface, #printSection {
                margin: 20px;
            }
            #interface {
                position: absolute;
                top : 5px;
            }
 
            html {
                background-color: #fff;
                color: #000;
                font: 14pt / 1.26 Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 0;
            }
 
            body {
                background-color: #fff;
                margin: 0;
                padding: 0;
            }
 
            .cb {
                clear:both;
            }
 
            .artifact {
                background-color: #fff;
                border: 2px solid #000;
                float: left;
                height: 3.25in;
                margin: 0.1in 0.1in 0.1in 0.1in;
                position: relative;
                overflow: hidden;
                width: 5.5in;
            }
 
            .header {
                border: 1px;
                border-bottom-style: solid;
                display: table-cell;
                height: 30px;
                vertical-align: middle;
                width: 5.5in;
            }
 
            .card-title {
                font: bold 15px Genova, sans-serif;
                padding-top: 0.5em;
                text-align: center;
            }
 
            .description {
                float: left;
                font: 12pt Georgia, sans-serif;
                margin: 0.25em auto 0 auto;
                padding-left: 1.0em;
                padding-right: 1.0em;
                overflow: hidden;
            }
 
            .owner {
                float: right;
                height:40px;
            }
 
            .ownerText {
                float: right;
                font: 14pt / 1.26 Arial, Helvetica, sans-serif;
                margin-right: 0.3em;
                margin-top: 0.3em;
            }
 
            .storyID {
                float: left;
                font: 14pt / 1.26 Arial, Helvetica, sans-serif;
                margin-left: 0.25em;
                margin-top: 0.3em;
            }
 
            .estimate {
                bottom: 0.5em;
                position: absolute;
                right: 0.5em;
            }
 
            .content {
                height: 2.0in;
                overflow: hidden;
                width: 5.5in;
            }
			
			.feature {
				height: 3.0in;
				border: solid 4px;
			}
			
			.story {
				height: 2.2in;
				border: solid 2px;
			}
			
			.story-no-feature {
				height: 2.2in;
				border: solid 2px;
			}
			.story-no-feature .header {
				background-color: gray;
			}
 
    </style>
    <script type="text/javascript">
        function onLoad() {
            rally.sdk.ui.AppHeader.setHelpTopic("/display/rlyhlp/Print+Card+App");
            var rallyDataSource = new rally.sdk.data.RallyDataSource('__WORKSPACE_OID__',
                                                                    '__PROJECT_OID__',
                                                                    '__PROJECT_SCOPING_UP__',
                                                                    '__PROJECT_SCOPING_DOWN__');
            var printStoryCards = new PrintStoryCards(rallyDataSource);
            printStoryCards.display(dojo.body());
        }
        rally.addOnLoad(onLoad);
    </script>
</head>
<body>
    <div style="float:right" id="help"></div>
    <div id="interface">
       <!-- <div id="levelDropdown"></div> -->
        <div id="iterationDropdown"></div>
        <div id="buttonDiv"></div>
    </div>
    <div id="printSection">
        <div id="cards"></div>
        <!-- <div id="iterationDropdown">IGNORE THIS DROPDOWN/UNUSED:<P></div> -->
    </div>
</body>
</html>