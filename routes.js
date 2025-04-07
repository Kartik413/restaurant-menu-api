// routes.js
const express = require('express');
const websiteService = require('./websiteService');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 600 }); // 10-minute cache

// Middleware for caching
const cacheMiddleware = (key) => (req, res, next) => {
  const cacheKey = `${key}_${JSON.stringify(req.params)}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return res.json(cachedData);
  }
  
  res.sendResponse = res.json;
  res.json = (data) => {
    cache.set(cacheKey, data);
    res.sendResponse(data);
  };
  
  next();
};

// Get all menu categories
router.get('/categories', cacheMiddleware('categories'), async (req, res) => {
  try {
    const categories = await websiteService.getMenuCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get menu items by category
router.get('/categories/:categoryId/items', cacheMiddleware('items_by_category'), async (req, res) => {
  try {
    const { categoryId } = req.params;
    const items = await websiteService.getMenuItemsByCategory(categoryId);
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get menu item details
router.get('/items/:itemId', cacheMiddleware('item_details'), async (req, res) => {
  try {
    const { itemId } = req.params;
    const itemDetails = await websiteService.getMenuItemDetails(itemId);
    res.json({
      success: true,
      data: itemDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get restaurant information
router.get('/restaurant', cacheMiddleware('restaurant_info'), async (req, res) => {
  try {
    const info = await websiteService.getRestaurantInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get daily specials
router.get('/specials', cacheMiddleware('daily_specials'), async (req, res) => {
  try {
    const specials = await websiteService.getDailySpecials();
    res.json({
      success: true,
      data: specials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search menu items
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    // First get all categories
    const categories = await websiteService.getMenuCategories();
    
    // Then get all items from each category and search
    let results = [];
    for (const category of categories) {
      const items = await websiteService.getMenuItemsByCategory(category.id);
      const matchingItems = items.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
      results = [...results, ...matchingItems.map(item => ({...item, category: category.name}))];
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;