[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xIbq4TFL)

Personal Finance Tracker System



This assignment is develop a RESTful API for managing a Personal Finance Tracker
system. The system should facilitate users in managing their financial records, tracking expenses,setting budgets, and analyzing spending trends. Emphasizing secure access, data integrity, and user friendly interfaces and generate all kind of reports , this project aims to simulate real-world software development challenges and
solutions within a financial management context.

## #Tech Stack

Server: Node, Express

Database: Mongodb


## Setup

Clone the Repository:
git clone https://github.com/SE1020-IT2070-OOP-DSA-25/project-DilshanAnupriya


## Installation

Install dependencies:
"dependencies": {
"axios": "^1.8.1",
"bcrypt": "^5.1.1",
"bcryptjs": "^3.0.2",
"body-parser": "^1.20.3",
"cron": "^4.1.0",
"dotenv": "^16.4.7",
"express": "^4.21.2",
"jsonwebtoken": "^9.0.2",
"node-cron": "^3.0.3",
"nodemon": "^3.1.9"
},
"devDependencies": {
"@babel/core": "^7.26.9",
"@babel/preset-env": "^7.26.9",
"babel-jest": "^29.7.0",
"jest": "^29.7.0",
"mongoose": "^8.12.1",
"supertest": "^7.0.0"
}
}


bash

cd backend

npm install

## API Reference


#### User login

POST http://localhost:3000/api/v1/user/login

{
"username": "dilshan",
"password": "dilshan"
}
### User signUp

POST http://localhost:3000/api/v1/user/signup

{
"username": "dilshan",
"email": "dilshan@example.com",
"password": "dilshan",
"role": "User",
"preferredCurrency": "LKR"
}
### User update

PUT http://localhost:3000/api/v1/user/update-user

### User delete

DELETE http://localhost:3000/api/v1/dashboard/delete-user/:id

### create transaction

POST http://localhost:3000/api/v1/transaction/create-transaction


{
"userId": "67cfa0028bfb985a1ff4bd22",
"amount": 1200,
"type": "Expense",
"category": "House",
"tags": ["salary"],
"currency": "LKR",
"baseCurrency":"LKR",
"recurrence": true,
"recurrencePattern": "Monthly",
"startDate": "2025-03-01",
"endDate": "2025-12-31"
}

#### get specific transaction

GET http://localhost:3000/api/v1/transaction/find-by/:id'

#### get transaction by tag

GET http://localhost:3000/api/v1/transaction/find-all?searchText=salary&page=1&size=10


#### Update transaction

PUT http://localhost:3000/api/v1/transaction/update-budget/:id

#### Delete transaction

DELETE  http://localhost:3000/api/v1/transaction/delete-budget/:id

### create budget 
POST http://localhost:3000/api/v1/budget/create-budget

{
"userId": "67cfa0028bfb985a1ff4bd22",
"category": "House",
"amount": 3000,
"spent": 0
}

### get all budget and filer

GET http://localhost:3000/api/v1/budget/find-all?SearchText&page=1&size=10

### budget reccomandation

GET http://localhost:3000/api/v1/budget/budget-recommendation/:id

### budget find By id

GET http://localhost:3000/api/v1/budget/find-by/:id

### create goals and savings

POST http://localhost:3000/api/v1/goals&savings/create-goal

{
"userId": "67cfa0028bfb985a1ff4bd22",
"name": "Car",
"targetAmount": 10000,
"currentAmount": 100,
"deadline": "2025-12-31T00:00:00.000Z",
"category": "Car",
"autoAllocate": true,
"allocationPercentage": 10
}

### filter goals and saving 

GET http://localhost:3000/api/v1/goals&savings/find-all?SearchText&page=1&size=10

## find goals and savings 
GET http://localhost:3000/api/v1/goals&savings/find-by/:id

## check goal progress

GET http://localhost:3000/api/v1/goals&savings/progress/:id

## notification 
GET http://localhost:3000/api/v1/notification/budget



## 🚀 About Me

Cooray  B D A

IT22189530

artillery run test.yml
