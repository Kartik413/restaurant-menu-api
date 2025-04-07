// websiteService.js
const axios = require('axios');
const cheerio = require('cheerio');

const RESTAURANT_URL = 'https://cloudwebv2.dev.loomishub.com/';

class WebsiteService {
  // Fetch and parse menu categories
  async getMenuCategories() {
    try {
      const response = await axios.get(RESTAURANT_URL);
      const $ = cheerio.load(response.data);
      
      const categories = [];
      
      // Extract categories from the website
      // Note: The actual selector would depend on the website structure
      $('.menu-category').each((i, element) => {
        categories.push({
          id: $(element).attr('data-category-id'),
          name: $(element).find('.category-name').text().trim(),
          description: $(element).find('.category-description').text().trim()
        });
      });
      
      return categories;
    } catch (error) {
      console.error('Error fetching menu categories:', error);
      throw new Error('Failed to fetch menu categories');
    }
  }

  // Fetch menu items for a specific category
  async getMenuItemsByCategory(categoryId) {
    try {
      const response = await axios.get(`${RESTAURANT_URL}/category/${categoryId}`);
      const $ = cheerio.load(response.data);
      
      const menuItems = [];
      
      // Extract menu items from the website
      $('.menu-item').each((i, element) => {
        menuItems.push({
          id: $(element).attr('data-item-id'),
          name: $(element).find('.item-name').text().trim(),
          price: $(element).find('.item-price').text().trim(),
          description: $(element).find('.item-description').text().trim(),
          image: $(element).find('.item-image').attr('src')
        });
      });
      
      return menuItems;
    } catch (error) {
      console.error(`Error fetching menu items for category ${categoryId}:`, error);
      throw new Error('Failed to fetch menu items');
    }
  }

  // Get detailed information about a specific menu item
  async getMenuItemDetails(itemId) {
    try {
      const response = await axios.get(`${RESTAURANT_URL}/item/${itemId}`);
      const $ = cheerio.load(response.data);
      
      // Extract item details
      const itemDetails = {
        id: itemId,
        name: $('.item-detail-name').text().trim(),
        price: $('.item-detail-price').text().trim(),
        description: $('.item-detail-description').text().trim(),
        image: $('.item-detail-image').attr('src'),
        ingredients: [],
        allergens: [],
        nutritionalInfo: {}
      };
      
      // Extract ingredients
      $('.ingredient-item').each((i, element) => {
        itemDetails.ingredients.push($(element).text().trim());
      });
      
      // Extract allergens
      $('.allergen-item').each((i, element) => {
        itemDetails.allergens.push($(element).text().trim());
      });
      
      // Extract nutritional information
      $('.nutrition-item').each((i, element) => {
        const key = $(element).find('.nutrition-name').text().trim();
        const value = $(element).find('.nutrition-value').text().trim();
        itemDetails.nutritionalInfo[key] = value;
      });
      
      return itemDetails;
    } catch (error) {
      console.error(`Error fetching details for item ${itemId}:`, error);
      throw new Error('Failed to fetch item details');
    }
  }

  // Get restaurant information
  async getRestaurantInfo() {
    try {
      const response = await axios.get(RESTAURANT_URL);
      const $ = cheerio.load(response.data);
      
      const info = {
        name: $('.restaurant-name').text().trim(),
        address: $('.restaurant-address').text().trim(),
        phone: $('.restaurant-phone').text().trim(),
        hours: $('.restaurant-hours').text().trim(),
        description: $('.restaurant-description').text().trim()
      };
      
      return info;
    } catch (error) {
      console.error('Error fetching restaurant information:', error);
      throw new Error('Failed to fetch restaurant information');
    }
  }

  // Get daily specials
  async getDailySpecials() {
    try {
      const response = await axios.get(`${RESTAURANT_URL}/specials`);
      const $ = cheerio.load(response.data);
      
      const specials = [];
      
      $('.special-item').each((i, element) => {
        specials.push({
          id: $(element).attr('data-item-id'),
          name: $(element).find('.special-name').text().trim(),
          price: $(element).find('.special-price').text().trim(),
          description: $(element).find('.special-description').text().trim()
        });
      });
      
      return specials;
    } catch (error) {
      console.error('Error fetching daily specials:', error);
      throw new Error('Failed to fetch daily specials');
    }
  }
}

module.exports = new WebsiteService();