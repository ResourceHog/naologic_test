import { Component, signal, HostListener } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { WorkCenter } from './workCenter';
import { WorkOrderStatus } from './documents/WorkOrderStatus';
import { DrawerModule } from 'primeng/drawer';
import { WorkOrder } from './WorkItem';

@Component({
  selector: 'naologic',
  imports: [
    CommonModule,
    ButtonModule,
    SelectModule,
    ReactiveFormsModule,
    DrawerModule,
    FormsModule,
  ],
  templateUrl: './naologic.html',
  styleUrl: './naologic.scss',
})
export class NaologicComponent {
  protected readonly title = signal('naologic');
  zoomLevel = signal(['Hour', 'Day', 'Week', 'Month']);
  selectedZoom = 'Month';

  onZoomChange(): void {
    // Trigger change detection for dates getter
    // This ensures the Gantt chart updates when zoom level changes
  }

  // Reactive form
  workOrderForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.workOrderForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        status: ['Open', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
      },
      { validators: [this.dateRangeValidator, this.overlapValidator.bind(this)] },
    );
  }

  // Custom validator to check if start date is before end date
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return { dateRange: true };
      }
    }

    return null;
  }

  // Custom validator to check for overlapping work orders in the same center
  overlapValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (startDate && endDate && this.selectedWorkCenter) {
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);

      // Check for overlaps with other work orders in the same center
      const hasOverlap = this.selectedWorkCenter.workItems.some((item: any) => {
        // Skip the current work order being edited
        if (this.selectedWorkOrder && item.ref.docId === this.selectedWorkOrder.ref.docId) {
          return false;
        }

        const existingStart = item.startDate;
        const existingEnd = item.endDate;

        // Check if date ranges overlap
        return newStart < existingEnd && newEnd > existingStart;
      });

      if (hasOverlap) {
        return { overlap: true };
      }
    }

    return null;
  }

  workCenters = signal([
    //example
    new WorkCenter(
      {
        docId: 'wc1',
        docType: 'workCenter',
        data: { name: 'Alpha Manufacturing' },
      },
      [
        {
          docId: 'wo1',
          docType: 'workOrder',
          data: {
            name: 'Order 1001',
            workCenterId: 'wc1',
            status: 'In Progress',
            startDate: '2026-01-05',
            endDate: '2026-02-20',
          },
        },
        {
          docId: 'wo2',
          docType: 'workOrder',
          data: {
            name: 'Order 1002',
            workCenterId: 'wc1',
            status: 'Complete',
            startDate: '2026-03-01',
            endDate: '2026-04-15',
          },
        },
        {
          docId: 'wo3',
          docType: 'workOrder',
          data: {
            name: 'Order 1003',
            workCenterId: 'wc1',
            status: 'Open',
            startDate: '2026-05-01',
            endDate: '2026-06-10',
          },
        },
      ],
    ),
    new WorkCenter(
      {
        docId: 'wc2',
        docType: 'workCenter',
        data: { name: 'Beta Electronics' },
      },
      [
        {
          docId: 'wo4',
          docType: 'workOrder',
          data: {
            name: 'Circuit Assembly',
            workCenterId: 'wc2',
            status: 'Blocked',
            startDate: '2026-01-15',
            endDate: '2026-03-15',
          },
        },
        {
          docId: 'wo5',
          docType: 'workOrder',
          data: {
            name: 'Quality Testing',
            workCenterId: 'wc2',
            status: 'In Progress',
            startDate: '2026-04-01',
            endDate: '2026-05-30',
          },
        },
      ],
    ),
    new WorkCenter(
      {
        docId: 'wc3',
        docType: 'workCenter',
        data: { name: 'Gamma Logistics' },
      },
      [
        {
          docId: 'wo6',
          docType: 'workOrder',
          data: {
            name: 'Warehouse Setup',
            workCenterId: 'wc3',
            status: 'Complete',
            startDate: '2026-02-01',
            endDate: '2026-03-30',
          },
        },
      ],
    ),
    new WorkCenter(
      {
        docId: 'wc4',
        docType: 'workCenter',
        data: { name: 'Delta Services' },
      },
      [
        {
          docId: 'wo7',
          docType: 'workOrder',
          data: {
            name: 'Maintenance Check',
            workCenterId: 'wc4',
            status: 'Open',
            startDate: '2026-03-15',
            endDate: '2026-05-15',
          },
        },
      ],
    ),
    new WorkCenter(
      {
        docId: 'wc5',
        docType: 'workCenter',
        data: { name: 'Epsilon Research' },
      },
      [
        {
          docId: 'wo8',
          docType: 'workOrder',
          data: {
            name: 'Product Development',
            workCenterId: 'wc5',
            status: 'In Progress',
            startDate: '2026-01-25',
            endDate: '2026-04-25',
          },
        },
        {
          docId: 'wo9',
          docType: 'workOrder',
          data: {
            name: 'Patent Research',
            workCenterId: 'wc5',
            status: 'Blocked',
            startDate: '2026-05-15',
            endDate: '2026-08-15',
          },
        },
      ],
    ),
  ]);

  get dates(): string[] {
    const currentDate = new Date();
    const dates: string[] = [];

    // Find the earliest start date and latest end date from all work orders
    let earliestStartDate = new Date(currentDate);
    let latestEndDate = new Date(currentDate);

    this.workCenters().forEach((workCenter) => {
      workCenter.workItems.forEach((workItem) => {
        const startDate = new Date(workItem.startDate);
        const endDate = new Date(workItem.endDate);

        if (startDate < earliestStartDate) {
          earliestStartDate = startDate;
        }
        if (endDate > latestEndDate) {
          latestEndDate = endDate;
        }
      });
    });

    switch (this.selectedZoom) {
      case 'Hour':
        // Start one hour before earliest work order
        const startHour = new Date(earliestStartDate);
        startHour.setHours(startHour.getHours() - 1);

        const totalHours = Math.ceil(
          (latestEndDate.getTime() - startHour.getTime()) / (1000 * 60 * 60),
        );
        const hoursToShow = Math.max(24, totalHours + 24); // At least 24 hours, plus buffer

        for (let i = 0; i < hoursToShow; i++) {
          const hour = new Date(startHour);
          hour.setHours(startHour.getHours() + i, 0, 0, 0);
          dates.push(hour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }));
        }
        break;

      case 'Day':
        // Start one day before earliest work order
        const startDay = new Date(earliestStartDate);
        startDay.setDate(startDay.getDate() - 1);

        const totalDays = Math.ceil(
          (latestEndDate.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24),
        );
        const daysToShow = Math.max(30, totalDays + 7); // At least 30 days, plus buffer

        for (let i = 0; i < daysToShow; i++) {
          const day = new Date(startDay);
          day.setDate(startDay.getDate() + i);
          dates.push(day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;

      case 'Week':
        // Start one week before earliest work order
        const earliestWeekStart = new Date(earliestStartDate);
        earliestWeekStart.setDate(earliestStartDate.getDate() - earliestStartDate.getDay());
        const startWeek = new Date(earliestWeekStart);
        startWeek.setDate(earliestWeekStart.getDate() - 7);

        const totalWeeks = Math.ceil(
          (latestEndDate.getTime() - startWeek.getTime()) / (1000 * 60 * 60 * 24 * 7),
        );
        const weeksToShow = Math.max(12, totalWeeks + 2); // At least 12 weeks, plus buffer

        for (let i = 0; i < weeksToShow; i++) {
          const weekStart = new Date(startWeek);
          weekStart.setDate(startWeek.getDate() + i * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          dates.push(
            `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          );
        }
        break;

      case 'Month':
      default:
        // Start one month before earliest work order
        const earliestYear = earliestStartDate.getFullYear();
        const earliestMonth = earliestStartDate.getMonth();
        const startMonth = new Date(earliestYear, earliestMonth - 1, 1);

        const latestYear = latestEndDate.getFullYear();
        const latestMonth = latestEndDate.getMonth();

        const totalMonths =
          (latestYear - startMonth.getFullYear()) * 12 + (latestMonth - startMonth.getMonth());
        const monthsToShow = Math.max(12, totalMonths + 2); // At least 12 months, plus buffer

        for (let i = 0; i < monthsToShow; i++) {
          const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
          dates.push(month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        }
        break;
    }

    return dates;
  }

  getWorkOrderClass(status: WorkOrderStatus): string {
    switch (status) {
      case 'In Progress':
        return 'in-progress';
      case 'Complete':
        return 'completed';
      case 'Open':
        return 'in-progress';
      case 'Blocked':
        return 'blocked';
      default:
        return 'in-progress';
    }
  }

  getWorkOrderLeft(startDate: Date): number {
    let position = 0;

    // Find the earliest start date from all work orders
    let earliestStartDate = new Date();
    this.workCenters().forEach((workCenter) => {
      workCenter.workItems.forEach((workItem) => {
        const itemStartDate = new Date(workItem.startDate);
        if (itemStartDate < earliestStartDate) {
          earliestStartDate = itemStartDate;
        }
      });
    });

    switch (this.selectedZoom) {
      case 'Hour':
        // Reference point is one hour before earliest work order
        const referenceHour = new Date(earliestStartDate);
        referenceHour.setHours(referenceHour.getHours() - 1);

        const hourDiff = Math.floor(
          (startDate.getTime() - referenceHour.getTime()) / (1000 * 60 * 60),
        );
        position = Math.max(0, hourDiff * 113);
        break;

      case 'Day':
        // Reference point is one day before earliest work order
        const referenceDay = new Date(earliestStartDate);
        referenceDay.setDate(referenceDay.getDate() - 1);

        const dayDiff = Math.floor(
          (startDate.getTime() - referenceDay.getTime()) / (1000 * 60 * 60 * 24),
        );
        position = Math.max(0, dayDiff * 113);
        break;

      case 'Week':
        // Reference point is one week before earliest work order week
        const earliestWeekStart = new Date(earliestStartDate);
        earliestWeekStart.setDate(earliestStartDate.getDate() - earliestStartDate.getDay());
        const referenceWeek = new Date(earliestWeekStart);
        referenceWeek.setDate(earliestWeekStart.getDate() - 7);
        referenceWeek.setHours(0, 0, 0, 0);

        const weekDiff = Math.floor(
          (startDate.getTime() - referenceWeek.getTime()) / (1000 * 60 * 60 * 24 * 7),
        );
        position = Math.max(0, weekDiff * 113);
        break;

      case 'Month':
      default:
        // Reference point is one month before earliest work order
        const earliestYear = earliestStartDate.getFullYear();
        const earliestMonth = earliestStartDate.getMonth();
        const referenceMonth = new Date(earliestYear, earliestMonth - 1, 1);

        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const startDay = startDate.getDate();

        // Calculate months from reference month
        const monthDiff =
          (startYear - referenceMonth.getFullYear()) * 12 +
          (startMonth - referenceMonth.getMonth());

        if (monthDiff >= 0) {
          // Get days in the start month for fractional positioning
          const daysInMonth = new Date(startYear, startMonth + 1, 0).getDate();
          const dayFraction = (startDay - 1) / daysInMonth;
          position = monthDiff * 113 + dayFraction * 113;
        }
        break;
    }

    return position;
  }

  getWorkOrderWidth(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    let width = 113; // Default minimum width

    switch (this.selectedZoom) {
      case 'Hour':
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        width = Math.max(113 / 24, hoursDiff * 113); // Minimum 1 hour width
        break;

      case 'Day':
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        width = Math.max(113 / 30, daysDiff * 113); // Minimum 1 day width
        break;

      case 'Week':
        const weeksDiff = timeDiff / (1000 * 60 * 60 * 24 * 7);
        width = Math.max(113 / 12, weeksDiff * 113); // Minimum 1 week width
        break;

      case 'Month':
      default:
        const daysDiffForMonth = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const avgDaysPerMonth = 365.25 / 12;
        const monthsFraction = daysDiffForMonth / avgDaysPerMonth;
        const minWidth = 113 / avgDaysPerMonth;
        width = Math.max(minWidth, monthsFraction * 113);
        break;
    }

    return width;
  }

  // Dropdown menu functionality
  private openDropdownId: string | null = null;

  // Drawer functionality
  drawerVisible = false;
  selectedWorkOrder: any = null;
  selectedWorkCenter: any = null;
  statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Complete', value: 'Complete' },
    { label: 'Blocked', value: 'Blocked' },
  ];

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isDropdownOpen(docId: string): boolean {
    return this.openDropdownId === docId;
  }

  toggleDropdown(docId: string): void {
    event?.stopPropagation();
    this.openDropdownId = this.openDropdownId === docId ? null : docId;
  }

  createNewWorkOrder(workCenter: WorkCenter): void {
    this.isEditing = false;
    this.selectedWorkCenter = workCenter;
    this.selectedWorkOrder = null; // Clear any existing selection

    // Reset and populate form with default values
    this.workOrderForm.reset({
      name: '',
      status: 'Open',
      startDate: this.formatDateForInput(new Date()),
      endDate: this.formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days from now
    });

    this.drawerVisible = true;
    this.openDropdownId = null;
  }

  isEditing: boolean = false;

  editWorkOrder(workOrder: WorkOrder, workCenter: WorkCenter): void {
    this.isEditing = true;
    this.selectedWorkOrder = workOrder;
    this.selectedWorkCenter = workCenter; // Set the work center for validation

    // Populate the reactive form
    this.workOrderForm.patchValue({
      name: workOrder.name,
      status: workOrder.status,
      startDate: this.formatDateForInput(workOrder.startDate),
      endDate: this.formatDateForInput(workOrder.endDate),
    });

    this.drawerVisible = true;
    this.openDropdownId = null;
  }

  saveWorkOrder(): void {
    if (this.workOrderForm.valid) {
      const formValue = this.workOrderForm.value;

      if (this.selectedWorkOrder) {
        this.selectedWorkOrder.name = formValue.name;
        this.selectedWorkOrder.status = formValue.status;
        this.selectedWorkOrder.startDate = new Date(formValue.startDate);
        this.selectedWorkOrder.endDate = new Date(formValue.endDate);
      } else if (this.selectedWorkCenter) {
        // Creating new work order
        const newWorkOrder = new WorkOrder({
          docId: `wo${Date.now()}`, // Simple unique ID
          docType: 'workOrder',
          data: {
            name: formValue.name,
            workCenterId: this.selectedWorkCenter.name,
            status: formValue.status,
            startDate: formValue.startDate,
            endDate: formValue.endDate,
          },
        });

        // Add to the selected work center
        this.selectedWorkCenter.workItems.push(newWorkOrder);
        console.log('Created new work order:', newWorkOrder);
      }

      this.closeDrawer();
    } else {
      // Mark all fields as touched to show validation errors
      this.workOrderForm.markAllAsTouched();
    }
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.isEditing = false;
    this.selectedWorkOrder = null;
    this.selectedWorkCenter = null;
    this.workOrderForm.reset();
  }

  deleteWorkOrder(workOrder: any): void {
    console.log('Delete work order:', workOrder);
    this.openDropdownId = null;
  }

  duplicateWorkOrder(workOrder: any): void {
    console.log('Duplicate work order:', workOrder);
    this.openDropdownId = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close dropdown when clicking outside
    if (!(event.target as Element)?.closest('.work-item-actions')) {
      this.openDropdownId = null;
    }
  }
}
