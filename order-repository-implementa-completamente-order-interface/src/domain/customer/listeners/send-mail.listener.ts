import { CustomerCreated } from "../entity/customer-created.event";

export class SendMailListener {
  handle(event: CustomerCreated) {
    console.log(`Sending email to ${event.name}`);
  }
}
