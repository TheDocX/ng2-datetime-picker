"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var datetime_picker_component_1 = require("./datetime-picker.component");
var datetime_1 = require("./datetime");
/**
 * If the given string is not a valid date, it defaults back to today
 */
var DateTimePickerDirective = (function () {
    function DateTimePickerDirective(resolver, viewContainerRef) {
        var _this = this;
        this.resolver = resolver;
        this.viewContainerRef = viewContainerRef;
        this.ngModelChange = new core_1.EventEmitter();
        this.hideDatetimePicker = function (event) {
            if (_this._componentRef) {
                if (event &&
                    event.type === 'click' &&
                    event.target !== _this._el && !_this._elementIn(event.target, _this._datetimePickerEl)) {
                    _this._componentRef.destroy();
                    _this._componentRef = undefined;
                }
                else if (!event) {
                    _this._componentRef.destroy();
                    _this._componentRef = undefined;
                }
            }
        };
        this.keyEventListener = function (e) {
            if (e.keyCode === 27) {
                _this.hideDatetimePicker();
            }
        };
        this._el = this.viewContainerRef.element.nativeElement;
    }
    DateTimePickerDirective.prototype.ngOnInit = function () {
        //wrap this element with a <div> tag, so that we can position dynamic elememnt correctly
        var wrapper = document.createElement("div");
        wrapper.className = 'ng2-datetime-picker';
        wrapper.style.display = 'inline-block';
        wrapper.style.position = 'relative';
        this._el.parentElement.insertBefore(wrapper, this._el.nextSibling);
        wrapper.appendChild(this._el);
        // add a click listener to document, so that it can hide when others clicked
        document.body.addEventListener('click', this.hideDatetimePicker);
        this._el.addEventListener('keyup', this.keyEventListener);
    };
    DateTimePickerDirective.prototype.ngAfterViewChecked = function () {
        if (this._el['dateValue'] instanceof Date) {
            var value = this._getFormattedDateStr();
            if (value !== this._el.value) {
                this._el.value = value;
            }
        }
    };
    DateTimePickerDirective.prototype.ngOnChanges = function (changes) {
        if (changes['ngModel'] !== undefined) {
            this.valueChanged(changes['ngModel'].currentValue, false);
        }
    };
    DateTimePickerDirective.prototype.ngOnDestroy = function () {
        // add a click listener to document, so that it can hide when others clicked
        document.body.removeEventListener('click', this.hideDatetimePicker);
        this._el.removeEventListener('keyup', this.keyEventListener);
        if (this._datetimePickerEl) {
            this._datetimePickerEl.removeEventListener('keyup', this.keyEventListener);
        }
    };
    /* input element string value is changed */
    DateTimePickerDirective.prototype.valueChanged = function (date, emit) {
        var _this = this;
        if (emit === void 0) { emit = true; }
        if (typeof date === 'string' && date) {
            this._el['dateValue'] = this._getDate(date);
        }
        else if (typeof date === 'object') {
            this._el['dateValue'] = date;
        }
        else {
            this._el['dateValue'] = null;
        }
        this._el.value = this._getFormattedDateStr();
        this.ngModel = this._el['dateValue'];
        if (this.ngModel) {
            this.ngModel.toString = function () {
                return _this._el.value;
            };
            if (emit) {
                this.ngModelChange.emit(this.ngModel);
            }
        }
    };
    //show datetimePicker element below the current element
    DateTimePickerDirective.prototype.showDatetimePicker = function () {
        var _this = this;
        if (this._componentRef) {
            return;
        }
        var factory = this.resolver.resolveComponentFactory(datetime_picker_component_1.DateTimePickerComponent);
        this._componentRef = this.viewContainerRef.createComponent(factory);
        this._datetimePickerEl = this._componentRef.location.nativeElement;
        this._datetimePickerEl.addEventListener('keyup', this.keyEventListener);
        var component = this._componentRef.instance;
        component.initDateTime(this._el['dateValue']);
        component.dateOnly = this.dateOnly;
        this._styleDatetimePicker();
        component.changes.subscribe(function (date) {
            _this.valueChanged(date);
        });
        component.closing.subscribe(function () {
            _this.closeOnSelect !== "false" && _this.hideDatetimePicker();
        });
    };
    DateTimePickerDirective.prototype._elementIn = function (el, containerEl) {
        while (el = el.parentNode) {
            if (el === containerEl) {
                return true;
            }
        }
        return false;
    };
    DateTimePickerDirective.prototype._styleDatetimePicker = function () {
        var _this = this;
        // setting position, width, and height of auto complete dropdown
        var thisElBCR = this._el.getBoundingClientRect();
        this._datetimePickerEl.style.width = thisElBCR.width + 'px';
        this._datetimePickerEl.style.position = 'absolute';
        this._datetimePickerEl.style.zIndex = '1000';
        this._datetimePickerEl.style.left = '0';
        this._datetimePickerEl.style.transition = 'height 0.3s ease-in';
        this._datetimePickerEl.style.visibility = 'hidden';
        setTimeout(function () {
            var thisElBcr = _this._el.getBoundingClientRect();
            var datetimePickerElBcr = _this._datetimePickerEl.getBoundingClientRect();
            if (thisElBcr.bottom + datetimePickerElBcr.height > window.innerHeight) {
                // if not enough space to show on below, show above
                _this._datetimePickerEl.style.bottom = '0';
            }
            else {
                // otherwise, show below
                _this._datetimePickerEl.style.top = thisElBcr.height + 'px';
            }
            _this._datetimePickerEl.style.visibility = 'visible';
        });
    };
    ;
    /**
     *  returns toString function of date object
     */
    DateTimePickerDirective.prototype._getFormattedDateStr = function () {
        if (this._el['dateValue']) {
            if (this.dateFormat) {
                return datetime_1.DateTime.momentFormatDate(this._el['dateValue'], this.dateFormat);
            }
            else {
                return datetime_1.DateTime.formatDate(this._el['dateValue'], this.dateOnly);
            }
        }
        else {
            return null;
        }
    };
    DateTimePickerDirective.prototype._getDate = function (arg) {
        var date;
        if (typeof arg === 'string') {
            if (this.dateFormat) {
                date = datetime_1.DateTime.momentParse(arg);
            }
            else {
                //remove timezone and respect day light saving time
                date = datetime_1.DateTime.parse(arg);
            }
        }
        else {
            date = arg;
        }
        return date;
    };
    __decorate([
        core_1.Input('date-format'), 
        __metadata('design:type', String)
    ], DateTimePickerDirective.prototype, "dateFormat", void 0);
    __decorate([
        core_1.Input('date-only'), 
        __metadata('design:type', Boolean)
    ], DateTimePickerDirective.prototype, "dateOnly", void 0);
    __decorate([
        core_1.Input('close-on-select'), 
        __metadata('design:type', String)
    ], DateTimePickerDirective.prototype, "closeOnSelect", void 0);
    __decorate([
        core_1.Input('ngModel'), 
        __metadata('design:type', Object)
    ], DateTimePickerDirective.prototype, "ngModel", void 0);
    __decorate([
        core_1.Output('ngModelChange'), 
        __metadata('design:type', Object)
    ], DateTimePickerDirective.prototype, "ngModelChange", void 0);
    DateTimePickerDirective = __decorate([
        core_1.Directive({
            selector: '[datetime-picker], [ng2-datetime-picker]',
            providers: [datetime_1.DateTime],
            host: {
                '(click)': 'showDatetimePicker()',
                '(focus)': 'showDatetimePicker()',
                '(change)': 'valueChanged($event)'
            }
        }), 
        __metadata('design:paramtypes', [core_1.ComponentFactoryResolver, core_1.ViewContainerRef])
    ], DateTimePickerDirective);
    return DateTimePickerDirective;
}());
exports.DateTimePickerDirective = DateTimePickerDirective;
//# sourceMappingURL=datetime-picker.directive.js.map