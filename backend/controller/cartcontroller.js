import Cart from "../models/cart.model.js";
import Product from "../models/products.model.js";

export const viewcart = async (req, res) => {
    const { userid } = req.params;

    try {
        const usercart = await Cart.findOne({ user: userid })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'shop',
                    model: 'Shop',
                    select: 'name'
                }
            });

        if (!usercart || usercart.items.length === 0) {
            return res.status(200).json({ groupedByShop: [], grandTotal: 0 });
        }

        //grouping of products by shop 
        const groupedByShopMap = usercart.items.reduce((acc, item) => {
           
            if (!item.product || !item.product.shop) {
                return acc;
            }

            const shopId = item.product.shop._id.toString();
            const shopName = item.product.shop.name;

            
            if (!acc[shopId]) {
                acc[shopId] = {
                    shopId,
                    shopName,
                    items: [],
                    subtotal: 0
                };
            }

           
            acc[shopId].items.push(item);
            
            
            acc[shopId].subtotal += item.product.price * item.quantity;
            
            return acc;
        }, {});

        // Convert the  object to an array
        const groupedByShopArray = Object.values(groupedByShopMap);

       
        const grandTotal = groupedByShopArray.reduce((total, shop) => total + shop.subtotal, 0);

       
        res.status(200).json({
            groupedByShop: groupedByShopArray,
            grandTotal: grandTotal
        });

    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Error fetching cart", error: error.message });
    }
};


// add to cart api
export const addtocart = async (req, res) => {
  const { userid, productid, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: userid });

    if (!cart) {
      cart = new Cart({ user: userid, items: [] });
    }

    const index = cart.items.findIndex(
      (item) => item.product.toString() === productid
    );

    if (index >= 0) {
      cart.items[index].quantity += Number(quantity);
    } else {
      cart.items.push({ product: productid, quantity: Number(quantity) });
    }
    await cart.save();
    res.status(200).json({ message: "Item added successfully", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in Adding Item", error: error.message });
  }
};

//remove item from cart api
export const removeItem = async (req, res) => {
  const { userid, productid } = req.body;

  try {
    const cart = await Cart.findOne({ user: userid });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productid
    );
    await cart.save();

    res.status(200).json({ message: "item removed", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing item", error: error.message });
  }
};


// clear the cart api
export const clearcart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "cart cleared" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};


// remove from the whole product from cart api
export const removeFromCart = async (req, res) => {
  const { userid, productid } = req.body;

  try {
    const cart = await Cart.findOne({ user: userid });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const index = cart.items.findIndex(
      (item) => item.product.toString() === productid
    );

    if (index >= 0) {
      if (cart.items[index].quantity > 1) {
        cart.items[index].quantity -= 1;
      } else {
        cart.items.splice(index, 1); // remove item if quantity is 1
      }

      await cart.save();
      return res.status(200).json({ message: "Item updated", cart });
    } else {
      return res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in removing item", error: error.message });
  }
};
