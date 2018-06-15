var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
  
    port: 3306, 
   
    user: "root",  
    password: "root",
    database: "bamazon"
  });
  
  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
   
    login();
    
    
  });

  function login() {

    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        
                
      inquirer.prompt([

       {
            type: 'list',
            name: 'command',
            
            choices: function() {
                var myArray = [];
                    for (var i = 0; i < res.length; i++) {
                    myArray.push(res[i].product_name+", ID: "+res[i].product_id+", Price: "+res[i].price+", Quantity: "+res[i].stock_quantity);
                    }
               
                return myArray;    
            },
            message: 'Choose a Product',
        },
        {
            name: "quantity",
            type: "input",
            message: "How much would you like to purchase?",
            validate: function(value) {
                if (isNaN(value) === false && parseInt(value) > 0) {
                  return true;
                }
                return false;
              }
          }
      ]).then(function(data) {
            var myChoice;
            var myPrice;
            var mySales;
          
            var splitted = data.command.split(",");
        
            var dataName = splitted[0];
            
            for (var i = 0; i < res.length; i++) {
                if (res[i].product_name == dataName) {
                    myChoice = res[i].stock_quantity;
                    myPrice = res[i].price;
                    mySales = res[i].product_sales;
                }
              
            }
          
            var quantity = myChoice - data.quantity;
            var totalCost = (myPrice * data.quantity).toFixed(2);
            var newTotal = (parseInt(totalCost) + parseInt(mySales));
            if (quantity >= 0) {
                console.log("Item purchased successfully! \nTotal cost: "+totalCost);
                purchase(quantity, dataName, newTotal);
            } else {
                console.log("Not Enough Inventory!")
                login();
            }
      })
  })
} 

function purchase(quantity, dataName, newTotal) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: quantity,
            product_sales:  newTotal        
          },
          {
            product_name: dataName
          }
        ],
        function(err) {
          if (err) throw err;
         
        });
        inquirer.prompt([
            {
                name: "menu",
                type: "list",
                message: "Would you like to make another purchase?",
                choices: ["yes", "no"]
              }

        ]).then(function(data) {
            if (data.menu == "yes") {
                login();
            } else {
                connection.end();
            }
        })
        
    }
    