const Booking = require("../models/Booking");
const Customer = require("../models/Customer");

const getDashboardStats = async (req, res) => {
  try {
    // Total Bookings Count
    const totalBookings = await Booking.countDocuments();

    // Active Customers Count
    const activeCustomers = await Customer.countDocuments({ isActive: true });

    // Total Revenue (Sum of all booking prices)
    const totalRevenueData = await Booking.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;

    // Booking Data (Bookings over time, grouped by month)
    const bookingData = await Booking.aggregate([
      {
        $project: {
          month: { $month: "$checkInDate" },
        }
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by month
    ]);

    // Payment Method Data (Pie chart data)
    const paymentMethods = await Booking.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 }
        }
      }
    ]);

    // Send response
    res.status(200).json({
      totalBookings,
      activeCustomers,
      totalRevenue,
      bookingData,
      paymentMethods
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats", details: error.message });
  }
};

module.exports = { getDashboardStats };
