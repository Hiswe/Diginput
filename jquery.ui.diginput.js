/*
 * jQuery UI Diginput @VERSION
 *
 * Copyright 2010, ©Hiswe
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function($, undefined){
	$.widget("ui.diginput",{
		options:
        {
    		idSuffix: '-copy',
			classInput: 'diginput',
			disabledClass: 'disabled',
			separator: 'fr',
			x1000Button : '<a href="#" class="bouton boutonPetit"><span>x1000</span></a>',
			debug:true
        },
		_create: function()
        {
            if (!window.console && !console.log && !console.warn) this.options.debug = false;
            if (this.options.debug) console.info('[DIGINPUT] create');
            if(this.element.is('input[type=text]'))
            {
                var $button = null;
                this.options.separator = checkSeparator(this.options.separator);
                this._makeCopy();
                this.value(this.element.val());
                this.$copy
                    .bind('keyup.'+this.name,$.proxy(this._keyUp, this))
                    // KeyControl
                    .bind('keypress.'+this.name, $.proxy(this._validKey, this))
                    .bind('change', $.proxy(this._copyChangeEvent,this));
                // add x1000 button
                if (this.options.x1000Button != '')
                {
                    this.$button = $(this.options.x1000Button);
                    this.$copy.after(this.$button);
                    this.$button.bind('click.'+this.name,$.proxy(this._x1000, this));
                }
            }
            else if(this.options.debug)
            {
                console.warn('[DIGINPUT] create : init only with text input')
            }
		},
        _copyChangeEvent: function(event)
        {
            this.element.trigger('change');
            (this.options.debug) ? console.info('[Event] Change | original Input') : null;
        },
        _keyUp : function()
        {
			clearTimeout(timeOut);
            var self = this;
			var timeOut = setTimeout(function(){
			// don't update if the values remain the same
                var newData = self.$copy.val();
				if (self.inputValue.string != newData){
                    if(self.options.debug) console.log('[DIGINPUT] event :: keyUp with diffrent data');
					self.value(newData);
				}
                else
                {
                    if(self.options.debug) console.log('[DIGINPUT] event :: keyp with same data');
                }
				// TODO callBack
			},200);
		},
		_makeCopy: function(){ // copy the input and hide the original
			var $copy = this.element.clone();
            var newId = this.element.attr('id')+this.options.idSuffix;

			$copy.addClass(this.options.classInput)
				.attr('id', newId)
				.insertBefore(this.element);
			// Change the label
			var $label = $('label[for='+this.element.attr('id')+']');
			if($label.length) $label.attr('for', newId);
			// mask the previous label
			(this.options.debug) ? this.element.fadeTo('normal', 0.5) : this.element.hide();
			this.$copy = $copy;
            this.value(this.element.val());
		},
		_x1000: function(event)
        {
			event.preventDefault();
			event.stopPropagation();
            this.element.trigger('change');
            if (this.options.debug) console.info('[Event] Change | original Input');
			var rawData = this.element.val();
			if (!rawData) rawData = 1;
			var multipliedData = rawData * 1000;
			if (multipliedData.toString().indexOf('e') == -1){
				this.value(multipliedData);
			}
			// TODO callBack
		},
		_validKey: function(event) // Check if a key is valid
        {
            var separator = this.options.separator;
			var isValid = true;
			var authorizedCharacter = '1234657890'+separator.floatFix+separator.floatSep;
			// convertit le charCode en ce qu'il recouvre
			var key	=  (!event.charCode) ?  String.fromCharCode(event.which) : String.fromCharCode(event.charCode);
			// authorized key
			if (authorizedCharacter.indexOf(key) === -1) isValid = false;
			// key combo
			var authorizedComboKey = ['v','c','a','x'];
			$.each(authorizedComboKey, function(){
				if (event.ctrlKey&&key==this[0]||(event.metaKey&&key==this[0])) isValid = true;
			});
			// delete test
			if (event.which=='0' || event.which=='8') isValid = true;
            if (!isValid) event.preventDefault();
		},
		destroy: function()
        {
			this.element.fadeTo('slow', 1);
			this.$copy.fadeOut('fast',function(){$(this).remove()});
			if (this.options.x1000Button != '') this.$button.fadeOut('fast',function(){$(this).remove()});
			$.Widget.prototype.destroy.call( this );
		},
		disable: function()
        {
            this.$copy.attr('disabled','disabeld')
                .fadeTo('normal',0.85,$.proxy(addClassToCopy,this));
			if(this.$button){
				this.$button.addClass(this.options.disabledClass)
                .unbind('click.'+this.name).fadeTo('normal',0.5);
			}
            function addClassToCopy()
            {
                this.$copy.addClass(this.options.disabledClass);
            }
		},
		enable: function()
        {
			this.$copy.removeClass(this.options.disabledClass)
                .attr('disabled','')
                .fadeTo('normal',1);
			if(this.$button){
				this.$button.removeClass(this.options.disabledClass)
				.bind('click.'+this.name,$.proxy(this._x1000, this))
				.fadeTo('normal',1);
			}
		},
        value: function(value)
        {
            if(typeof value == "undefined"){
                 return this.inputValue;
             }
            else
            {
                this.inputValue = $.ui.diginput.format(value, this.options.separator, true);

                this.$copy.val(this.inputValue.string);
                this.element.val(this.inputValue.number);

            }
        },
		_setOption: function(key, value){
			$.Widget.prototype._setOption.apply( this, arguments );
			switch(key){
				case "separator":
					if (value) {
						this.options.separator = checkSeparator(value);
                     }else{
                        return this.options.separator;
                     }
				break;
			}
		}
	});

	/* Integer format with thousand separator */
	function formatInteger(integer, thousandSeparator)
    {
		integer = integer.replace(/\B(?=(\d\d\d)*$)/g,thousandSeparator);
		// firefox need it, not chrome... duno why
		if(integer.charAt(integer.length-1) == thousandSeparator) integer = integer.substring(0,integer.length-1);
		return integer;
	}

	/* verify settings */
	function checkSeparator(settings)
    {
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
    $.extend( $.ui.diginput, {
	    format: function( primaryData, separator, isSeparatorControled) {
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
                if(typeof isSeparatorControled != "boolean" && !isSeparatorControled && separator != undefined){
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
