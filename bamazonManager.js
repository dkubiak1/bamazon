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
      
      inquirer.prompt([

        {
            name: "login",
            message: "Choose an Action",
            type: "list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
        }
      ]).then(function(data) {
         
          switch(data.login) {
              case "View Products for Sale":
                products();
                break;
              case "View Low Inventory":
                inventory();
                break;
              case "Add to Inventory":
                addInv();
                break;
              case "Add New Product":
                addProd();
                break;
              case "Exit":
                
                logOut(); 
                break;


          }
      })
  }

  function products() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        var myArray = [];
        for (var i = 0; i < res.length; i++) {
            myArray.push(res[i].product_name+", ID: "+res[i].product_id+", Price: "+res[i].price+", Quantity: "+res[i].stock_quantity);
            }
                  
       
        inquirer.prompt([
            {
                name: "products",
                type: "list",
                choices: myArray
            }

        ]).then(function(data) {
            login();
        })

        
    });             
}

function inventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity <= 15", function(err, res) {
        if (err) throw err;
        var myArray = [];
        for (var i = 0; i < res.length; i++) {
            myArray.push(res[i].product_name+", ID: "+res[i].product_id+", Price: "+res[i].price+", Quantity: "+res[i].stock_quantity);
            }
        if (myArray.length == 0) {
            console.log("All Inventory is Stocked!!")
            login();
        } else {   
        inquirer.prompt([
            {
                name: "inventory",
                type: "list",
                choices: myArray
            }

            ]).then(function(data) {
                login();
            })
        }
        
    });            

}

function addInv() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        var myArray = [];
        for (var i = 0; i < res.length; i++) {
            myArray.push(res[i].product_name+", ID: "+res[i].product_id+", Price: "+res[i].price+", Quantity: "+res[i].stock_quantity);
            }
       

        inquirer.prompt([
            {
                name: "products",
                type: "list",
                choices: myArray
            },
            {
                name: "restock",
                type: "input",
                message: "How Much Stock to Add?",
                validate: function(value) {
                    if (isNaN(value) === false && parseInt(value) >= 0) {
                      return true;
                    }
                    return false;
                  }
            }

        ]).then(function(data) {
            var myChoice;
            var myStock;
            var quantity;
            var splitted = data.products.split(",");
            var dataName = splitted[0];
            for (var i = 0; i < res.length; i++) {
                if (res[i].product_name == dataName) {
                    myChoice = res[i].product_name;
                    myStock = res[i].stock_quantity;
                   
                }
            
            }
            quantity = (parseInt(data.restock) + parseInt(myStock));  
            console.log("Adding "+data.restock+" "+myChoice+" to inventory");
            connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    stock_quantity: quantity
                  },
                  {
                    product_name: myChoice
                  }
                ],
                function(err) {
                  if (err) throw err;
                         
                });
            login();
        })

        
    });    

}

function addProd() {
    inquirer.prompt([
        {
            name: "what",
            message: "What Product to Add?",
            type: "input",
           
            
        },
        {
            name: "department",
            message: "What Department to Add To?",
            type: "input",
            
         
        },
        {
            name: "price",
            message: "What is the Item Price?",
            type: "input",
           
            
            validate: function(value) {
                 if (isNaN(value) === false && parseInt(value) >= 0) {
                    return true;
                  }
                  return false;
                } 
               
            
        },
        {
            name: "stock",
            message: "How Much Stock to Add?",
            type: "input",
           
            
            validate: function(value) {
                if (isNaN(value) === false && parseInt(value) >= 0) {
                    return true;
                  }
                  return false;
            }
        },  
    ]).then(function(data) {
        
        connection.query(
            
            "INSERT INTO products SET ?",
            {
                product_name: data.what,
                department_name: data.department,
                price: data.price,
                stock_quantity: data.stock
            },
            function(err, res) {
                console.log(err);
               
              }
        )
        console.log("Product Added!!");
        login();
    });

}

function logOut() {
    connection.end();
}