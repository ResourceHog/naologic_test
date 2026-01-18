import { WorkCenterDocument } from './documents/WorkCenterDocument';
import { WorkOrderDocument } from './documents/WorkOrderDocument';
import { WorkOrder } from './WorkItem';

export class WorkCenter {
  ref: WorkCenterDocument;
  name: string;
  constructor(workCenterDocument: WorkCenterDocument, workOrders: WorkOrderDocument[]) {
    this.name = workCenterDocument.data.name;
    this.ref = workCenterDocument;
    this.workItems = workOrders.map((workOrderDocument) => new WorkOrder(workOrderDocument));
  }
  //for now all centers have same work items representing each status
  workItems: WorkOrder[] = [];
  isHovered: boolean = false;
}
