import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";



export const getAnalyticsData = async () => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id:null, // it groups all documents together
                totalSales: {$sum:1},
                totalRevenue: {$sum: "$totalAmount"} 
            }
        }
    ]);

    const {totalSales, totalRevenue} = salesData[0] || {totalSales:0, totalRevenue:0};

    return {
        users:totalUsers,
        products:totalProducts,
        totalSales,
        totalRevenue
    }
}

export const getDailySalesData = async (startDate, endDate) => {
    const dailySalesData = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
            },
        },
        {
         $sort: { _id: 1 }    
        },
    ]);

    //example of dailysalesData

    // [
    //     {
    //         _id: "2024-10-30",
    //         sales: 12,
    //         revenue: 1450.75,
    //     },
    // ]

    const dateArray = getDatesInRange(startDate, endDate);
}

function getDatesInRange(startDate, endDate){
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}