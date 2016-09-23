import {
  Directive,
  Input,
  Output,
  ComponentRef,
  ViewContainerRef,
  EventEmitter,
  ComponentFactoryResolver,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  AfterViewChecked
} from "@angular/core";
import {DateTimePickerComponent} from "./datetime-picker.component";
import {DateTime} from "./datetime";

/**
 * If the given string is not a valid date, it defaults back to today
 */
@Directive({
  selector: '[datetime-picker], [ng2-datetime-picker]',
  providers: [DateTime],
  host: {
    '(click)': 'showDatetimePicker()',
    '(focus)': 'showDatetimePicker()',
    '(change)': 'valueChanged($event)'
  }
})
export class DateTimePickerDirective implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
  @Input('date-format')
  public dateFormat:string;
  @Input('date-only')
  public dateOnly:boolean;
  @Input('close-on-select')
  public closeOnSelect:string;

  @Input('ngModel')
  public ngModel:any;
  @Output('ngModelChange')
  public ngModelChange = new EventEmitter();

  /* input element */
  private _el:HTMLInputElement;
  /* dropdown element */
  private _datetimePickerEl:HTMLElement;
  /* dropdown component reference */
  private _componentRef:ComponentRef<DateTimePickerComponent>;

  public constructor (private resolver:ComponentFactoryResolver,
                      private viewContainerRef:ViewContainerRef) {
    this._el = this.viewContainerRef.element.nativeElement;
  }

  public ngOnInit ():void {
    //wrap this element with a <div> tag, so that we can position dynamic elememnt correctly
    let wrapper = document.createElement("div");
    wrapper.className = 'ng2-datetime-picker';
    wrapper.style.display = 'inline-block';
    wrapper.style.position = 'relative';
    this._el.parentElement.insertBefore(wrapper, this._el.nextSibling);
    wrapper.appendChild(this._el);

    // add a click listener to document, so that it can hide when others clicked
    document.body.addEventListener('click', this.hideDatetimePicker);
    this._el.addEventListener('keyup', this.keyEventListener);
  }

  public ngAfterViewChecked ():void {
    if (this._el['dateValue'] instanceof Date) {
      let value = this._getFormattedDateStr();
      if (value !== this._el.value) {
        this._el.value = value;
      }
    }
  }

  public ngOnChanges (changes:SimpleChanges):void {
    if (changes['ngModel'] !== undefined) {
      this.valueChanged(changes['ngModel'].currentValue, false);

      if (this._componentRef !== undefined) {
        this._componentRef.instance.initDateTime(<Date>this._el['dateValue']);
      }
    }
  }

  public ngOnDestroy ():void {
    // add a click listener to document, so that it can hide when others clicked
    document.body.removeEventListener('click', this.hideDatetimePicker);
    this._el.removeEventListener('keyup', this.keyEventListener);

    if (this._datetimePickerEl) {
      this._datetimePickerEl.removeEventListener('keyup', this.keyEventListener);
    }
  }

  /* input element string value is changed */
  public valueChanged (date:string | Date, emit:boolean = true):void {
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
      this.ngModel.toString = () => {
        return this._el.value;
      };
      if (emit) {
        this.ngModelChange.emit(this.ngModel);
      }
    }
  }

  //show datetimePicker element below the current element
  public showDatetimePicker () {
    if (this._componentRef) { /* if already shown, do nothing */
      return;
    }

    let factory = this.resolver.resolveComponentFactory(DateTimePickerComponent);

    this._componentRef = this.viewContainerRef.createComponent(factory);
    this._datetimePickerEl = this._componentRef.location.nativeElement;
    this._datetimePickerEl.addEventListener('keyup', this.keyEventListener);

    let component = this._componentRef.instance;
    component.initDateTime(<Date>this._el['dateValue']);
    component.dateOnly = this.dateOnly;

    this._styleDatetimePicker();

    component.changes.subscribe((date:Date) => {
      this.valueChanged(date);
    });
    component.closing.subscribe(() => {
      this.closeOnSelect !== "false" && this.hideDatetimePicker();
    });
  }

  public hideDatetimePicker = (event?):void => {
    if (this._componentRef) {
      if (/* invoked by clicking on somewhere in document */
      event &&
      event.type === 'click' &&
      event.target !== this._el && !this._elementIn(event.target, this._datetimePickerEl)
      ) {
        this._componentRef.destroy();
        this._componentRef = undefined;
      }
      else if (!event) {  /* invoked by function call */
        this._componentRef.destroy();
        this._componentRef = undefined;
      }
    }
  };

  private keyEventListener = (e:KeyboardEvent):void => {
    if (e.keyCode === 27) { //ESC key
      this.hideDatetimePicker();
    }
  };

  private _elementIn (el:Node, containerEl:Node):boolean {
    while (el = el.parentNode) {
      if (el === containerEl) {
        return true;
      }
    }
    return false;
  }

  private _styleDatetimePicker () {
    // setting position, width, and height of auto complete dropdown
    let thisElBCR = this._el.getBoundingClientRect();
    this._datetimePickerEl.style.width = thisElBCR.width + 'px';
    this._datetimePickerEl.style.position = 'absolute';
    this._datetimePickerEl.style.zIndex = '1000';
    this._datetimePickerEl.style.left = '0';
    this._datetimePickerEl.style.transition = 'height 0.3s ease-in';

    this._datetimePickerEl.style.visibility = 'hidden';

    setTimeout(() => {
      let thisElBcr = this._el.getBoundingClientRect();
      let datetimePickerElBcr = this._datetimePickerEl.getBoundingClientRect();

      if (thisElBcr.bottom + datetimePickerElBcr.height > window.innerHeight) {
        // if not enough space to show on below, show above
        this._datetimePickerEl.style.bottom = '0';
      }
      else {
        // otherwise, show below
        this._datetimePickerEl.style.top = thisElBcr.height + 'px';
      }
      this._datetimePickerEl.style.visibility = 'visible';
    });
  };

  /**
   *  returns toString function of date object
   */
  private _getFormattedDateStr ():string {

    if (this._el['dateValue']) {
      if (this.dateFormat) {
        return DateTime.momentFormatDate(this._el['dateValue'], this.dateFormat);
      }
      else {
        return DateTime.formatDate(this._el['dateValue'], this.dateOnly);
      }
    }
    else {
      return null;
    }
  }

  private _getDate (arg:string):Date {
    let date:Date;
    if (typeof arg === 'string') {
      if (this.dateFormat) {
        date = DateTime.momentParse(arg);
      }
      else {
        //remove timezone and respect day light saving time
        date = DateTime.parse(arg);
      }
    }
    else {
      date = <Date>arg;
    }
    return date;
  }
}