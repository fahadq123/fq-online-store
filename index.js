//Notes:
//ask what port number to use.
//ask what they means by omitted parameter: then update relative cards like cart
				//1) /list    2) /list?id=
//update home
//update database path
//for accepting external http requests: app.use((req, res, next) => { res.header("Access-Control-Allow-Origin", "*"); next(); });
//update host path: currently it's /static
//update where static folder is: html, css and js

//for building app.use(/) service:
//get the parameter from the request then parse it if it's of type JSON object
//set headers in responce including 200 and returned payload type:'Content-Type': 'application/json'

//to delete one item from array: .splice(index, 1);
//to add one item to array at given index: .splice(index, 0, new_item);
//to add to the end of the array: .push(new_item);

//check varibale type by using: typeof then you can print it to console
				//console.log("type of object.qty " + typeof object.qty);


const port = 8000; // put 8000 on workstation, 0 on red

// change these two lines when working in prism

// const home = '/cs/home/fahadq';
// const DB_PATH = home + '/Downloads/hr4413/pkg/sqlite/Models_R_US.db';
const DB_PATH = './Models_R_US.db'
//app.use((req, res, next) => { res.header("Access-Control-Allow-Origin", "*"); next(); });

const net = require('net');
const https = require('https');
const express = require('express');
const session = require('express-session');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(DB_PATH);
var app = express();
app.enable('trust proxy');

app.use(session(
	{
		secret: "mine",
		proxy: true,
		resave: true,
		saveUninitialized: true
	}));

// app.use('/static', express.static(home + "/www/static"));	


app.use("/list", (req, res) => {
	res.header('Access-Control-Allow-Origin', '*');

	let id = req.query.id;
	let query = "select id, name from product where catid = ?";
	db.all(query, [id], (err, rows) => {
		if (err == null) {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(rows));
			// console.log(JSON.stringify(rows));
			res.end();
		}
		else {
			res.end("Error " + err);
		}
	});
});


app.use("/productname", (req, res) => {
	res.header('Access-Control-Allow-Origin', '*');
	let id = req.query.id;
	let query = "select name from product where id = ?";
	db.all(query, [id], (err, name) => {
		if (err == null) {
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.write(name);
			res.end();
		}
		else {
			res.end("Error " + err);
		}
	});
});

app.use("/productinfo", (req, res) => {
	let id = req.query.id;
	let query = "select * from product where id = ?";
	db.all(query, [id], (err, rows) => {
		if (err == null) {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(rows));
			res.end();
		}
		else {
			res.end("Error " + err);
		}
	});
});
app.use('/product', function(req, res)
{
  let id = req.query.id;
  res.header('Access-Control-Allow-Origin', '*');
res.writeHead(200, {'Content-Type' : 'application/json'});
  let query; 
  // sql injection vulnerability:
  //let query = "select id, name from product where catid = " + id;
  //db.all(query, [], (err, rows) =>
  // prepared statement:
  if(id){
    query = "select * from product where id = ?" ;
    db.all(query, [id], (err, rows) =>

    {
      if (err == null)
      {
        res.write(JSON.stringify(rows));
        res.end();
      }
      else
      {
        res.end("Error " + err);
      }
    });
  }
});

app.use('/Catalog', function (req, res) {
	//reading the parameter if exist!
	res.header('Access-Control-Allow-Origin', '*');
	let id = req.query.id;
	// prepared statement:
	let query = "select id, name from Category where id = ?";
	//If the id parameter is missing then the return should be an array of json objects for all rows in the table.
	if (id === undefined) {
		query = "select id, name from Category";
	}
	//[id] is to replace the "?" used in the query
	db.all(query, [id], (err, rows) => {
		if (err == null) {
			//The return should be mimed as "application/json" in the response's content type.
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(rows));
			res.end();
		}
		else {
			res.end("Error " + err);
		}
	});
});


app.use('/cart', function (req, res) {
	
	res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.writeHead(200, { 'Content-Type': 'application/json' });

  if (!req.session.cart) {
    // if cart dosen't exists
    req.session.cart = [];
    if (req.query.item) {
      // if item params exists
      let item = JSON.parse(req.query.item);
      if (item.qty > 0) {
		item.qty = 1;
		req.session.cart.push(item);
		
        res.end(JSON.stringify(req.session.cart));
      } else if (item.qty <= 0) {
		// if qty is 0 or less
		
        res.end(JSON.stringify(req.session.cart));
      }
    } else if (!req.query.item) {
	  // if item param isn't passed in query string
	  
      res.end(JSON.stringify(req.session.cart));
    }
  } else if (req.session.cart) {
	// if the cart exists
    if (!req.query.item) {
	  // if the item param isn't passed
	  
      res.end(JSON.stringify(req.session.cart));
    } else if (req.query.item) {
      // if the item param is passed
      let item = JSON.parse(req.query.item);
      let cart = req.session.cart;
      cart.forEach((e, i) => {
        if (e.id == item.id) {
          // if the item exists in cart
          if (item.qty > 0) {
			e.qty = e.qty + 1;
			
            res.end(JSON.stringify(req.session.cart));
          } else if (item.qty <= 0) {
            // qty passed is 0 or less
            e.qty = e.qty - 1;
            if (e.qty <= 0) {
			  cart.splice(i, 1);
			  
              res.end(JSON.stringify(req.session.cart));
            } else if (e.qty > 0) {
				
              res.end(JSON.stringify(req.session.cart));
            }
          }
        }
      });
      // if the item doesn't exists previously
      if (item.qty > 0) {
		  item.qty = 1;
		cart.push(item);
		
        res.end(JSON.stringify(req.session.cart));
      } else if (item.qty <= 0) {
		
        res.end(JSON.stringify(req.session.cart));
      }
    }
  }
});


// --------------------------------------SERVER
var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Listening at http://%s:%d', host, port);
});
