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
