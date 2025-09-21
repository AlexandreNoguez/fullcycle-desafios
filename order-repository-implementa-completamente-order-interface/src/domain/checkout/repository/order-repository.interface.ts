import RepositoryInterface from "../../shared/repository/repository-interface";
import Order from "../entity/order.entity";

export default interface OrderRepositoryInterface
  extends RepositoryInterface<Order> {}
