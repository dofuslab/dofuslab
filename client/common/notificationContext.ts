import { notification } from 'antd';
import { NotificationInstance } from 'antd/lib/notification/interface';
import { createContext } from 'react';

const NotificationContext = createContext<
  NotificationInstance | typeof notification
>(notification);

export default NotificationContext;
