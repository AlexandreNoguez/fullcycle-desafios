import Customer from "../../customer/entity/customer";
import Address from "../../customer/value-object/address";
import CustomerCreatedEvent from "../../customer/event/customer-created.events";
import ShowConsoleAgainWhenCustomerIsCreatedHandler from "../../customer/event/handler/show-console-again.handler";
import ShowConsoleWhenCustomerIsCreatedHandler from "../../customer/event/handler/show-console.handler";
import UpdateCustomerData from "../../customer/event/handler/update-customer-data.handler";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain event dispatcher tests", () => {
  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("ProductCreatedEvent", eventHandler);
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      0
    );
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("ProductCreatedEvent", eventHandler);
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      price: 10.0,
      desciption: "Product 1 description",
    });

    // When notify, the event handler is called. So we use spy to check if the event handler was called
    eventDispatcher.notify(productCreatedEvent);
    expect(spyEventHandler).toHaveBeenCalled();
  });

  // customer event handlers
  it("should register customer and notify event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler1 = new ShowConsoleWhenCustomerIsCreatedHandler();
    const eventHandler2 = new ShowConsoleAgainWhenCustomerIsCreatedHandler();

    const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
    const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

    eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandler1);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(eventHandler2);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
    ).toBe(2);

    const customerCreatedEventData = new CustomerCreatedEvent({
      name: "Customer 1",
      email: "alex@email.com",
    });

    eventDispatcher.notify(customerCreatedEventData);
    expect(spyEventHandler1).toHaveBeenCalled();
    expect(spyEventHandler2).toHaveBeenCalled();
  });

  it("should create a new customer and update address then notify event handlers", () => {
    const createNewCustomer = new Customer("1", "Customer 1");
    expect(createNewCustomer.id).toBe("1");
    expect(createNewCustomer.name).toBe("Customer 1");

    createNewCustomer.changeAddress({
      street: "Street 1",
      number: 123,
      zip: "12345-678",
      city: "City 1",
    } as Address);

    expect(createNewCustomer.Address.street).toBe("Street 1");
    expect(createNewCustomer.Address.number).toBe(123);
    expect(createNewCustomer.Address.zip).toBe("12345-678");
    expect(createNewCustomer.Address.city).toBe("City 1");

    const eventDispatcher = new EventDispatcher();
    const updateCustomerAdressEventHandler = new UpdateCustomerData();
    const spyUpdateCustomerAdressEventHandler = jest.spyOn(
      updateCustomerAdressEventHandler,
      "handle"
    );

    eventDispatcher.register(
      "CustomerCreatedEvent",
      updateCustomerAdressEventHandler
    );

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(updateCustomerAdressEventHandler);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
    ).toBe(1);

    const eventData = {
      id: createNewCustomer.id,
      name: createNewCustomer.name,
      address: createNewCustomer.Address,
    };

    const customerCreatedEventData = new CustomerCreatedEvent(eventData);

    eventDispatcher.notify(customerCreatedEventData);
    expect(spyUpdateCustomerAdressEventHandler).toHaveBeenCalled();
  });
});
