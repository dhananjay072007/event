/**
 * models/index.js — central barrel
 *
 * Import from here everywhere in the app:
 *   import { User, Booking, ClientUser } from '../models/index.js';
 *
 * Each model lives in its own file for clean diffs and easy testing.
 */

export { User } from './User.js';
export { ClientUser } from './ClientUser.js';
export { Booking } from './Booking.js';
export { Contact } from './Contact.js';
export { Blog } from './Blog.js';
export { Gallery, GALLERY_CATEGORIES } from './Gallery.js';
export { Service } from './Service.js';
export { Testimonial } from './Testimonial.js';
export { SiteSettings } from './SiteSettings.js';
export { PricingPlan } from './PricingPlan.js';