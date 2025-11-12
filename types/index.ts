export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt?: Date;
}

export interface Order {
  _id?: string;
  customerName: string;
  email: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: 'new' | 'completed';
  createdAt?: Date;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}