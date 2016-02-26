# JWTLAB

This is a simple example of JWT usage for authentication with python on server side and angularjs on client side.

## What is JWT?

JWT (JSON Web Token) is compact and self-contained way for securely transmitting information between parties as a JSON object defined on a RFC (#7519). 

The main usage for JWT may be for authentication/authorization purposes but it can be used also for exchanging information between parties.

## How to run JWTLAB?

1. install requirements
`
pip install -r requirements.txt
`
2. create a file secret_key.txt and put any contents there. it will be your secret key.
3. run the Flask app
`
python server.py
`
4. access http://localhost:5000 with your browser.
5. to login use the credentials in users.json.

