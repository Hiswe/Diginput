// Plugin de formatage de nombre ©Hiswe
(function($){
	$.widget("ui.diginput",{
		_init: function(){
		        o = this.options,
				$button = null,
				this.options.separator = checkSeparator(o.separator);
				if (!o.val){
					this.element.val('');
				}							
				this.$copy = this._makeCopy();
				var presentationData = this.element.val();
								
				this.$copy.bind('keyup.'+o.bindNameSpace,$.proxy(function(){
					clearTimeout(timeOut);					
					var self = this;
					var timeOut = setTimeout(function(){																			  
						// don't update if the values remain the same							  
						var newData = self.$copy.val();							
						if (presentationData == newData){							
							return;
						}else{
							presentationData = newData;
							self._updateInput(this.format(newData, self.options.separator, false));
						}		
						// TODO callBack
					},200);																	 																																		
				},this))
				.bind('keypress.'+o.bindNameSpace, $.proxy(function(event){ // Keycontrol
					if(!this._validKey(event)){
						event.preventDefault();
					}
				}, this));				
			// add x1000 button
			if (o.x1000Button != ''){
				$button = $(o.x1000Button);
				this.$copy.after($button);
				$button.bind('click.'+o.bindNameSpace,$.proxy(function(event){this._x1000(event)}, this));
			}				
		},
		_makeCopy: function(){ // copy the input and hide the original
			var $copy = this.element.clone();
			var newId = this.element.attr('id')+this.options.idSuffix;
			$copy.addClass(this.options.classInput)
				.attr('id', newId)
				.insertBefore(this.element);
			// Change the label	
			var $label = $('label[for='+this.element.attr('id')+']');
			if($label.length != 0){
				$label.attr('for', newId);
			}
			// mask the previous label
			this.element.hide();
			return $copy;
		},
		_x1000: function(event){
			event.preventDefault();
			event.stopPropagation();
			rawData = this.element.val();
			if (!rawData){
				rawData = 1;
			}
			var multipliedData = rawData * 1000;
			if (multipliedData.toString().indexOf('e') == -1){
				this._updateInput($.ui.diginput.format(multipliedData, this.options.separator, false));
			}
			// TODO callBack
		},
		_updateInput: function(newData){ // Update the inputs
				this.$copy.val(newData.string);
				this.element.val(newData.number).trigger('change');		
		},
		_validKey: function(event){  // Check if a key is valid
			var separator= this.options.separator;
			var isValid = true;
			var authorizedCharacter = '1234657890'+separator.floatFix+separator.floatSep;
			// convertit le charCode en ce qu'il recouvre
			var key;
			if (!event.charCode) key = String.fromCharCode(event.which);
				else key = String.fromCharCode(event.charCode);
	
			// authorized key
			if (authorizedCharacter.indexOf(key) === -1) isValid = false;
			// key combo
			var authorizedComboKey = ['v','c','a','x'];
			$.each(authorizedComboKey, function(){
				if (event.ctrlKey&&key==this[0]||(event.metaKey&&key==this[0])) isValid = true;
			});
			// delete test
			if (event.which=='0' || event.which=='8') isValid = true;
			return isValid;
		},
		destroy: function(){
			this.element.fadeTo('slow', 1);
			this.$copy.fadeOut('fast',function(){$(this).remove()});
			if (o.x1000Button != ''){
				$button.fadeOut('fast',function(){$(this).remove()});
			}
			$.Widget.prototype.destroy.call( this );
		},
		disable: function(){
			var o = this.options;
			this.$copy.attr('disabled','disabeld').fadeTo('normal',0.85, function(){$(this).addClass(o.disabledClass)});
			if($button){
				$button.addClass(o.disabledClass).unbind('click.'+o.bindNameSpace).fadeTo('normal',0.5);
			}
		},
		enable: function(){
			var o = this.options;
			this.$copy.removeClass(o.disabledClass).attr('disabled','').fadeTo('normal',1);
			if($button){
				$button.removeClass(o.disabledClass)
				.bind('click.'+o.bindNameSpace,$.proxy(function(event){this._x1000(event)}, this))
				.fadeTo('normal',1);
			}
		},
		_setOption: function(key, value){
			$.Widget.prototype._setOption.apply( this, arguments );
			switch(key){
				case "val":
					if (value) {
						this._updateInput(this.format(value, this.options.separator, false));
					} 
				break;
			}
			
		},
		options: {
			bindNameSpace : 'diginput',
    		idSuffix: '-copy',
			classInput: 'diginput',
			disabledClass: 'disabled',
			val: false,
			separator: 'fr',
			x1000Button : '<a href="#" class="bouton boutonPetit"><span>x1000</span></a>',
			onComplete : $.noop
		}		 
	});
	/* Integer format with thousand separator */
	function formatInteger(integer, thousandSeparator){
		integer = integer.replace(/\B(?=(\d\d\d)*$)/g,thousandSeparator);
		// firefox need it, not chrome... duno why
		if(integer.charAt(integer.length-1) == thousandSeparator){
			integer = integer.substring(0,integer.length-1);
		}
		return integer;
	}
	/* verify settings */
	function checkSeparator(settings){
			var template = {
				frSetting: {
					floatSep: '.',
					floatFix: ',',
					spacing: ' '
				},
				enSetting: {
					floatSep: ',',
					floatFix: '',
					spacing: '.'
				},
				integerSetting: {
					floatSep: '',
					floatFix: '',
					spacing: ' '
				},
				floatSetting: {
					floatSep: '.',
					floatFix: '',
					spacing: ' '
				}				
			};
			switch(settings)
			{
			case 'fr':
			  settings = template.frSetting;
			  break;
			case 'en':
				settings = template.enSetting;
			  break;
			case 'int':
				settings = template.integerSetting;
				break;
			case 'float':
				settings = template.floatSetting;
				break;			
			default:
		// Use of default valued surcharged by the user separator
			var alreadyUsedChar='';
			$.each(settings, function(key, value){
				var reg = new RegExp('^[0-9'+alreadyUsedChar+']*(.){1}.*','g');
				value = value.replace(reg, '$1');
				alreadyUsedChar += value;
				settings[key] = value;
			});
			settings = $.extend({},template.frSetting, settings);
		}
		return settings;
	}
	/* Thousand separator */
	this.format = function(primaryData, separator, control) {
		var regExpression;
		var reg;
		var settings;
		var cleanData = null; /* common float */
        var cleanDataNumber = null; /* clean number */
		var cleanDataFormat = null; /* formated number */
		/*Data verificiation*/
		try
		{
			if (typeof primaryData == 'string'){
			}
			else if (typeof primaryData == 'number'){
				cleanData = primaryData.toString();
			}
			else if (primaryData == undefined){
				cleanData = '0';
			    cleanDataFormat = '0';
			}
			else{
				throw 'dataTypeError';
			}
		}
		catch(err){
			if (err == 'dataTypeError'){
				debug('Data type Error in this.format()\n Data was : '+primaryData);
				return;
			}
		}
		// no seperator char defined -> default
		settings = separator;
		if (separator == undefined){
			settings = checkSeparator($.ui.diginput.prototype.options.separator);
		}
		if(control == undefined && separator != undefined){
            // seperator char not already defined (direct use of the public method)
			settings = checkSeparator(separator);
            if (typeof separator == 'string'){
                settings = checkSeparator(separator);
            }else{
                settings = checkSeparator($.extend({},$.ui.diginput.prototype.options.separator, separator));
            }
		}
		/* string behavior */
		if (typeof primaryData =='string'){
			// remove all but digits and float separators
			regExpression = "[^[0-9"+settings.floatSep+settings.floatFix+"]]*";
			reg = new RegExp(regExpression, "g");
			cleanData = primaryData.replace(reg, '');
			// Behavior when it's a float number
			regExpression = "(["+settings.floatSep+settings.floatFix+"]+)";
			reg = new RegExp(regExpression, "g");
			if (reg.test(primaryData)){
				// replace all floatFix by floatSep
				if (settings.floatFix != ''){
					regExpression = "["+settings.floatFix+"]"; // verification of the regExpression for IE browser. IE don't tolerate '[]' regexp.
					reg = new RegExp(regExpression, "g");
					cleanData = cleanData.replace(reg, settings.floatSep);
				}
				// clean the integer part of the number
				regExpression = "^([0-9]*)("+settings.floatSep+")(.*)$";
				reg = new RegExp(regExpression, "g");
				var	cleanDataInteger = cleanData.replace(reg,'$1');
				// capture the float part of the number
				var cleanDataFloat = '';
				regExpression = "^([0-9]*)("+settings.floatSep+")(.*)$";
				reg = new RegExp(regExpression, "g");
				cleanDataFloat = cleanData.replace(reg,'$3');
				// clean the float part of the number
				regExpression = "[^[0-9]]*";
				reg = new RegExp(regExpression, "g");
				cleanDataFloat = cleanDataFloat.replace(reg,'');
				cleanData = cleanDataInteger+'.'+cleanDataFloat;
			}
		}
		// integer format
        if(cleanData == '.'){
             cleanDataFormat = '';
             cleanData = '';
        }
		else if (cleanData.indexOf('.') == -1){
			cleanDataFormat = formatInteger(cleanData,settings.spacing);
		}else{
			var cleanDataSplit = cleanData.split('.');
            cleanDataSplit[0] = (cleanDataSplit[0]) ? formatInteger(cleanDataSplit[0],settings.spacing) : 0;
			cleanDataFormat = cleanDataSplit[0]+settings.floatSep+cleanDataSplit[1];
		}
        cleanDataNumber = (cleanData=='') ? '' : parseFloat(cleanData);
    	return {    number : cleanDataNumber,
			        string : cleanDataFormat
		};
	};
    
    $.extend( $.ui.diginput, {
	    format: function( primaryData, separator, control) {
                var regExpression;
                var reg;
                var settings;
                var cleanData = null; /* common float */
                var cleanDataNumber = null; /* clean number */
                var cleanDataFormat = null; /* formated number */
                /*Data verificiation*/
                try
                {
                    if (typeof primaryData == 'string'){
                    }
                    else if (typeof primaryData == 'number'){
                        cleanData = primaryData.toString();
                    }
                    else if (primaryData == undefined){
                        cleanData = '0';
                        cleanDataFormat = '0';
                    }
                    else{
                        throw 'dataTypeError';
                    }
                }
                catch(err){
                    if (err == 'dataTypeError'){
                        debug('Data type Error in this.format()\n Data was : '+primaryData);
                        return;
                    }
                }
                // no seperator char defined -> default
                settings = separator;
                if (separator == undefined){
                    settings = checkSeparator($.ui.diginput.prototype.options.separator);
                }
                if(control == undefined && separator != undefined){
                    // seperator char not already defined (direct use of the public method)
                    settings = checkSeparator(separator);
                    if (typeof separator == 'string'){
                        settings = checkSeparator(separator);
                    }else{
                        settings = checkSeparator($.extend({},$.ui.diginput.prototype.options.separator, separator));
                    }
                }
                /* string behavior */
                if (typeof primaryData =='string'){
                    // remove all but digits and float separators
                    regExpression = "[^[0-9"+settings.floatSep+settings.floatFix+"]]*";
                    reg = new RegExp(regExpression, "g");
                    cleanData = primaryData.replace(reg, '');
                    // Behavior when it's a float number
                    regExpression = "(["+settings.floatSep+settings.floatFix+"]+)";
                    reg = new RegExp(regExpression, "g");
                    if (reg.test(primaryData)){
                        // replace all floatFix by floatSep
                        if (settings.floatFix != ''){
                            regExpression = "["+settings.floatFix+"]"; // verification of the regExpression for IE browser. IE don't tolerate '[]' regexp.
                            reg = new RegExp(regExpression, "g");
                            cleanData = cleanData.replace(reg, settings.floatSep);
                        }
                        // clean the integer part of the number
                        regExpression = "^([0-9]*)("+settings.floatSep+")(.*)$";
                        reg = new RegExp(regExpression, "g");
                        var	cleanDataInteger = cleanData.replace(reg,'$1');
                        // capture the float part of the number
                        var cleanDataFloat = '';
                        regExpression = "^([0-9]*)("+settings.floatSep+")(.*)$";
                        reg = new RegExp(regExpression, "g");
                        cleanDataFloat = cleanData.replace(reg,'$3');
                        // clean the float part of the number
                        regExpression = "[^[0-9]]*";
                        reg = new RegExp(regExpression, "g");
                        cleanDataFloat = cleanDataFloat.replace(reg,'');
                        cleanData = cleanDataInteger+'.'+cleanDataFloat;
                    }
                }
                // integer format
                if(cleanData == '.'){
                     cleanDataFormat = '';
                     cleanData = '';
                }
                else if (cleanData.indexOf('.') == -1){
                    cleanDataFormat = formatInteger(cleanData,settings.spacing);
                }else{
                    var cleanDataSplit = cleanData.split('.');
                    cleanDataSplit[0] = (cleanDataSplit[0]) ? formatInteger(cleanDataSplit[0],settings.spacing) : 0;
                    cleanDataFormat = cleanDataSplit[0]+settings.floatSep+cleanDataSplit[1];
                }
                cleanDataNumber = (cleanData=='') ? '' : parseFloat(cleanData);
                return {    number : cleanDataNumber,
                            string : cleanDataFormat
                };
	    }
    });
	
})(jQuery);