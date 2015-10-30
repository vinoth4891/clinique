define(["framework/Widget", "framework/TemplateProvider"], function() {
    Clazz.WidgetWithTemplate = Clazz.extend(
		Clazz.Widget, {
			// the url of the template
			templateUrl: null,
			localConfig: null,
			// default the provider to handlebar
			templateProvider: TemplateProvider != undefined ? TemplateProvider.HANDLE_BAR : '',
			// data for data binding process. If you don't override preRender(), this is the default
			// data that it will use
			data : {},
			// the last result of the element after the element has been bounded and rendered
			element: null,
			// default container if render place is not specified
			// for example: <app:account-list>
			defaultContainer : null,
			doMore: function(element) {},
			/***
			 * Called after the renderTemplate() and bindUI() completes.
			 * Override and add any preRender functionality here
			 *
			 * @element: Element as the result of the template + data binding
			 */
			postRender : function(element) {
			},
			/****
			 * Called before the render() function, override and add any preRender functionality
			 * here
			 * @whereToRender The node where we are going to render the UI
			 * @renderFunction The renderTemplate function by default, use to render the UI and call bindUI afterwards
			 */
			preRender: function(whereToRender, renderFunction) {
				// default implementation just call renderFunction
				renderFunction(this.data, whereToRender);
			},
			/***
			 * A call to render the UI fragment implemented in renderUI method
			 * @param whereToRender A placeholder to hold the fragment, this would typically
			 * be a div tag or other valid HTML element.
			 * @whereToRender The node where we are going to render the UI
			 */
			render : function(whereToRender) {
				if(whereToRender == null) {
					whereToRender = $(this.defaultContainer);
				}
				this.preRender(whereToRender, $.proxy(this.renderTemplate, this));
			},
			/***
			 * Render using the template url specified with the template engine
			 * @data The data that is used for binding with the template
			 * @whereToRender The node where we are going to render the UI
			 */
			renderTemplate: function(data, whereToRender) {
				if(this.templateUrl != null) {
					var self = this;
					var templateProvider = new Clazz.TemplateProvider({ templateEngine : this.templateProvider});
					templateProvider.merge(this.templateUrl, data, function(element) {
						$(whereToRender).html(element);
						self.bindUI();
						self.postRender(element);
						self.element = element;
						self.doMore(element);
					});
				}
			},
			/***
			 *  Method to get the HTML String representation, can be used to include
			 *  the part of the Widget to other template
			 *  @return The HTML string from the result of data binding with the template
			 */
			getHtmlString: function() {
				if(this.element != null) {
					return $(this.element)[0].outerHTML;
				}
			},
			/**
			 * Method to initiate any event handling
			 * called after the renderTemplate() completes
			 */
			handleEvent : function(element){
				this.bindUI();
				this.postRender(element);
				this.element = element;
			},
			renderTheme : function(module, localtheme) {
				if(Clazz.config.theme !== undefined && Clazz.config.theme !== null && Clazz.config.theme !== '' &&
				  module !== undefined && module !== null && module !== '') {
					$('head').append('<link rel="stylesheet" href="../components/'+ module +'/css/' + Clazz.config.theme + '.css">');
				} else {
					if(localtheme !== undefined && localtheme !== null && localtheme !== '' &&
					module !== undefined && module !== null && module !== '') {
						$('head').append('<link rel="stylesheet" href="../components/'+ module +'/css/' + localtheme + '.css">');
					}
				}
			},
            breadcrumbLast: function() {
                try {
                    jQuery('.tpbreadcrumbs ul').find('li').removeClass('breadcrumbLastChld');
                    jQuery('.tpbreadcrumbs ul li:last-child').addClass('breadcrumbLastChld');   
                }catch(e) {
                }
            },
			ieEightAndIeNine:function(){				
                    jQuery.support.cors = true; // IT's support for IE7, IE8, IE9.
			},
			returnIeVersion:function(){
			  if($('html').hasClass('ie8') ) {
			     return true;
			  }else{
			    return false;
			  }
			},
            IEAsyncType : function() {
                if (($.browser.msie && parseInt($.browser.version, 10) === 8)) {
                    return false;
                }
                else if (($.browser.msie && parseInt($.browser.version, 10) === 9)) {
                    return false;
                }
                else if (($.browser.msie && parseInt($.browser.version, 10) === 10)) {
                    return false;
                }
                else if (($.browser.msie && parseInt($.browser.version, 10) === 11)) {
                    return false;
                } else {
                    return true;
                }
            }
		}
	);
	return Clazz.WidgetWithTemplate;
});