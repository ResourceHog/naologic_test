import { WorkOrderStatus } from './WorkOrderStatus';

export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string; // ISO format
    endDate: string; // ISO format
  };
}
