var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2")

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
            choices: ["View Product Sales by Department", "Create a New Department", "Exit"]
        }
      ]).then(function(data) {
         
          switch(data.login) {
            case "View Product Sales by Department":
                sales();
                break;
            case "Create a New Department":
                department();
                break;
            case "Exit":
            connection.end();
            break; 
          }
        });        
  }
  
  function sales() {
      connection.query (
        `SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS sales, SUM(products.product_sales) - departments.over_head_costs AS total_profit FROM products RIGHT JOIN departments ON (products.department_name=departments.department_name) GROUP BY departments.department_name ORDER BY departments.department_name`, 
        function(err, res) {
            if (err) throw err;
            var myArray = [];
           
            var strung = JSON.stringify(res);
          
           console.log(res)
            var table = new Table({
                head: ['id', 'Name', 'Overhead', 'Sales', 'Total_profit'],
                chars: {
                    'top': '═'
                    , 'top-mid': '╤'
                    , 'top-left': '╔'
                    , 'top-right': '╗'
                    , 'bottom': '═'
                    , 'bottom-mid': '╧'
                    , 'bottom-left': '╚'
                    , 'bottom-right': '╝'
                    , 'left': '║'
                    , 'left-mid': '╟'
                    , 'right': '║'
                    , 'right-mid': '╢'
                  },
                  style: {
                    head: []
                    , border: []
                  }
                });          
        
            for (var i = 0; i < res.length; i++) {
            table.push(
                
                [res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].sales, res[i].total_profit]
             
            );
            } 
            console.log(table.toString());
          
           

          login()  
         })
    
}

function department() {
    inquirer.prompt([

        {
            name: "department",
            message: "Input Name of New Department",
            type: "input",
           
        },
        {
            name: "overhead",
            type: "input",
            message: "Enter Over-Head Costs for New Dept."
        }
    ]).then(function(data) {
        connection.query(
            "INSERT INTO departments SET ?",
            {
                department_name: data.department,
                over_head_costs: data.overhead,
                
            },
            function(err, res) {
                
                if (!err) {console.log("New Department has been Added!!")}
              }
        )

    })    
}