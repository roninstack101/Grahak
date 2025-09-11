import Shop from "../models/shops.model.js";


//get categories from shops
export const getcategory = async (req,res) => {
  // console.log("getcategory triggered");
    try {
        const categories= await Shop.distinct('category');
        res.status(200).json(categories);
    } catch (error) {
         res.status(500).json({ message: 'Failed to get categories', error: error.message });
        
    }
    
}


//get shops by category
export const getShopsByCategory = async (req, res) => {
  // console.log("getShopsByCategory triggered");
  const { category } = req.params;

  try {
    const shops = await Shop.find({ category, isApproved: true });
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shops', error: error.message });
  }
}


//get all shops.......temporary
export const getAllshops = async (req, res) => {

  console.log("getAllshops triggered");
  try {
    const shops = await Shop.find({}).populate('owner', 'name email phone');
    res.status(200).json(shops);
  } catch (error) {
     res.status(500).json({ message: 'Failed to get shops', error: error.message });
  }
  
};

//get nearby shops
export const getNearbyShops = async (req, res) => {
  console.log("getNearbyShops triggered");

    const { lat, lng, distance = 5000 } = req.query;

    

    if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required." });
    }

    try {
        // console.log("getNearbyShops triggered");
        const shops = await Shop.find({
            isApproved: true,
            location: {
                // ✅ Use $nearSphere for more accurate geographic calculations
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: parseInt(distance),
                },
            },
        }).populate('owner', 'name email phone');

        res.status(200).json(shops);
    } catch (err) {
        console.error("Error fetching nearby shops:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

//get shop by id
export const getshopbyid = async (req, res) => {
  // console.log("getshopbyid triggered");
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: "Error fetching shop" });
  }
};