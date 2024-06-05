import { Component, OnInit, EventEmitter, Input, OnDestroy } from '@angular/core';
import { BbGridDecorator } from '../BbClass';
import { BehaviorSubject, takeUntil, Subject } from 'rxjs';

@Component({
    selector: 'app-table',
    template: `
            <div>
                <div [class]="sNgContentClass">
                    <ng-content></ng-content>
                    <ng-content></ng-content>
                    <ng-content></ng-content>
                </div>
                <p-table *ngIf="headerList.length>0" [columns]="headerList" [value]="dataGridList" styleClass="p-datatable-striped p-datatable-gridlines p-datatable-sm"
                [paginator]="isPagination" [rows]="10" [rowsPerPageOptions]="[5,10,25,50]"
                        [showCurrentPageReport]="true" responsiveLayout="scroll" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                        dataKey="{{dataKeyId}}" (onRowSelect)="onRowSelect($event)" (onRowUnselect)="onRowUnselect()" [selectionMode]="selectionMode" [(selection)]="rowData">

                    <ng-template pTemplate="header" let-columns>
                        <tr>
                            <th *ngIf="isCheckBoxRequired" style="width: 3rem">
                                <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                            </th>

                            <th *ngFor="let col of columns" >
                                <span pSortableColumn="{{col.filterColumn}}">{{ col.head_name }} </span>
                                <p-columnFilter *ngIf="col.is_filter"  type="text" field="{{col.filterColumn}}" display="menu"></p-columnFilter>
                            </th>

                            <th *ngIf="isActionButton">{{sActionName}}</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-rowIndex="rowIndex" let-searchData>
                        <tr [pSelectableRow]="searchData">
                            <td *ngIf="isCheckBoxRequired">
                                <p-tableCheckbox binary="true" [value]="searchData"></p-tableCheckbox>
                            </td>
                            <td>{{rowIndex+1}}</td>
                            <td *ngFor="let col of bodyTagList">
                                <span>{{searchData[col.bodyTag]}} </span>
                            </td>
                            <td *ngIf="isActionButton"> <button pButton pRipple type="button" class={{sActionClass}} icon={{sIcon}}
                                            (click)="action(searchData)"></button></td>
                        </tr>
                    </ng-template>
                </p-table>

            </div>
    `,
    inputs: ["dataGridList", 'oGridDecorator'],
    outputs: ['oSelect', 'oUnSelect', 'oAction']
})

/*
This dynamic table component is for light weight data manipulation with limited functionality.
if there is large volume of data, this may not your perfect choice

Input param description:
    1) dataGridList, oGridDecorator must need to use this table component. It define dynamic row, dynamic header and dynamic bodyTag.
    2) oGridDecorator is a instance of BbGridDecorator WHERE dataKey, template, header and body tag list are defined.
    3) If there is any action (ex: Edit, Delete, Approve, Review) then must need dataKeyId.

Output param description:
    1) oSelect defines which data you are selected. Mainly use when we need different types of action.(ex: Edit, Delete, Approve, Review)
    2) oUnSelect defines unselect the data.

Usability
    1. Import BbGridDecorator class
        import { BbGridDecorator } from '../../utility/building-blocks/BbClass';
import { BehaviorSubject } from 'rxjs';
    2. Initialize the class
        oBBBasicAction: BbBasicAction = new BbBasicAction();
    3. Decorate the class
            this.oGridDecorator.dataKeyId='<primary key>'; E.g: employee_id
                [N.B: The above property is mandatory if you want to perform any action like Edit, Delete, Approve, Review]
            this.oGridDecorator.tableHeaders= E.g:  ['Code'         , 'Employee Name', 'Official'     , 'Withdrawal Amount' , 'Settlement Date', 'Review By', 'Approved By'];
                [N:B: Mandatory]
            this.oGridDecorator.bodyTags=     E.g: ['employee_code', 'employee_name', 'official_info', 'withdraw_amount'   , 'settlement_date', 'review_by', 'approve_by'];
                [N:B: Mandatory]
            this.oGridDecorator.filterColumns=E.g: ['employee_code']
                [N:B: Not Mandatory. If you want to filter you just enter the bodyTag name to the array]
            this.oGridDecorator.isCheckBoxRequired=true;
                [N:B: Not Mandatory. If you need table with checkbox the set it true. By default it is false.]
*/


export class TableComponent implements OnInit, OnDestroy {
    dead$ = new Subject();
    rowData: any;
    rowSelected: boolean = false;
    selectedRow: any[];
    headerList: any = [];
    bodyTagList: any = [];
    dataKeyId: any;
    tableTemplete: any;
    isCheckBoxRequired: boolean = false;
    isActionButton: boolean = false;
    sActionName: string = '';
    sActionClass: string = '';
    sIcon: string = '';
    isPagination: boolean = true;
    sNgContentClass: string = '';
    selectionMode: string = 'single';

    //input params
    dataGridList: any = [];
    oGridDecorator: BbGridDecorator;
    @Input() selected_row = new BehaviorSubject<any | null>(null);

    //output params
    oSelect = new EventEmitter<any>();
    oUnSelect = new EventEmitter<any>();
    oAction = new EventEmitter<any>();

    constructor() { }
    ngOnDestroy(): void {
        this.selected_row.next(null);
        this.selected_row.unsubscribe();
    }

    ngOnInit(): void {
        ///*
        //    1) Take key name to bind body tag list using  map
        //    2) Take only first element to get header name, because we know header of all data is same
        //    3) need to return data header/key name formatted way.
        //*/
        //let res = this.dataList.map(x => Object.keys(x));
        //for (let i = 0; i < res[0].length; i++) {
        //    let obj = { 'bodyTag': res[0][i] };
        //    this.bodyTagList.push(obj);
        //}
       
        this.makeTable();
        this.selected_row.pipe(takeUntil(this.dead$)).subscribe(s => {
            if (s) {

                this.rowSelected = true;
                this.rowData = s;
            }
        });
    }

    private makeTable() {
        this.dataKeyId = this.oGridDecorator.dataKeyId;
        //this.tableTemplete=this.oGridDecorator.tableTemplete;
        this.isCheckBoxRequired = this.oGridDecorator.isCheckBoxRequired;
        this.selectionMode = this.isCheckBoxRequired ? 'multiple' : 'single'
        this.isPagination = this.oGridDecorator.isPagination;
        this.isActionButton = this.oGridDecorator.isActionButton;
        this.sActionName = this.oGridDecorator.sActionName;
        this.sActionClass = this.oGridDecorator.sActionClass;
        this.sIcon = this.oGridDecorator.sIcon;
        if (this.oGridDecorator.isNgContentRight) { this.sNgContentClass = 'grid mb-2 mt-2 ml-1 flex justify-content-end md:pl-5 md:pr-5 md:pt-4' }

        let tableHeader = null;
        let bodyTag = null;
        let bFilterColumn = false;

        if (this.oGridDecorator.tableHeaders.length > 0) {
            this.headerList.push({ 'head_name': 'SL', 'is_filter': false });
        }

        for (let i = 0; i < this.oGridDecorator.tableHeaders.length; i++) {
            tableHeader = this.oGridDecorator.tableHeaders[i].toString();
            bodyTag = this.oGridDecorator.bodyTags[i].toString();
            bFilterColumn = this.oGridDecorator.filterColumns.includes(bodyTag);

            this.headerList.push({ 'head_name': tableHeader, 'filterColumn': bodyTag, 'is_filter': bFilterColumn });
            this.bodyTagList.push({ 'bodyTag': bodyTag });
        }
    }

    onRowSelect(event) {
        this.rowSelected = true;
        this.rowData = event.data;
        this.oSelect.emit(this.rowData);
    }

    onRowUnselect() {
        this.rowSelected = false;
        this.rowData = null;
        this.selected_row.next(null);
        this.oUnSelect.emit();
    }
    action(event) {
        this.oAction.emit(event);
    }

}


