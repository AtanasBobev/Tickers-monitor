const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const express = require("express");
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Tickers",
      description: "Tickers allows you to get data about your favorite tickers",
      contact: {
        name: "Atanas Bobev",
      },
      servers: ["http://localhost:5000"],
    },
  },
  apis: ["main.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

/**
 * @swagger
 *
 * securitySchemes:
 *   bearerAuth:            # arbitrary name for the security scheme
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT    # optional, arbitrary value for documentation purposes
 * security:
 * - bearerAuth: []   
 * /register:
 *  post:
 *    description: Creates a new user
 *    responses:
 *      '200':
 *       description:User was created successfully
 *      '500':
 *       description:Internal server error. Most often means that the user with the same credentials already exists in the database.
 * /login:
 *  post:
 *    description: Logges in user
 *    responses:
 *      '200':
 *        description:User authenticated successfully
 * /tickers:
 *  get:
 *    description: Get user tickers
 *    responses:
 *      '200':
 *       description:Tickers returned succesfully
 *      '401':
 *       description:No JWT sent
 *      '403':
 *       description:You have no access to this ticker
 *  post:
 *     description: Adds a ticker
 *     responses:
 *       '200':
 *        description:Ticker added succesfully
 *       '401':
 *        description:No JWT sent
 *  delete:
 *     description: Delete user tickers
 *     responses:
 *       '200':
 *        description:Tickers sent
 *       '401':
 *        description:No JWT sent
 * /history:
 *  post:
 *    description: Get historic information about a ticker
 *    responses:
 *        '200':
 *         description:Ticker data sent
 *        '401':
 *         description:No JWT sent
 *    BearerAuth:
 *      type: http
        scheme: bearer
 */
module.exports = { swaggerDocs, swaggerOptions };
