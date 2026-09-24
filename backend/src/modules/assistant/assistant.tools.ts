import type Anthropic from '@anthropic-ai/sdk';

/**
 * The concierge's tools. All are read-only: the assistant can look things up and point people to the
 * right page, but it never books, orders or changes anything on anyone's behalf.
 */
export const ASSISTANT_TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: 'search_restaurants',
    description:
      'Search live restaurants on TableNest. Use for any request to find, recommend or compare places to eat. ' +
      'All filters are optional; combine them. Returns up to `limit` restaurants with id, cuisine, city, rating, price range, services and whether they are open right now.',
    strict: true,
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        query: { type: ['string', 'null'], description: 'Free text matched against name, cuisine, city and description, e.g. "sushi" or "rooftop".' },
        cuisine: { type: ['string', 'null'], description: 'Exact cuisine name, e.g. "Italian".' },
        city: { type: ['string', 'null'], description: 'City name.' },
        service: { type: ['string', 'null'], enum: ['delivery', 'pickup', 'dine_in', null], description: 'Only restaurants offering this service.' },
        open_now: { type: ['boolean', 'null'], description: 'Only restaurants open at this moment.' },
        max_price_level: { type: ['integer', 'null'], description: 'Highest price level 1-4 ($ to $$$$).' },
        limit: { type: ['integer', 'null'], description: 'How many to return (1-8, default 5).' },
      },
      required: ['query', 'cuisine', 'city', 'service', 'open_now', 'max_price_level', 'limit'],
    },
  },
  {
    name: 'get_restaurant_details',
    description: 'Full details for one restaurant: description, address, opening hours (restaurant local time), services, fees and its menu grouped by category with prices.',
    strict: true,
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: { restaurant_id: { type: 'string', description: 'The restaurant id from search_restaurants.' } },
      required: ['restaurant_id'],
    },
  },
  {
    name: 'search_dishes',
    description: 'Find specific dishes across all restaurant menus by name, ingredient or tag (e.g. "ramen", "vegan", "chocolate"). Returns dish, price and restaurant.',
    strict: true,
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        query: { type: 'string', description: 'What to look for, at least 2 characters.' },
        max_price: { type: ['number', 'null'], description: 'Only dishes at or below this price.' },
      },
      required: ['query', 'max_price'],
    },
  },
  {
    name: 'check_table_availability',
    description: 'Live free booking times for a restaurant on a date for a party size. Use before suggesting a specific time to book.',
    strict: true,
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        restaurant_id: { type: 'string' },
        date: { type: 'string', description: 'Date as YYYY-MM-DD.' },
        guests: { type: 'integer', description: 'Party size, 1-20.' },
      },
      required: ['restaurant_id', 'date', 'guests'],
    },
  },
  {
    name: 'get_my_activity',
    description: "The signed-in customer's upcoming bookings and active orders with their current status. Only works when the visitor is signed in.",
    strict: true,
    input_schema: { type: 'object', additionalProperties: false, properties: {}, required: [] },
  },
];
