# Backend

## Overview
I built the backend using Node.js, Express and TypeScript. It has a REST API and uses a single application structure, so the code is cut into separate modules such as authentication, products, orders, and users.

The backend has four main layers: routes, controllers, services, and models. Routes are responsible for incoming requests, controllers handle the HTTP logic, services contain the main business logic, and models handle the database.

I kept the business logic in the service layer to be able to manage things like carts and checkout more easily and test them without having to send actual HTTP requests

## API Structure

The API is available under /api and it does not use a version number in the URL. Each api has its own feature such as authentication, products, reviews, cart, wishlist, orders etc..

Admin endpoints use a separate /api/admin/ path.

## Authentication and Authorization

As for the authentication, it is stateless and it uses JWTs that are sent through the 'Authorization: Bearer' header. Also, passwords are securely hashed using bcrypt with 10 rounds.

I use 'requireAuth' middleware to check the user's token, then it sets 'req.userId for authenticated requests.
As for admin access, I use 'requireAdmin' that checks the current role always from the database on every request, this way if the someone's admin role is removed, the change takes effect immediately.

The frontend 'AdminRoute' is only used to control what the user sees and access from the UI. It is not considered a security measure, since all actual authorization checks are handled by the backend.


### Email Verification and Password Reset

Email verification and password reset use a 6-digit OTP. OTP values are bcrypt-hashed before i store them. There is a 60-second cooldown before the user can ask for a new OTP, and there is a limit of maximum of 5 verification attempts

### Authentication Tradeoff

Currently I am storing JWTs in the local storage of the frontend, this means that if an XSS vulnerability occurs, the token could potentially be accessed. I am aware that using httpOnly cookies would be more secure and provide better protection, but for this project i chose this way as a simpler approach within the project's scope

## Validation and Security

I am using Zod to validate incoming data before it reaches the main application logic. Unexpected fields are removed from the validated data, which also helps prevent unwanted fields from being added to database records.

The backend uses CORS and has centralized error handling through `ApiError` and `errorHandler`. Configuration values and credentials are stored in environment variables instead of being written directly in the code.

The project does not currently use Helmet or a general rate-limiting package. The main request limits in place are for OTP resending and verification attempts.

Database errors are also handled and returned with appropriate status codes. For example, MongoDB `CastError` returns a `400` response, while duplicate-key errors return `409`. This prevents expected input or database errors from being returned as generic `500` server errors.

Database connection logs also hide sensitive information instead of printing the full connection string.


## Product Image Uploads

Product image uploads use Multer's `memoryStorage`. The uploaded file is kept in memory and then sent directly to Cloudflare R2 through its S3-compatible API. This results in a public R2 URL, which i store on the product

Originally I used local disk storage, but I changed it because deployed/serverless environments should not depend on a persistent writable application filesystem.

Cloudflare R2 was selected instead of Cloudinary because Cloudinary was not available for this project.

## Cart and Checkout

The server is responsible for the final product prices, stock, and order totals. Any values calculated by the frontend are not trusted during checkout. So before updating the cart or stock, the backend checks the stock for every item again. If there is not enough stock, the checkout returns a `409` error, and no changes are made to the cart or stock from that checkout attempt.

The current implementation uses optimistic concurrency instead of database transactions. This means that if 2 users happen to make checkout requests at the same time for an item that has only 1 stock left, both might be able to pass the stock check. This is a known limitation and could be addressed in the future by using MongoDB transactions with a replica set.


### Payment Information

Card number, expiry date, and CVV never reach the backend. The checkout API only accepts and stores non-sensitive card display information like the brand and last 4 digit numbers. No full card credentials are stored or processed by the application.


## Deployment

I deployed the app on vercel as asingle Vercel project, with Express backend running as one serverless function under /api

I stored the Mongoose database connection on 'globalThis' so that serverless requests can reuse an existing connection instead of opening a new one for every request. This helps reduce unnecessary connections and prevents the MongoDB Atlas connection limit from being reached.

The deployed backend relies on a few external services for data and other features. MongoDB Atlas is used for the application database, Resend handles transactional emails, and Cloudflare R2 stores product images.

