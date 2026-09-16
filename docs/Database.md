# Database

## Overview

The NOVA database uses MongoDB with Mongoose and is hosted on MongoDB Atlas.

MongoDB's document model fits the application because products contain nested data such as variants and images.

## Main Models

The application uses five database collections: User, Product, Order, Review, SiteContent

Cart and wishlist are not separate collections, they are stored on the User document.
(Cart is an array of subdocument and Whishlist is an array of Produc ObjectId references)

The reason for that is to keep those data associated with the user that owns them.

## User

The User document contains:

- name
- email — unique
- passwordHash
- role — user | admin
- emailVerified
- otp
  - codeHash
  - purpose
  - expiresAt
  - attempts
  - lastSentAt
- cart
- wishlist

OTP is included because it belongs directly to the user and is used for email verification and password reset flows.

## Product

The Product document contains:

- slug
- title
- price
- description
- category
- images
- thumbnail
- variants
- baseStock

### Variants

Each variant (Color, Size, etc) has its own stock. So when a customer selects multiple options, it will display the one with the lowest stock level. The reason behind that is to  avoid having to store the stocks of every possible combination of options.

## Order

An Order contains:

- user
- items
- total
- shippingAddress
- payment
  - brand
  - last4
- placedAt

When a user completes an order, a snapshot that includes product, product title, unit price, and subtotal, will be stored to make sure that order history stays accurate even if the product's name or price is changed later on. 

## Review

A Review contains:

- product
- user
- userName snapshot
- rating — 1–5
- comment

Product ratings are calculated from the reviews when needed instead of being stored directly on the Product, this keeps the rating accurate and avoids problems if the reviews change.


## Relationships

The database uses both references and embedded data.

### References

- Order -> User: An order stores the user's ID, so you know who placed the order.
- Order items -> Product: An order item stores the product's ID, so you know which product was purchased.
- Review -> Product: A review stores the product's ID, so you know which product the review belongs to.
- Review -> User: A review stores the user's ID, so you know who wrote it.
- Wishlist entries -> Product: A wishlist entry stores the product's ID, so you know which product was added to the wishlist.

### Embedded

- User → Cart
- User → Wishlist array
- User → OTP

Above are the data that is stored inside the User document instead of making it as separate document.

Stock, variant selections, and quantities are checked on the server before they are saved to the database. This helps prevent incorrect data from being stored, so when a product is deleted, any references to that product in a user's wishlist are also removed, so the wishlist does not contain empty entries.


## Images

Product images are not stored directly in MongoDB or on the application server. Instead, images are uploaded to Cloudflare R2, and the image URL is saved in the Product document. This keeps the image files separate from the main database and application, making the system easier to manage.