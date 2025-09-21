import { Mediator } from "./domain/@shared/service/mediator";
import { CustomerCreated } from "./domain/customer/entity/customer-created.event";
import { SendMailListener } from "./domain/customer/listeners/send-mail.listener";

const mediator = new Mediator();

const sendMailListener = new SendMailListener();

mediator.register(CustomerCreated.name, (event: CustomerCreated) => {
  sendMailListener.handle(event);
});
