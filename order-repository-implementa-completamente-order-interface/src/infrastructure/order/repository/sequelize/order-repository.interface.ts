import Order from "../../../../domain/order/order";
import RepositoryInterface from "../../../../domain/shared/repository/repository-interface";

export default interface OrderRepositoryInterface
  extends RepositoryInterface<Order> {}
