export type NotificationType =
  | "JOB_APPLICATION_RECEIVED"
  | "JOB_STATUS_UPDATED"
  | "PROJECT_INVITE"
  | "SYSTEM"
  | string;

export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string | null;
  read: boolean;
  createdAt: string;
  actorId?: number | null;
  actorName?: string | null;
  actorProfileImageUrl?: string | null;
};

export type NotificationListResponse = {
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  notifications: NotificationItem[];
};
