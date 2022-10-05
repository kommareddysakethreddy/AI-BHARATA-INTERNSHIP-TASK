# AI-BHARATA-INTERNSHIP-TASK

## Steps to proceed
1. Download node modules: npm i
2. Change database password and JWT_SECRET in config.env file
3. To test endpoints run - npm test
4. Endpoints to test: <br>
4.1. Signup: (http://127.0.0.1:3000/api/v1/users/signup)<br>
4.2  Login: (http://127.0.0.1:3000/api/v1/users/login)<br>
4.3  Signup: (http://127.0.0.1:3000/api/v1/users/market/) and use specied key - value Ex: market: BTCUSDT OR market: ETHUSDT to access market<br>

Make sure to use pm.globals.set("jwt", pm.response.json().token) to access jwt key and Use Bearer Authentication as Authoriztion


video-link: https://drive.google.com/drive/folders/1AV-UO1BXTMt1mxHivYSSDNxr_958hBdq?usp=sharing
