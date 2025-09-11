import Order from "../models/order.model.js";
import Product from "../models/products.model.js";
import Cart from "../models/cart.model.js";
import QRCode from 'qrcode';


//order checkout api
export const checkoutFromCart = async (req, res) => {
    const { userid } = req.body;
    //  console.log(`CHECKOUT initiated for user ID from body: ${userid}`);

    try {
        
        const cart = await Cart.findOne({ user: userid }).populate({
            path: 'items.product',
            model: 'Product'
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty." });
        }

        
        const ordersByShop = cart.items.reduce((acc, cartItem) => {
    const product = cartItem.product;

    
    if (!product) {
        console.warn(`Product missing for cart item ${cartItem._id}, skipping...`);
        return acc;
    }

    const shopId = product.shop.toString();
    if (!acc[shopId]) {
        acc[shopId] = [];
    }
    acc[shopId].push(cartItem);
    return acc;
}, {});

        
        const createdOrders = [];
        for (const shopId in ordersByShop) {
            const items = ordersByShop[shopId];
            
           
            let totalPrice = 0;
            const updatedItems = [];

            for (const item of items) {
                const product = item.product; 
                const qty = Number(item.quantity);

                if (product.quantity < qty) {
                    return res.status(400).json({ message: `Insufficient stock for ${product.name} at shop ${shopId}` });
                }
                
                totalPrice += qty * product.price;
                updatedItems.push({ product: product._id, quantity: qty, price: product.price });
            }
           
            const order = new Order({
                user: userid,
                shop: shopId,
                items: updatedItems,
                totalPrice
            });
            await order.save();
            createdOrders.push(order);
        }

        
        cart.items = [];
        await cart.save();

        res.status(201).json({ message: "Orders placed successfully!", orders: createdOrders });

    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({ message: "Failed to process checkout", error: error.message });
    }
};


//get orders by status for history and available section
export const getorderbystatus = async (req,res) => {
    const {shopId} = req.params;
    const {status} = req.query;

    try {
        const filter = ({shop : shopId});
        if(status){
            filter.status = status;
        }

        const orders = await Order.find(filter)
        .populate('user', 'name email phone')
        .populate('items.product', 'name price description')
        .sort({ createdAt: -1 });

        res.status(200).json({orders});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
    
};


// accept order 
export const acceptorder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order already processed' });
    }

    
    for (const item of order.items) {
      const product = item.product;
      const qty = item.quantity;

      if (product.quantity < qty) {
        return res.status(400).json({ message: `Insufficient quantity for ${product.name}` });
      }

      product.quantity -= qty;
      await product.save();
    }

    
    order.status = 'accepted';
    const qrDetail = `Order ID: ${order._id}`;
    const qrcodeURL = await QRCode.toDataURL(qrDetail);
    order.qrCode = qrcodeURL;

    await order.save();

    res.status(200).json({ message: "Order accepted", order });
  } catch (error) {
    res.status(500).json({ message: "Error in accepting order", error: error.message });
  }
};


// reject order
export const rejectorder = async (req,res) => {
    const {orderId} = req.params;
    
    try {
        const order = await Order.findById(orderId);
        if(!order) return res.status(404).json({ message : 'order not found'});
        
        order.status = 'declined';
        await order.save();

        res.status(200).json({message: "order declined", order} );
    } catch (error) {
        res.status(500).json({message: "error in declining", error : error.message} );
    }
    
};


// order history for user 
export const getMyOrders = async (req, res) => {
    try {
        // req.user.id comes from your authenticateUser middleware
        const userId = req.user.userID;
        console.log(`GET_ORDERS fetching for user ID from token: ${userId}`);

        const orders = await Order.find({ user: userId })
            .populate('shop', 'name') 
            .populate('items.product', 'name') 
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

// for scanned QR code 
export const scannedorder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id); 
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// export const getOrderById = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const order = await Order.findById(orderId)
//       .populate("user", "name email")
//       .populate("items.product", "name price");

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({ order });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch order", error: error.message });
//   }
// };

