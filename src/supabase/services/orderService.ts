import { supabase } from '../config';

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  shipping_address?: string;
  shipping_method?: string;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

export interface CreateOrderData {
  items: {
    product_id: string;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: number;
  }[];
  shipping_address?: string;
  shipping_method?: string;
  payment_method?: string;
  notes?: string;
}

export class SupabaseOrderService {
  // Создать новый заказ
  static async createOrder(userId: string, orderData: CreateOrderData): Promise<Order> {
    try {
      // Вычисляем общую сумму
      const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Создаем заказ
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          total_amount: totalAmount,
          shipping_address: orderData.shipping_address,
          shipping_method: orderData.shipping_method,
          payment_method: orderData.payment_method,
          notes: orderData.notes,
        }])
        .select()
        .single();

      if (orderError) {
        throw new Error(`Ошибка создания заказа: ${orderError.message}`);
      }

      // Создаем товары в заказе
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error(`Ошибка добавления товаров в заказ: ${itemsError.message}`);
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Получить заказы пользователя
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Ошибка получения заказов: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Получить заказ с товарами
  static async getOrderWithItems(orderId: string): Promise<{order: Order, items: OrderItem[]}> {
    try {
      // Получаем заказ
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        throw new Error(`Ошибка получения заказа: ${orderError.message}`);
      }

      // Получаем товары заказа
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at');

      if (itemsError) {
        throw new Error(`Ошибка получения товаров заказа: ${itemsError.message}`);
      }

      return { order, items: items || [] };
    } catch (error) {
      console.error('Error fetching order with items:', error);
      throw error;
    }
  }

  // Обновить статус заказа
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        throw new Error(`Ошибка обновления статуса заказа: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Обновить статус оплаты
  static async updatePaymentStatus(orderId: string, paymentStatus: Order['payment_status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', orderId);

      if (error) {
        throw new Error(`Ошибка обновления статуса оплаты: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Получить статистику заказов пользователя
  static async getUserOrderStats(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_order_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Ошибка получения статистики: ${error.message}`);
      }

      return data || {
        total_orders: 0,
        total_spent: 0,
        average_order_value: 0,
        delivered_orders: 0,
        pending_orders: 0
      };
    } catch (error) {
      console.error('Error fetching user order stats:', error);
      throw error;
    }
  }

  // Отменить заказ
  static async cancelOrder(orderId: string): Promise<void> {
    try {
      await this.updateOrderStatus(orderId, 'cancelled');
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Создать заказ из корзины
  static async createOrderFromCart(userId: string, cartItems: any[], orderData: Omit<CreateOrderData, 'items'>): Promise<Order> {
    try {
      const items = cartItems.map(item => ({
        product_id: item.id,
        product_name: item.title,
        product_image: item.image,
        quantity: item.quantity,
        price: item.price,
      }));

      const order = await this.createOrder(userId, {
        ...orderData,
        items,
      });

      // Очищаем корзину после создания заказа
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (clearCartError) {
        console.warn('Warning: Could not clear cart after order creation:', clearCartError);
      }

      return order;
    } catch (error) {
      console.error('Error creating order from cart:', error);
      throw error;
    }
  }
}
