const Url = require('../models/Url');
const Stat = require('../models/Stats.js');



// Add this to your urlController.js
exports.getStats = async (req, res) => {
  try {
    const { urlPath } = req.params;

    // Get the URL document
    const url = await Url.findOne({ urlPath });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Get statistics for this URL
    const stats = await Stat.find({ urlPath }).sort({ timestamp: -1 });

    // Calculate summary statistics
    const totalClicks = url.clicks || 0;
    const uniqueIps = [...new Set(stats.map(s => s.ipAddress))].length;
    
    // Group by date for time series data
    const dailyClicks = stats.reduce((acc, stat) => {
      const date = stat.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Get referrer sources
    const referrers = stats.reduce((acc, stat) => {
      const source = stat.referrer || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Get device information from user agent
    const devices = stats.reduce((acc, stat) => {
      const ua = stat.userAgent || '';
      let device = 'Desktop';
      if (/mobile|android|iphone/i.test(ua)) device = 'Mobile';
      if (/tablet|ipad/i.test(ua)) device = 'Tablet';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    res.json({
      url: {
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        urlPath: url.urlPath,
        clicks: url.clicks,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
      },
      summary: {
        totalClicks,
        uniqueVisitors: uniqueIps,
        lastClick: stats.length > 0 ? stats[0].timestamp : null,
        firstClick: stats.length > 0 ? stats[stats.length - 1].timestamp : null,
      },
      dailyClicks: Object.entries(dailyClicks).map(([date, count]) => ({
        date,
        count
      })),
      referrers: Object.entries(referrers).map(([source, count]) => ({
        source,
        count
      })),
      devices: Object.entries(devices).map(([device, count]) => ({
        device,
        count
      })),
      recentClicks: stats.slice(0, 50).map(stat => ({
        timestamp: stat.timestamp,
        ipAddress: stat.ipAddress,
        userAgent: stat.userAgent,
        referrer: stat.referrer,
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get statistics for a URL
// exports.getUrlStats = async (req, res) => {
//   try {
//     const { urlPath } = req.params;
    
//     const url = await Url.findOne({ urlPath });
//     if (!url) {
//       return res.status(404).json({ error: 'URL not found' });
//     }

//     const stats = await Stat.find({ urlPath }).sort({ accessedAt: -1 }).limit(10);
//     const totalClicks = url.clicks;

//     // Get clicks by browser
//     const browserStats = await Stat.aggregate([
//       { $match: { urlPath } },
//       { 
//         $group: {
//           _id: "$userAgent",
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { count: -1 } }
//     ]);

//     // Get clicks by hour of day
//     const hourlyStats = await Stat.aggregate([
//       { $match: { urlPath } },
//       {
//         $group: {
//           _id: { $hour: "$accessedAt" },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);

//     res.json({
//       urlPath,
//       originalUrl: url.originalUrl,
//       shortUrl: url.shortUrl,
//       createdAt: url.createdAt,
//       totalClicks,
//       recentAccesses: stats,
//       browserStats,
//       hourlyStats,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };