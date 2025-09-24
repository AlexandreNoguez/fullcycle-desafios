import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerCreatedEvent from "../customer-created.events";

export default class UpdateCustomerData
  implements EventHandlerInterface<CustomerCreatedEvent>
{
  handle(event: any): void {
    const { id, name, address } = event.eventData;
    const newAddress =
      address.street +
      ", " +
      address.number +
      ", " +
      address.zip +
      " - " +
      address.city;

    console.log(
      `Endereço do cliente: ${id}, ${name} alterado para: ${newAddress}`
    );
  }
}
