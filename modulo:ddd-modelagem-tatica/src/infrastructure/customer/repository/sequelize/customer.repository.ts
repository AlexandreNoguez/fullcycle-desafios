import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import CustomerModel from "./customer.model";
import { TransactionInterface } from "../../../../domain/@shared/domain/transaction.interface";
import CustomerRepositoryInterface from "../../../../domain/customer/repository/customer.repository.interface";

export default class CustomerRepository implements CustomerRepositoryInterface {
  private transaction?: TransactionInterface;

  public setTransaction(transaction: TransactionInterface): void {
    this.transaction = transaction;
  }

  private async txOptions() {
    const transactionOptions = await this.transaction?.getTransaction?.();
    return transactionOptions ? { transaction: transactionOptions } : {};
  }

  async create(entity: Customer): Promise<void> {
    await CustomerModel.create(
      {
        id: entity.id,
        name: entity.name,
        street: entity.Address.street,
        number: entity.Address.number,
        zipcode: entity.Address.zip,
        city: entity.Address.city,
        active: entity.isActive(),
        rewardPoints: entity.rewardPoints,
      },
      await this.txOptions()
    );
  }

  async update(entity: Customer): Promise<void> {
    await CustomerModel.update(
      {
        name: entity.name,
        street: entity.Address.street,
        number: entity.Address.number,
        zipcode: entity.Address.zip,
        city: entity.Address.city,
        active: entity.isActive(),
        rewardPoints: entity.rewardPoints,
      },
      {
        where: { id: entity.id },
        ...(await this.txOptions()),
      }
    );
  }

  async find(id: string): Promise<Customer> {
    let customerModel;
    try {
      customerModel = await CustomerModel.findOne({
        where: { id },
        rejectOnEmpty: true,
        ...(await this.txOptions()),
      });
    } catch {
      throw new Error("Customer not found");
    }

    const customer = new Customer(id, customerModel.name);
    const address = new Address(
      customerModel.street,
      customerModel.number,
      customerModel.zipcode,
      customerModel.city
    );
    customer.changeAddress(address);
    if (customerModel.active) customer.activate();
    if (customerModel.rewardPoints)
      customer.addRewardPoints(customerModel.rewardPoints);
    return customer;
  }

  async findAll(): Promise<Customer[]> {
    const customerModels = await CustomerModel.findAll(await this.txOptions());

    return customerModels.map((m) => {
      const c = new Customer(m.id, m.name);
      c.addRewardPoints(m.rewardPoints);
      const address = new Address(m.street, m.number, m.zipcode, m.city);
      c.changeAddress(address);
      if (m.active) c.activate();
      return c;
    });
  }
}
