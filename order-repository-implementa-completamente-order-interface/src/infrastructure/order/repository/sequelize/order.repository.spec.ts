import { Sequelize } from "sequelize-typescript";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";
import OrderItem from "../../../../domain/order/order-item";
import Order from "../../../../domain/order/order";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    customer.changeAddress(
      new Address("Street", 1, "123456789", "Porto Alegre")
    );
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("p1", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "order-item-1",
      product.name,
      product.price,
      product.id,
      1
    );
    const order = new Order("order-1", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const foundOrder = await orderRepository.find("order-1");

    expect(foundOrder).toStrictEqual(order);
  });

  it("should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("c1", "Customer 1");
    customer.changeAddress(
      new Address("Street", 1, "123456789", "Porto Alegre")
    );
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("p1", "Product 1", 20);
    await productRepository.create(product);

    const orderItem1 = new OrderItem(
      "order-item-1",
      product.name,
      product.price,
      product.id,
      2
    );
    const order1 = new Order("order-1", customer.id, [orderItem1]);

    const orderItem2 = new OrderItem(
      "order-item-2",
      product.name,
      product.price,
      product.id,
      3
    );
    const order2 = new Order("order-2", customer.id, [orderItem2]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const orders = await orderRepository.findAll();

    expect(orders).toHaveLength(2);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
  });

  it("should update an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("c1", "Customer 1");
    customer.changeAddress(
      new Address("Street", 1, "123456789", "Porto Alegre")
    );
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product1 = new Product("p1", "Product 1", 30);
    const product2 = new Product("p2", "Product 2", 40);
    await productRepository.create(product1);
    await productRepository.create(product2);

    const orderItem = new OrderItem(
      "order-item-1",
      product1.name,
      product1.price,
      product1.id,
      1
    );
    const order = new Order("order-1", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const updatedItem = new OrderItem(
      "order-item-2",
      product2.name,
      product2.price,
      product2.id,
      2
    );
    const updatedOrder = new Order(order.id, customer.id, [updatedItem]);
    await orderRepository.update(updatedOrder);

    const updatedFromDb = await orderRepository.find(order.id);

    expect(updatedFromDb.items).toHaveLength(1);
    expect(updatedFromDb.items[0].id).toBe("order-item-2");
    expect(updatedFromDb.total()).toBe(80);
  });
});
