import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { NotificationInstance } from 'antd/es/notification/interface';

// eslint-disable-next-line import/no-mutable-exports
let message: MessageInstance;
// eslint-disable-next-line import/no-mutable-exports
let notification: NotificationInstance;
// eslint-disable-next-line import/no-mutable-exports
let modal: Omit<ModalStaticFunctions, 'warn'>;

export default () => {
  const staticFunction = App.useApp();
  message = staticFunction.message;
  modal = staticFunction.modal;
  notification = staticFunction.notification;
  return null;
};

export { message, modal, notification };
