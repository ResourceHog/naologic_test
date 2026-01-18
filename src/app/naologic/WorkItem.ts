import { WorkOrderDocument } from './documents/WorkOrderDocument';
import { WorkOrderStatus } from './documents/WorkOrderStatus';

//an adapter class to convert WorkOrderDocument to WorkOrder and back (through the ref property)
export class WorkOrder {
  ref: WorkOrderDocument;
  name: string;
  status: WorkOrderStatus;
  startDate: Date;
  endDate: Date;

  constructor(workOrderDocument: WorkOrderDocument) {
    this.name = workOrderDocument.data.name;
    this.status = workOrderDocument.data.status;
    this.startDate = new Date(workOrderDocument.data.startDate);
    this.endDate = new Date(workOrderDocument.data.endDate);
    this.ref = workOrderDocument;
  }
}
