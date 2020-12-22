# Whitebox-Challenge
Whitebox Code Challenge

## Setup

Please refer to the following requirements and steps to setup, and run the Whitebox-Challenge.

### Requirements

Docker, Docker Compose, Node, and NPM are required to setup and run this code without any additional steps.

### Instructions

1. Clone this Repository: `git clone https://github.com/brandontksmith/Whitebox-Challenge.git`.
2. Change your working directory to Whitebox-Challenge: `cd Whitebox-Challenge`
3. Install the dependencies: `npm install`
4. Run Docker Compose to create the MySQL Docker Container and initialize the Database: `docker-compose up`. You can move to the next step when you see `mysqld: ready for connections` in the console.
5. Run the Export Script (app.js): `node app.js`
6. Open the Excel File at uploads/Whitebox-Challenge.xlsx.
