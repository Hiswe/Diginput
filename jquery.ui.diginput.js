/*
 * jQuery UI Diginput @1.0
 *
 * Copyright 2010, �Hiswe
 * https://github.com/Hiswe/Diginput
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
			debug:false
        },
		_create: function()
        {
            if (this.options.debug && typeof window.console === "undefined") this.options.debug = false;
            this.id = this.element.attr('id');
            if (this.options.debug) console.info('[DIGINPUT] create #',this.id);
            this._isDisabled = false;
            this._isInitialised = false;
            var type = this.element.attr('type');
            type = (type)? type : 'text';
            if(this.element.is('input') && type == 'text')
            {
                this._isInitialised = true;
                var $button = null;
                this.options.separator = checkSeparator(this.options.separator);
                this._makeCopy();
                this.value(this.element.val(), true);
                this.$copy.bind({
                   'keyup.diginput' : $.proxy(this._keyUp, this),
                   'keyUpress.diginput' : $.proxy(this._validKey, this),
                   'change.diginput' : $.proxy(this._copyChangeEvent, this)
                });
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
                this._error();
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
                    if(self.options.debug) console.log('[DIGINPUT] event :: keyUp with different data');
					self.value(newData);
				}
                else
                {
                    if(self.options.debug) console.log('[DIGINPUT] event :: keyUp with same data');
                }
				// TODO callBack
			},200);
		},
		_makeCopy: function(){ // copy the input and hide the original
			var $copy = this.element.clone(),
                newId = this.element.attr('id')+this.options.idSuffix,
                newName = this.element.attr('name')+this.options.idSuffix;

			$copy.addClass(this.options.classInput)
				.attr('id', newId)
				.attr('name', newName)
				.insertBefore(this.element);
			// Change the label
			var $label = $('label[for='+this.element.attr('id')+']');
			if($label.length) $label.attr('for', newId);
			// mask the previous label
			(this.options.debug) ? this.element.fadeTo('normal', 0.5) : this.element.hide();
			this.$copy = $copy;
		},
		_x1000: function(event)
        {
			event.preventDefault();
			event.stopPropagation();
            if (!this._isDisabled){
                if (this.options.debug) console.log('[Event] Change | original Input');
                var rawData = this.element.val();
                if (!rawData) rawData = 1;
                var multipliedData = rawData * 1000;
                if (multipliedData.toString().indexOf('e') == -1){
                    this.value(multipliedData);
                }
                this.element.trigger('change');
            }
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
            if(this._isInitialised){
                this.$copy.fadeOut('fast',function(){$(this).remove()});
                if (this.options.x1000Button != '') this.$button.fadeOut('fast',function(){$(this).remove()});
            }
			$.Widget.prototype.destroy.call( this );
		},
        isDisabled: function(){
            return this._isDisabled;
        },
		disable: function (withAnimation) {
            if(this._isInitialised){
                if (typeof withAnimation !== "undefined" && withAnimation === false) {
                    this.$copy.attr('disabled','disabled')
                    .css('opacity',0.85).addClass(this.options.disabledClass);
                    if(this.$button){
                        this.$button.addClass(this.options.disabledClass).css('opacity',0.5);
                    }
                }else{
                    this.$copy.attr('disabled','disabled')
                    .fadeTo('normal',0.85,$.proxy(function(){
                        this.$copy.addClass(this.options.disabledClass);
                    },this));
                    if(this.$button){
                        this.$button.addClass(this.options.disabledClass).fadeTo('normal',0.5);
                    }
                }
                this._isDisabled = true;
            }else{
                this._error();
            }
		},
		enable: function (withAnimation) {
            if(this._isInitialised){
                if (typeof withAnimation !== "undefined" && withAnimation === false) {
                    this.$copy.removeClass(this.options.disabledClass)
                        .attr('disabled','')
                        .css('opacity',1);
                    if(this.$button){
                        this.$button.removeClass(this.options.disabledClass).css('opacity',1);
                    }
                }else{
                    this.$copy.removeClass(this.options.disabledClass)
                        .attr('disabled','')
                        .fadeTo('normal',1);
                    if(this.$button){
                        this.$button.removeClass(this.options.disabledClass).fadeTo('normal',1);
                    }
                }

                this._isDisabled = false;
            }else{
                this._error();
            }
		},
        _error: function(){
            if (this.options.debug && console.warn) console.warn('[DIGINPUT] #', this.id,' has not been initialised properly');
        },
        value: function(value, onCreate)
        {
            if(this._isInitialised){
                onCreate = (typeof onCreate === "undefined") ? false : onCreate;
                if(typeof value == "undefined"){
                     return this.inputValue;
                 }
                else
                {
                    this.inputValue = $.ui.diginput.format(value, this.options.separator, true);
                    this.$copy.val(this.inputValue.string).trigger('diginputupdate', onCreate);
                    this.element.val(this.inputValue.number);
                }
            }else{
                this._error();
            }
        },
		_setOption: function(key, value){
			$.Widget.prototype._setOption.apply(this, arguments);
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

        if(thousandSeparator !== ''){ // don't need a separator if empty string
            integer = integer.replace(/\B(?=(\d\d\d)*$)/g,thousandSeparator);
            // firefox need it, not chrome... duno why
            if(integer.charAt(integer.length-1) == thousandSeparator) integer = integer.substring(0,integer.length-1);
        }
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
				},
                numberSetting: {
                    floatSep: '.',
					floatFix: ',',
					spacing: ''
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
            case 'number':
				settings = template.numberSetting;
				break;
			default:
		// Use of default valued surcharged by the user separator and the - sign
			var alreadyUsedChar='';
			$.each(settings, function(key, value){
                if (value !== ''){  // accept empty string
                   // remove all used char
                    var removeReg = new RegExp("[0-9-"+alreadyUsedChar+"]", "g");
                    var newValue = value.replace(removeReg, '');
                    //
                    if(newValue){
                        var character = newValue.substr(0,1);
                        settings[key] = character;
                        alreadyUsedChar += character;
                    }else{
                        settings[key] = template.frSetting[key];
                        alreadyUsedChar += template.frSetting[key];
                    }
                }
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
                var isNegative = false;
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
                    // test if it's a negative number
                    if(/^-{1}/.test(primaryData)) isNegative = true;
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
                if(isNegative){
                    cleanDataNumber = -cleanDataNumber;
                    cleanDataFormat = '-'+cleanDataFormat;
                }
                return {    number : cleanDataNumber,
                            string : cleanDataFormat
                };
	    }
    });
})(jQuery);