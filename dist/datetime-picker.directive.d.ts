import { ViewContainerRef, EventEmitter, ComponentFactoryResolver, OnInit, OnChanges, OnDestroy, SimpleChanges, AfterViewChecked } from "@angular/core";
/**
 * If the given string is not a valid date, it defaults back to today
 */
export declare class DateTimePickerDirective implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
    private resolver;
    private viewContainerRef;
    dateFormat: string;
    dateOnly: boolean;
    closeOnSelect: string;
    ngModel: any;
    ngModelChange: EventEmitter<{}>;
    private _el;
    private _datetimePickerEl;
    private _componentRef;
    constructor(resolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef);
    ngOnInit(): void;
    ngAfterViewChecked(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    valueChanged(date: string | Date, emit?: boolean): void;
    showDatetimePicker(): void;
    hideDatetimePicker: (event?: any) => void;
    private keyEventListener;
    private _elementIn(el, containerEl);
    private _styleDatetimePicker();
    /**
     *  returns toString function of date object
     */
    private _getFormattedDateStr();
    private _getDate(arg);
}
