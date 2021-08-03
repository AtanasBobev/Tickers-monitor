## Overview
Ticker monitor is a fullstack app in node, express, react, PostgresSQL which fetches data from the bitmex web socket and allows the user to susbcribe to different tickers. 
The flow is as follows:
User is registered, JWT is created, the user is presented with a screen where they can choose among 5 tickers and subscribe to them. When the user subscribes, they can view historic infor that the node server has aggregated from the bitmex webscoket.
## Installation
**Front/Back end setup**

To run the front end, go to the FrontEnd folder and inside it run with termianl `npm start`.
To start the server, go to Server folder and with termianl run `npm run start` or `nodemon main.js`.

**Database setup:**

Go to the sql file in the Database folder and execute the queries into PostgreSQL. Below is visualization of the database. Don't forget to edit the connection details in the postgres.js file in the Server folder.
![Database setup](https://i.ibb.co/CBCNZ61/Screenshot-2021-08-03-141236.png)

## APIs
You can view the avaible apis using swagger on port `5000` url `/api-docs`
Below is a short description of each endpoint:
- POST /register Registers a new user. Takes in the body email and password(min. 7 symbols). Code 400 is for data invalid. Code 200 is for successful registration.
- POST /login Logins the new user. Takes email and password(min. 7 symbols) and returns a json-web-token for further access to the endpoints. Code 400 is for data invalid. Code Code 500 is for error, usually caused by inability to access the database. 200 is for successful login.
- GET /tickers Gets the tickers the user is subscribed to. `jwt` must be provided in the header. `ticker` must be proviede in the body. Code 401 is for no JWT sent. Code 200 is for successful request; an array of tickers is returned.
- POST /tickers Updates the user tickers in the database. `jwt` must be provided in the header. Code 401 is for no JWT sent. Code 500 is for an internal server error, usually caused by an inability to connect to the database. Code 200 is for successful data entry.
- Delete /tickers deletes given ticker from the user tickers in the database. JWT must be provided in the header. `ticker_id` must be provided. Code 401 is for no JWT sent. Code 200 is for successful ticker deletion.
- POST /history Loads historic data from the database. `jwt` must be provided in the header. In the body hours and ticker_id must be provided. Code 401 is for no `jwt` supplied. Code 200 is for successful requst. Data would be then returned in an array format. 
- POST /file Posts historic data to the server a user .csv upload. ticker is provided in the body. In the files object provide SomeFile with the file. Multipart/form-data is used  `jwt` must be provided in the header. COde 400 is for missing data. Code 415 is for invalid data format. Code 200 is for successful upload to the server.
**How to upload data in the Upload Data section**

## Screens:
Register the user:
![Ticker screen](https://i.ibb.co/fthj4c7/Screenshot-2021-08-02-162336.png)
Login the user:
![Ticker screen](https://i.ibb.co/mDsK4LY/Screenshot-2021-08-02-162526.png)
Logged the user sees this:
![Ticker screen](https://i.ibb.co/k9GqQ8K/Screenshot-2021-08-02-160912.png)
Clicking more leads to this page:
![Ticker historic data](https://i.ibb.co/PZsmzZW/Screenshot-2021-08-02-161018.png)
The user can change the password:
![Ticker reset password](https://i.ibb.co/7pjbTFB/Screenshot-2021-08-02-161446.png)
Upload historic data for the tickers and their price to the server:
![Provide historic data](https://i.ibb.co/fpM3Nx6/Screenshot-2021-08-02-162101.png)
Or change the theme, which changes the main color of the page:
![Change theme](https://i.ibb.co/2NPyXxw/Screenshot-2021-08-02-161710.png)
